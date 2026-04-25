import * as assert from 'assert';
import * as vscode from 'vscode';

// Make sure the extension is fully activated before any test that touches
// the registered providers runs. Without this the very first call to
// `executeCompletionItemProvider` can race with `onLanguage:uxml` activation
// and come back empty, even though every subsequent call succeeds.
suiteSetup(async function () {
    this.timeout(20_000);
    const ext = vscode.extensions.getExtension('helizac.uxml-uss-language-tools');
    if (ext && !ext.isActive) {
        await ext.activate();
    }
});

/**
 * Helper: opens an in-memory document of the given language with the given text
 * and immediately returns the document and a position based on a `|` cursor marker
 * in the text. The marker is removed before the document is created.
 */
async function openDocWithCursor(
    language: 'uxml' | 'uss',
    textWithCursor: string,
): Promise<{ doc: vscode.TextDocument; position: vscode.Position }> {
    const cursorOffset = textWithCursor.indexOf('|');
    assert.ok(cursorOffset >= 0, "test text must contain a '|' marker for the cursor");
    const text = textWithCursor.slice(0, cursorOffset) + textWithCursor.slice(cursorOffset + 1);

    const doc = await vscode.workspace.openTextDocument({ language, content: text });
    const position = doc.positionAt(cursorOffset);
    return { doc, position };
}

/** Trigger the built-in completion command and return the items. */
async function getCompletions(
    doc: vscode.TextDocument,
    position: vscode.Position,
): Promise<vscode.CompletionItem[]> {
    const list = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        doc.uri,
        position,
    );
    return list?.items ?? [];
}

async function getHovers(
    doc: vscode.TextDocument,
    position: vscode.Position,
): Promise<vscode.Hover[]> {
    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        doc.uri,
        position,
    );
    return hovers ?? [];
}

function labelOf(item: vscode.CompletionItem): string {
    return typeof item.label === 'string' ? item.label : item.label.label;
}

suite('Extension activation', () => {
    test('extension is present', () => {
        const ext = vscode.extensions.getExtension('helizac.uxml-uss-language-tools');
        assert.ok(ext, 'extension should be installed in the test host');
    });

    test('UXML language is registered', async () => {
        const langs = await vscode.languages.getLanguages();
        assert.ok(langs.includes('uxml'), 'language id "uxml" should be registered');
    });

    test('USS language is registered', async () => {
        const langs = await vscode.languages.getLanguages();
        assert.ok(langs.includes('uss'), 'language id "uss" should be registered');
    });
});

suite('UXML completion', () => {
    test('suggests engine:Button when typing inside a tag', async () => {
        const { doc, position } = await openDocWithCursor('uxml', '<|');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        assert.ok(labels.includes('Button'), `expected "Button" in completions, got [${labels.slice(0, 10).join(', ')}...]`);
        assert.ok(labels.includes('Toggle'), 'expected "Toggle" in completions');
    });

    test('suggests Toggle attributes inside a Toggle tag', async () => {
        const { doc, position } = await openDocWithCursor('uxml', '<engine:Toggle |');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        // Element-specific
        assert.ok(labels.includes('value'), 'should suggest the Toggle-specific "value" attribute');
        assert.ok(labels.includes('label'), 'should suggest the Toggle "label" attribute');
        // Inherited from VisualElement
        assert.ok(labels.includes('name'), 'should suggest the inherited "name" attribute');
        assert.ok(labels.includes('class'), 'should suggest the inherited "class" attribute');
    });

    test('suggests true/false for Toggle.value', async () => {
        const { doc, position } = await openDocWithCursor('uxml', '<engine:Toggle value="|"');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        assert.ok(labels.includes('true'), 'should offer "true" as a value');
        assert.ok(labels.includes('false'), 'should offer "false" as a value');
    });

    test('suggests Position/Ignore for picking-mode', async () => {
        const { doc, position } = await openDocWithCursor('uxml', '<engine:VisualElement picking-mode="|"');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        assert.ok(labels.includes('Position'));
        assert.ok(labels.includes('Ignore'));
    });
});

suite('USS completion', () => {
    test('suggests USS properties inside a rule block', async () => {
        const { doc, position } = await openDocWithCursor('uss', '.btn {\n    |\n}');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        assert.ok(labels.includes('flex-direction'), 'should suggest "flex-direction"');
        assert.ok(labels.includes('color'), 'should suggest "color"');
        assert.ok(labels.includes('-unity-text-align'), 'should suggest the Unity property "-unity-text-align"');
    });

    test('suggests values for flex-direction', async () => {
        const { doc, position } = await openDocWithCursor('uss', '.btn {\n    flex-direction: |\n}');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        assert.ok(labels.includes('row'));
        assert.ok(labels.includes('column'));
        assert.ok(labels.includes('row-reverse'));
        assert.ok(labels.includes('column-reverse'));
    });

    test('suggests values for -unity-text-align', async () => {
        const { doc, position } = await openDocWithCursor('uss', '.btn {\n    -unity-text-align: |\n}');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        assert.ok(labels.includes('upper-left'));
        assert.ok(labels.includes('middle-center'));
        assert.ok(labels.includes('lower-right'));
    });

    test('suggests element selectors at top level', async () => {
        const { doc, position } = await openDocWithCursor('uss', '|');
        const items = await getCompletions(doc, position);
        const labels = items.map(labelOf);
        assert.ok(labels.includes('Button'), 'should suggest Button as a selector');
        assert.ok(labels.includes(':hover'), 'should suggest :hover pseudo-class');
    });
});

suite('UXML hover', () => {
    test('hover on Button shows docs', async () => {
        const text = '<engine:Button name="ok" />';
        const doc = await vscode.workspace.openTextDocument({ language: 'uxml', content: text });
        // Position inside "Button" — the word starts after "<engine:".
        const position = new vscode.Position(0, text.indexOf('Button') + 2);
        const hovers = await getHovers(doc, position);
        assert.ok(hovers.length > 0, 'should return at least one hover');
        const md = hovers[0].contents.map(c => (c as vscode.MarkdownString).value).join('\n');
        assert.ok(md.includes('Button'), `hover should mention "Button"; got: ${md}`);
        assert.ok(md.toLowerCase().includes('clickable'), 'hover should describe the button');
    });
});

suite('USS hover', () => {
    test('hover on flex-direction shows docs', async () => {
        const text = '.btn { flex-direction: row; }';
        const doc = await vscode.workspace.openTextDocument({ language: 'uss', content: text });
        const position = new vscode.Position(0, text.indexOf('flex-direction') + 2);
        const hovers = await getHovers(doc, position);
        assert.ok(hovers.length > 0, 'should return at least one hover');
        const md = hovers[0].contents.map(c => (c as vscode.MarkdownString).value).join('\n');
        assert.ok(md.includes('flex-direction'));
    });

    test('hover on -unity-text-align is recognised as Unity-specific', async () => {
        const text = '.btn { -unity-text-align: middle-center; }';
        const doc = await vscode.workspace.openTextDocument({ language: 'uss', content: text });
        const position = new vscode.Position(0, text.indexOf('-unity-text-align') + 5);
        const hovers = await getHovers(doc, position);
        assert.ok(hovers.length > 0);
        const md = hovers[0].contents.map(c => (c as vscode.MarkdownString).value).join('\n');
        assert.ok(md.toLowerCase().includes('unity'));
    });
});
