import * as assert from 'assert';
import * as vscode from 'vscode';
import { lintUxml } from '../../uxmlDiagnostics';
import { lintUss } from '../../ussDiagnostics';

// Ensure the extension is fully activated before any test that uses
// language services (code action provider, in particular).
suiteSetup(async function () {
    this.timeout(20_000);
    const ext = vscode.extensions.getExtension('helizac.uxml-uss-language-tools');
    if (ext && !ext.isActive) {
        await ext.activate();
    }
});

async function openUxml(content: string): Promise<vscode.TextDocument> {
    return vscode.workspace.openTextDocument({ language: 'uxml', content });
}

async function openUss(content: string): Promise<vscode.TextDocument> {
    return vscode.workspace.openTextDocument({ language: 'uss', content });
}

function findDiagnostic(diags: vscode.Diagnostic[], substring: string): vscode.Diagnostic | undefined {
    return diags.find(d => d.message.includes(substring));
}

suite('UXML diagnostics', () => {
    test('flags an unknown Unity element with a "did you mean" suggestion', async () => {
        const doc = await openUxml('<engine:Buton text="OK" />');
        const result = lintUxml(doc);
        const diag = findDiagnostic(result.diagnostics, 'Buton');
        assert.ok(diag, 'should produce a diagnostic for "Buton"');
        assert.match(diag!.message, /Did you mean "Button"\?/);
        assert.strictEqual(diag!.source, 'uxml');
    });

    test('does not flag a custom non-Unity-namespaced element', async () => {
        // No engine:/editor: prefix so this is treated as a user-defined control.
        const doc = await openUxml('<my:CustomThing />');
        const result = lintUxml(doc);
        const diag = result.diagnostics.find(d => d.message.includes('CustomThing'));
        assert.strictEqual(diag, undefined, 'custom elements should not produce a diagnostic');
    });

    test('flags an unknown attribute on a known element', async () => {
        const doc = await openUxml('<engine:Button txt="OK" />');
        const diag = findDiagnostic(lintUxml(doc).diagnostics, 'Unknown attribute');
        assert.ok(diag);
        assert.match(diag!.message, /Did you mean "text"\?/);
    });

    test('flags an invalid enum value', async () => {
        const doc = await openUxml('<engine:VisualElement picking-mode="poition" />');
        const diag = findDiagnostic(lintUxml(doc).diagnostics, 'Invalid value');
        assert.ok(diag);
        assert.match(diag!.message, /Did you mean "Position"\?/);
    });

    test('does not flag XML namespace attributes on the root element', async () => {
        const text = '<engine:UXML xmlns:engine="UnityEngine.UIElements" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" />';
        const doc = await openUxml(text);
        const result = lintUxml(doc);
        const xmlnsIssue = result.diagnostics.find(d => d.message.includes('xmlns'));
        assert.strictEqual(xmlnsIssue, undefined);
    });

    test('quick fix replaces unknown element with the suggestion', async () => {
        const doc = await openUxml('<engine:Buton />');
        const result = lintUxml(doc);
        const diag = result.diagnostics[0];

        // Simulate the editor invoking the code action provider on this diagnostic.
        const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
            'vscode.executeCodeActionProvider',
            doc.uri,
            diag.range,
            vscode.CodeActionKind.QuickFix.value,
        );
        assert.ok(actions && actions.length > 0, 'expected at least one code action');
        const replace = actions!.find(a => a.title.includes('Button'));
        assert.ok(replace, `expected a "Replace with Button" quick fix; got titles: ${actions!.map(a => a.title).join(', ')}`);
        assert.ok(replace!.edit, 'quick fix should carry a WorkspaceEdit');
    });
});

suite('USS diagnostics', () => {
    test('flags an unknown property with a suggestion', async () => {
        const doc = await openUss('.btn { colr: red; }');
        const diag = findDiagnostic(lintUss(doc).diagnostics, 'Unknown USS property');
        assert.ok(diag);
        assert.match(diag!.message, /Did you mean "color"\?/);
    });

    test('flags an invalid value for a known property', async () => {
        const doc = await openUss('.btn { flex-direction: rowx; }');
        const diag = findDiagnostic(lintUss(doc).diagnostics, 'Invalid value');
        assert.ok(diag);
        assert.match(diag!.message, /Did you mean "row"\?/);
    });

    test('accepts custom CSS variables (--*)', async () => {
        const doc = await openUss('.btn { --my-var: 12px; }');
        const result = lintUss(doc);
        const issue = result.diagnostics.find(d => d.message.includes('--my-var'));
        assert.strictEqual(issue, undefined);
    });

    test('does not flag values containing function calls or numbers', async () => {
        const doc = await openUss('.btn { background-color: rgb(255, 0, 0); width: 12px; }');
        assert.strictEqual(lintUss(doc).diagnostics.length, 0);
    });

    test('comments do not produce false positives', async () => {
        const doc = await openUss('/* colr: red; */ .btn { color: red; }');
        const result = lintUss(doc);
        const inComment = result.diagnostics.find(d => d.message.includes('colr'));
        assert.strictEqual(inComment, undefined, 'should not flag identifiers inside block comments');
    });

    test('quick fix replaces unknown property', async () => {
        const doc = await openUss('.btn { colr: red; }');
        const diag = lintUss(doc).diagnostics[0];

        const actions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
            'vscode.executeCodeActionProvider',
            doc.uri,
            diag.range,
            vscode.CodeActionKind.QuickFix.value,
        );
        assert.ok(actions && actions.length > 0);
        const replace = actions!.find(a => a.title.includes('color'));
        assert.ok(replace, `expected a "Replace with color" quick fix`);
    });
});
