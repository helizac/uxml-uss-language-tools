import * as vscode from 'vscode';
import { USS_PROPERTIES, PROPERTY_BY_NAME, UssProperty } from './ussProperties';
import { UNITY_ELEMENTS } from './unityElements';

/**
 * Heuristics-based context detector for the cursor position inside a USS document.
 * Exported for unit testing.
 */
export type UssContext =
    | { kind: 'selector' }                                  // outside any rule block
    | { kind: 'propertyName' }                              // inside a rule block, before any ':'
    | { kind: 'propertyValue'; propertyName: string };      // after `prop:` and before `;` or `}`

export function detectUssContext(textBefore: string): UssContext {
    // Walk backwards through textBefore, ignoring comments.
    // Key transitions to track:
    //   - `{` increases brace depth
    //   - `}` decreases brace depth
    //   - `;` or `{` resets the per-declaration state
    //   - `:` after a property name puts us into propertyValue (until `;` or `}`)

    // Strip /* ... */ comments first to simplify the rest.
    const noComments = textBefore.replace(/\/\*[\s\S]*?\*\//g, '');

    // Walk through and remember brace depth and the most recent declaration boundary.
    let depth = 0;
    let lastBoundary = 0; // index in noComments where the current declaration / selector starts
    for (let i = 0; i < noComments.length; i++) {
        const c = noComments[i];
        if (c === '{') { depth++; lastBoundary = i + 1; }
        else if (c === '}') { depth = Math.max(0, depth - 1); lastBoundary = i + 1; }
        else if (c === ';') { lastBoundary = i + 1; }
    }

    if (depth === 0) {
        return { kind: 'selector' };
    }

    // Inside a rule block. Look at the slice from the last boundary to now.
    const slice = noComments.slice(lastBoundary);
    const colonIdx = slice.indexOf(':');

    if (colonIdx < 0) {
        return { kind: 'propertyName' };
    }

    const propertyName = slice.slice(0, colonIdx).trim();
    return { kind: 'propertyValue', propertyName };
}

export class UssCompletionProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): vscode.CompletionItem[] {
        const textBefore = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const ctx = detectUssContext(textBefore);

        switch (ctx.kind) {
            case 'selector':
                return this.completeSelectors();
            case 'propertyName':
                return this.completeProperties();
            case 'propertyValue':
                return this.completePropertyValues(ctx.propertyName);
        }
    }

    private completeSelectors(): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // Add Unity element type selectors (Button, Label, ...).
        for (const el of UNITY_ELEMENTS) {
            const item = new vscode.CompletionItem(el.name, vscode.CompletionItemKind.Class);
            item.detail = 'Unity element selector';
            item.documentation = new vscode.MarkdownString(`Selects all \`${el.name}\` elements. ${el.description}`);
            items.push(item);
        }

        // Common pseudo-classes.
        const pseudos = ['hover', 'active', 'focus', 'disabled', 'enabled', 'checked', 'root', 'inactive', 'selected'];
        for (const p of pseudos) {
            const item = new vscode.CompletionItem(`:${p}`, vscode.CompletionItemKind.Keyword);
            item.detail = 'Pseudo-class';
            items.push(item);
        }

        return items;
    }

    private completeProperties(): vscode.CompletionItem[] {
        return USS_PROPERTIES.map(p => {
            const item = new vscode.CompletionItem(
                p.name,
                p.unitySpecific ? vscode.CompletionItemKind.Method : vscode.CompletionItemKind.Property,
            );
            item.detail = p.unitySpecific ? 'Unity USS property' : 'USS property';
            item.documentation = new vscode.MarkdownString(p.description);
            item.insertText = new vscode.SnippetString(`${p.name}: $1;`);
            // Sort Unity-specific properties just below their CSS counterparts.
            item.sortText = (p.unitySpecific ? '1' : '0') + p.name;
            return item;
        });
    }

    private completePropertyValues(propertyName: string): vscode.CompletionItem[] {
        const property = PROPERTY_BY_NAME.get(propertyName);
        if (!property || !property.values) {
            return [];
        }
        return property.values.map(v => {
            const item = new vscode.CompletionItem(v, vscode.CompletionItemKind.EnumMember);
            item.detail = `${propertyName} value`;
            return item;
        });
    }
}

export class UssHoverProvider implements vscode.HoverProvider {
    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): vscode.Hover | undefined {
        // Properties can include a `-unity-` prefix and dashes, so allow those in the word range.
        const range = document.getWordRangeAtPosition(position, /-?-?[\w-]+/);
        if (!range) {
            return undefined;
        }
        const word = document.getText(range);
        const property = PROPERTY_BY_NAME.get(word);

        if (!property) {
            return undefined;
        }

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**\`${property.name}\`**${property.unitySpecific ? ' *(Unity-specific)*' : ''}\n\n`);
        md.appendMarkdown(property.description);
        if (property.values && property.values.length > 0) {
            md.appendMarkdown(`\n\n*Values:* ${property.values.map(v => `\`${v}\``).join(', ')}`);
        }
        return new vscode.Hover(md, range);
    }
}
