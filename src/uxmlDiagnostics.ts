import * as vscode from 'vscode';
import { ELEMENT_BY_NAME, VISUAL_ELEMENT_ATTRIBUTES, UnityAttribute } from './unityElements';
import { closestMatch, rangeKey } from './util';

/** Unity namespace prefixes commonly seen in UXML files. */
const UNITY_NAMESPACES = new Set(['engine', 'editor', 'ui', 'uie']);

/**
 * The result of linting one document: a list of diagnostics plus a sidecar
 * map of suggestions, keyed by the range of the diagnostic. The code action
 * provider reads from the suggestions map to build quick-fix entries.
 */
export interface UxmlLintResult {
    diagnostics: vscode.Diagnostic[];
    suggestions: Map<string, string>;
}

/** Heuristic linter — pure function of the document text. */
export function lintUxml(document: vscode.TextDocument): UxmlLintResult {
    const text = document.getText();
    // Mask comments out so we don't try to validate text inside them.
    // Replace every non-newline character of a comment with a space, preserving
    // overall length so document offsets stay correct.
    const masked = text.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '));

    const diagnostics: vscode.Diagnostic[] = [];
    const suggestions = new Map<string, string>();

    // Match each element opening tag. We deliberately accept self-closing too.
    const tagRe = /<(\/?)([\w]+:)?([\w][\w.-]*)([^<>]*?)\/?>/g;
    let m: RegExpExecArray | null;

    while ((m = tagRe.exec(masked)) !== null) {
        const slash = m[1];
        const ns = m[2] ? m[2].slice(0, -1) : '';
        const elementName = m[3];
        const attrText = m[4];
        const tagOuterStart = m.index;
        const elementNameStart = tagOuterStart + 1 + slash.length + (m[2]?.length ?? 0);
        const attrTextStart = elementNameStart + elementName.length;

        const isClosingTag = slash === '/';

        // --- Element name validation ---
        // Only flag when the user clearly meant a Unity element (recognised namespace prefix).
        // We also skip the document root <UXML> element which lives under the engine namespace
        // even though it isn't in our control catalogue under that exact name in all configurations.
        if (!isClosingTag && UNITY_NAMESPACES.has(ns) && !ELEMENT_BY_NAME.has(elementName)) {
            const range = makeRange(document, elementNameStart, elementName.length);
            const candidates = [...ELEMENT_BY_NAME.keys()];
            const suggestion = closestMatch(elementName, candidates);
            const diag = new vscode.Diagnostic(
                range,
                `Unknown Unity UI element "${elementName}"` + (suggestion ? `. Did you mean "${suggestion}"?` : ''),
                vscode.DiagnosticSeverity.Warning,
            );
            diag.source = 'uxml';
            diag.code = 'unknown-element';
            diagnostics.push(diag);
            if (suggestion) {
                suggestions.set(rangeKey(range), suggestion);
            }
        }

        // --- Attribute validation (only for known elements) ---
        if (!isClosingTag) {
            const knownElement = ELEMENT_BY_NAME.get(elementName);
            const allAttrs: UnityAttribute[] | null = knownElement
                ? [...VISUAL_ELEMENT_ATTRIBUTES, ...knownElement.attributes]
                : null;
            const knownAttrNames = allAttrs ? new Set(allAttrs.map(a => a.name)) : null;

            const attrRe = /([\w][\w:.\-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
            let am: RegExpExecArray | null;

            while ((am = attrRe.exec(attrText)) !== null) {
                const attrName = am[1];
                const attrValue = am[3] !== undefined ? am[3] : am[4];
                const attrNameRel = am.index;
                const attrNameAbs = attrTextStart + attrNameRel;

                // Locate the value's start position by finding the opening quote within match[0].
                const quoteRel = am[0].lastIndexOf(am[2]);
                const valueAbs = attrTextStart + attrNameRel + quoteRel + 1;

                // Skip XML-namespace bookkeeping attributes — those aren't UXML-defined.
                if (attrName.startsWith('xmlns') || attrName.startsWith('xsi:')) {
                    continue;
                }

                // Unknown attribute on a known element.
                if (knownAttrNames && !knownAttrNames.has(attrName)) {
                    const range = makeRange(document, attrNameAbs, attrName.length);
                    const candidates = [...knownAttrNames];
                    const suggestion = closestMatch(attrName, candidates);
                    const diag = new vscode.Diagnostic(
                        range,
                        `Unknown attribute "${attrName}" on <${elementName}>` + (suggestion ? `. Did you mean "${suggestion}"?` : ''),
                        vscode.DiagnosticSeverity.Warning,
                    );
                    diag.source = 'uxml';
                    diag.code = 'unknown-attribute';
                    diagnostics.push(diag);
                    if (suggestion) {
                        suggestions.set(rangeKey(range), suggestion);
                    }
                    continue;
                }

                // Invalid enum value for a known attribute.
                if (allAttrs) {
                    const attr = allAttrs.find(a => a.name === attrName);
                    if (attr?.values && !attr.values.includes(attrValue)) {
                        const range = makeRange(document, valueAbs, attrValue.length);
                        const suggestion = closestMatch(attrValue, attr.values);
                        const diag = new vscode.Diagnostic(
                            range,
                            `Invalid value "${attrValue}" for attribute "${attrName}". ` +
                                `Allowed: ${attr.values.join(', ')}` +
                                (suggestion ? `. Did you mean "${suggestion}"?` : ''),
                            vscode.DiagnosticSeverity.Warning,
                        );
                        diag.source = 'uxml';
                        diag.code = 'invalid-value';
                        diagnostics.push(diag);
                        if (suggestion) {
                            suggestions.set(rangeKey(range), suggestion);
                        }
                    }
                }
            }
        }
    }

    return { diagnostics, suggestions };
}

function makeRange(document: vscode.TextDocument, offset: number, length: number): vscode.Range {
    return new vscode.Range(
        document.positionAt(offset),
        document.positionAt(offset + length),
    );
}

/** Code action provider that offers a "Replace with …" quick fix for each suggestion. */
export class UxmlCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    public provideCodeActions(
        document: vscode.TextDocument,
        _range: vscode.Range,
        context: vscode.CodeActionContext,
    ): vscode.CodeAction[] {
        if (!context.diagnostics.some(d => d.source === 'uxml')) {
            return [];
        }
        // Re-run the linter so we have access to the suggestion map. Linting one
        // document is fast (microseconds) and this avoids carrying mutable state.
        const { suggestions } = lintUxml(document);
        const actions: vscode.CodeAction[] = [];

        for (const diag of context.diagnostics) {
            if (diag.source !== 'uxml') {
                continue;
            }
            const suggestion = suggestions.get(rangeKey(diag.range));
            if (!suggestion) {
                continue;
            }
            const action = new vscode.CodeAction(
                `Replace with "${suggestion}"`,
                vscode.CodeActionKind.QuickFix,
            );
            action.edit = new vscode.WorkspaceEdit();
            action.edit.replace(document.uri, diag.range, suggestion);
            action.diagnostics = [diag];
            action.isPreferred = true;
            actions.push(action);
        }
        return actions;
    }
}
