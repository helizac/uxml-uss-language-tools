import * as vscode from 'vscode';
import { UxmlCompletionProvider, UxmlHoverProvider } from './uxmlProviders';
import { UssCompletionProvider, UssHoverProvider } from './ussProviders';
import { lintUxml, UxmlCodeActionProvider } from './uxmlDiagnostics';
import { lintUss, UssCodeActionProvider } from './ussDiagnostics';

export function activate(context: vscode.ExtensionContext): void {
    // ---- Completion + hover (UXML) ----
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: 'uxml', scheme: 'file' },
            new UxmlCompletionProvider(),
            '<', ' ', '"', "'",
        ),
        vscode.languages.registerCompletionItemProvider(
            { language: 'uxml', scheme: 'untitled' },
            new UxmlCompletionProvider(),
            '<', ' ', '"', "'",
        ),
        vscode.languages.registerHoverProvider({ language: 'uxml' }, new UxmlHoverProvider()),
    );

    // ---- Completion + hover (USS) ----
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            { language: 'uss', scheme: 'file' },
            new UssCompletionProvider(),
            ' ', ':', '-',
        ),
        vscode.languages.registerCompletionItemProvider(
            { language: 'uss', scheme: 'untitled' },
            new UssCompletionProvider(),
            ' ', ':', '-',
        ),
        vscode.languages.registerHoverProvider({ language: 'uss' }, new UssHoverProvider()),
    );

    // ---- Diagnostics + quick fixes ----
    const diagnostics = vscode.languages.createDiagnosticCollection('unity-ui-toolkit');
    context.subscriptions.push(diagnostics);

    const updateDiagnostics = (document: vscode.TextDocument): void => {
        if (document.languageId === 'uxml') {
            diagnostics.set(document.uri, lintUxml(document).diagnostics);
        } else if (document.languageId === 'uss') {
            diagnostics.set(document.uri, lintUss(document).diagnostics);
        }
    };

    // Lint already-open documents on activation, then on every change/open/save.
    vscode.workspace.textDocuments.forEach(updateDiagnostics);

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document)),
        vscode.workspace.onDidCloseTextDocument(doc => diagnostics.delete(doc.uri)),
        vscode.languages.registerCodeActionsProvider(
            { language: 'uxml' },
            new UxmlCodeActionProvider(),
            { providedCodeActionKinds: UxmlCodeActionProvider.providedCodeActionKinds },
        ),
        vscode.languages.registerCodeActionsProvider(
            { language: 'uss' },
            new UssCodeActionProvider(),
            { providedCodeActionKinds: UssCodeActionProvider.providedCodeActionKinds },
        ),
    );
}

export function deactivate(): void {
    // VS Code disposes everything we pushed onto context.subscriptions.
}
