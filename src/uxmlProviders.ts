import * as vscode from 'vscode';
import { UNITY_ELEMENTS, ELEMENT_BY_NAME, VISUAL_ELEMENT_ATTRIBUTES, UnityElement, UnityAttribute } from './unityElements';

/**
 * Heuristics-based context detector for the cursor position inside a UXML document.
 * We don't run a full XML parser here — for the purpose of completion, looking
 * at the slice from the start of the document up to the cursor is enough.
 */
export type UxmlContext =
    | { kind: 'tag'; namespacePrefix: string }     // user is typing an element name, e.g. "<engine:But"
    | { kind: 'attributeName'; tagName: string }   // cursor is inside a tag, after the name, e.g. "<Button t"
    | { kind: 'attributeValue'; tagName: string; attributeName: string } // cursor is inside an attribute's quoted value
    | { kind: 'text' };                            // cursor is in element content

/**
 * Look at the document text up to `offset` and figure out where we are.
 * Exported so it can be unit-tested independently of the VS Code APIs.
 */
export function detectContext(textBefore: string): UxmlContext {
    // Find the last `<` and `>` in the slice. If `<` is more recent we are inside a tag.
    const lastOpen = textBefore.lastIndexOf('<');
    const lastClose = textBefore.lastIndexOf('>');

    if (lastOpen <= lastClose) {
        return { kind: 'text' };
    }

    // We are inside a tag: textBefore.slice(lastOpen) is something like "<engine:Button text=\"OK"
    const tagSlice = textBefore.slice(lastOpen + 1);

    // Skip XML declaration and comments — they are not element tags.
    if (tagSlice.startsWith('?') || tagSlice.startsWith('!')) {
        return { kind: 'text' };
    }

    // Match the element name (with optional namespace prefix). Allow trailing characters to mean "still typing".
    const nameMatch = tagSlice.match(/^\/?([\w][\w-]*:)?([\w][\w-]*)?/);
    const namespacePrefix = nameMatch?.[1]?.replace(':', '') ?? '';
    const elementName = nameMatch?.[2] ?? '';

    const afterName = tagSlice.slice(nameMatch?.[0].length ?? 0);

    if (afterName.length === 0) {
        // Still typing the element name itself.
        return { kind: 'tag', namespacePrefix };
    }

    // Count quotes in `afterName` to decide if we're inside an attribute value.
    let inDouble = false;
    let inSingle = false;
    let lastEqualsAttrName: string | null = null;

    // Scan the rest of the tag slice tracking quote state and the most recent attribute name before `=`.
    const attrTokens = afterName;
    let i = 0;
    while (i < attrTokens.length) {
        const c = attrTokens[i];
        if (!inDouble && !inSingle) {
            // Try to match an attribute name followed by '='
            const m = attrTokens.slice(i).match(/^([\w:][\w:.-]*)\s*=\s*/);
            if (m) {
                lastEqualsAttrName = m[1];
                i += m[0].length;
                continue;
            }
            if (c === '"') { inDouble = true; i++; continue; }
            if (c === "'") { inSingle = true; i++; continue; }
            i++;
            continue;
        }
        // Inside a quoted attribute value: just scan until the matching quote.
        if (inDouble && c === '"') { inDouble = false; lastEqualsAttrName = null; }
        else if (inSingle && c === "'") { inSingle = false; lastEqualsAttrName = null; }
        i++;
    }

    if (inDouble || inSingle) {
        return {
            kind: 'attributeValue',
            tagName: elementName,
            attributeName: lastEqualsAttrName ?? '',
        };
    }

    return { kind: 'attributeName', tagName: elementName };
}

export class UxmlCompletionProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): vscode.CompletionItem[] {
        const textBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const ctx = detectContext(textBefore);

        switch (ctx.kind) {
            case 'tag':
                return this.completeElementNames(ctx.namespacePrefix);
            case 'attributeName':
                return this.completeAttributeNames(ctx.tagName);
            case 'attributeValue':
                return this.completeAttributeValues(ctx.tagName, ctx.attributeName);
            default:
                return [];
        }
    }

    private completeElementNames(prefix: string): vscode.CompletionItem[] {
        return UNITY_ELEMENTS.map(el => {
            const item = new vscode.CompletionItem(el.name, vscode.CompletionItemKind.Class);
            item.detail = `${el.namespace}.${el.name}`;
            item.documentation = new vscode.MarkdownString(el.description);
            // If the user already typed a namespace prefix, we shouldn't insert one;
            // otherwise, suggest qualifying the element with the engine: prefix.
            if (!prefix) {
                const ns = el.namespace === 'UnityEditor.UIElements' ? 'editor' : 'engine';
                item.insertText = `${ns}:${el.name}`;
                item.filterText = el.name;
            }
            return item;
        });
    }

    private completeAttributeNames(tagName: string): vscode.CompletionItem[] {
        const element = ELEMENT_BY_NAME.get(tagName);

        // Always include the VisualElement-inherited attributes.
        const attrs: UnityAttribute[] = [...VISUAL_ELEMENT_ATTRIBUTES];

        if (element) {
            // Avoid duplicates if the element overrides any of the inherited attributes.
            for (const a of element.attributes) {
                if (!attrs.some(x => x.name === a.name)) {
                    attrs.push(a);
                }
            }
        }

        return attrs.map(a => {
            const item = new vscode.CompletionItem(a.name, vscode.CompletionItemKind.Property);
            item.detail = a.type;
            item.documentation = new vscode.MarkdownString(a.description);
            item.insertText = new vscode.SnippetString(`${a.name}="$1"`);
            return item;
        });
    }

    private completeAttributeValues(tagName: string, attributeName: string): vscode.CompletionItem[] {
        const element = ELEMENT_BY_NAME.get(tagName);
        const allAttrs: UnityAttribute[] = [...VISUAL_ELEMENT_ATTRIBUTES, ...(element?.attributes ?? [])];
        const attr = allAttrs.find(a => a.name === attributeName);

        if (!attr || !attr.values) {
            return [];
        }

        return attr.values.map(v => {
            const item = new vscode.CompletionItem(v, vscode.CompletionItemKind.Value);
            item.detail = `${attributeName} value`;
            return item;
        });
    }
}

/**
 * Hover provider for UXML — surfaces docs for the element directly under the cursor.
 */
export class UxmlHoverProvider implements vscode.HoverProvider {
    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): vscode.Hover | undefined {
        // Word range for an element/attribute name (allow ':' in the prefix and '-' in attribute names).
        const range = document.getWordRangeAtPosition(position, /[\w][\w:.-]*/);
        if (!range) {
            return undefined;
        }
        const word = document.getText(range);

        // Strip namespace prefix if present.
        const bare = word.includes(':') ? word.split(':').slice(-1)[0]! : word;

        // Is the cursor on an element (right after `<` or `</`)?
        const lineText = document.lineAt(position.line).text;
        const before = lineText.slice(0, range.start.character);
        const isElement = /<\/?\s*[\w:.-]*$/.test(before);

        if (isElement) {
            const element = ELEMENT_BY_NAME.get(bare);
            if (element) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`### \`${element.name}\`\n`);
                md.appendMarkdown(`*Namespace:* \`${element.namespace}\`\n\n`);
                md.appendMarkdown(`${element.description}\n\n`);
                md.appendMarkdown(`*Bindable:* ${element.bindable ? 'yes' : 'no'}\n`);
                return new vscode.Hover(md, range);
            }
        }

        // Otherwise: try to interpret the word as an attribute name.
        const attribute = [...VISUAL_ELEMENT_ATTRIBUTES, ...UNITY_ELEMENTS.flatMap(e => e.attributes)]
            .find(a => a.name === bare);

        if (attribute) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`**\`${attribute.name}\`** *(${attribute.type})*\n\n`);
            md.appendMarkdown(attribute.description);
            if (attribute.values && attribute.values.length > 0) {
                md.appendMarkdown(`\n\n*Values:* ${attribute.values.map(v => `\`${v}\``).join(', ')}`);
            }
            return new vscode.Hover(md, range);
        }

        return undefined;
    }
}
