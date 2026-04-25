import * as vscode from 'vscode';
import { PROPERTY_BY_NAME } from './ussProperties';
import { closestMatch, rangeKey } from './util';

export interface UssLintResult {
    diagnostics: vscode.Diagnostic[];
    suggestions: Map<string, string>;
}

/** Heuristic linter for USS — pure function of the document text. */
export function lintUss(document: vscode.TextDocument): UssLintResult {
    const text = document.getText();
    // Mask block comments. Replace inside the comment with spaces (preserve newlines)
    // so character offsets survive the masking step.
    const masked = text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

    const diagnostics: vscode.Diagnostic[] = [];
    const suggestions = new Map<string, string>();

    // Single-pass scan tracking brace depth. We only consider declarations
    // when we're inside a rule block (depth > 0).
    let i = 0;
    let depth = 0;

    while (i < masked.length) {
        const c = masked[i];

        if (c === '{') {
            depth++;
            i++;
            continue;
        }
        if (c === '}') {
            depth = Math.max(0, depth - 1);
            i++;
            continue;
        }
        // Whitespace and stray punctuation between declarations.
        if (depth === 0 || /\s|;/.test(c)) {
            i++;
            continue;
        }

        // Inside a rule block, at a non-whitespace character — try to read a property name.
        if (/[a-zA-Z\-]/.test(c)) {
            const propStart = i;
            while (i < masked.length && /[\w-]/.test(masked[i])) {
                i++;
            }
            const propName = masked.slice(propStart, i);

            // Skip whitespace between name and ':'.
            while (i < masked.length && /\s/.test(masked[i])) {
                i++;
            }
            if (masked[i] !== ':') {
                // Wasn't a declaration after all — selector remnant or malformed input.
                continue;
            }
            i++; // consume ':'
            // Skip whitespace before value.
            while (i < masked.length && /[ \t]/.test(masked[i])) {
                i++;
            }
            const valueStart = i;
            while (i < masked.length && masked[i] !== ';' && masked[i] !== '}') {
                i++;
            }
            const valueText = masked.slice(valueStart, i).trim();

            emitForDeclaration(document, propName, propStart, valueText, valueStart, diagnostics, suggestions);
            continue;
        }

        // Anything else: skip to next character.
        i++;
    }

    return { diagnostics, suggestions };
}

function emitForDeclaration(
    document: vscode.TextDocument,
    propName: string,
    propStart: number,
    valueText: string,
    valueStart: number,
    diagnostics: vscode.Diagnostic[],
    suggestions: Map<string, string>,
): void {
    // Custom CSS variables (--foo) are valid by definition — don't flag them.
    if (propName.startsWith('--')) {
        return;
    }

    const known = PROPERTY_BY_NAME.get(propName);
    if (!known) {
        const range = makeRange(document, propStart, propName.length);
        const suggestion = closestMatch(propName, [...PROPERTY_BY_NAME.keys()]);
        const diag = new vscode.Diagnostic(
            range,
            `Unknown USS property "${propName}"` + (suggestion ? `. Did you mean "${suggestion}"?` : ''),
            // Information rather than Warning — newer Unity versions may add properties we don't yet know about.
            vscode.DiagnosticSeverity.Information,
        );
        diag.source = 'uss';
        diag.code = 'unknown-property';
        diagnostics.push(diag);
        if (suggestion) {
            suggestions.set(rangeKey(range), suggestion);
        }
        return;
    }

    // Validate enum values for properties that have a finite value list,
    // but skip when the value contains a function call, var(), a color literal,
    // or other non-keyword content that we can't easily check with a name set.
    if (known.values && valueText.length > 0 && /^[a-z\-]+$/i.test(valueText) && !known.values.includes(valueText)) {
        const range = makeRange(document, valueStart, valueText.length);
        const suggestion = closestMatch(valueText, known.values);
        const diag = new vscode.Diagnostic(
            range,
            `Invalid value "${valueText}" for "${propName}". ` +
                `Allowed: ${known.values.join(', ')}` +
                (suggestion ? `. Did you mean "${suggestion}"?` : ''),
            vscode.DiagnosticSeverity.Warning,
        );
        diag.source = 'uss';
        diag.code = 'invalid-value';
        diagnostics.push(diag);
        if (suggestion) {
            suggestions.set(rangeKey(range), suggestion);
        }
    }
}

function makeRange(document: vscode.TextDocument, offset: number, length: number): vscode.Range {
    return new vscode.Range(
        document.positionAt(offset),
        document.positionAt(offset + length),
    );
}

export class UssCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    public provideCodeActions(
        document: vscode.TextDocument,
        _range: vscode.Range,
        context: vscode.CodeActionContext,
    ): vscode.CodeAction[] {
        if (!context.diagnostics.some(d => d.source === 'uss')) {
            return [];
        }
        const { suggestions } = lintUss(document);
        const actions: vscode.CodeAction[] = [];

        for (const diag of context.diagnostics) {
            if (diag.source !== 'uss') {
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
