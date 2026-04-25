# Contributing

Thanks for considering a contribution! This document covers how to set up a development environment, the kinds of changes that are most useful, and what to expect from the review process.

## Setting up

```bash
git clone https://github.com/helizac/uxml-uss-language-tools.git
cd uxml-uss-language-tools
npm install
npm run compile
```

To try your changes:

1. Open the repo in VS Code.
2. Press <kbd>F5</kbd> — this opens an Extension Development Host with your local build of the extension loaded.
3. In that window, open a `.uxml` or `.uss` file (the `examples/` folder has a starter pair).

To run the full test suite:

```bash
npm test
```

## Project layout

```
src/
  extension.ts            Activation: registers all providers.
  unityElements.ts        Catalogue of Unity UI elements + attributes.
  ussProperties.ts        Catalogue of USS properties + value enums.
  uxmlProviders.ts        Completion + hover for UXML.
  ussProviders.ts         Completion + hover for USS.
  uxmlDiagnostics.ts      Linter + quick-fix provider for UXML.
  ussDiagnostics.ts       Linter + quick-fix provider for USS.
  util.ts                 Shared helpers (Levenshtein, range key).
  test/
    runTest.ts            Boots VS Code in test mode.
    suite/
      index.ts            Mocha entry point.
      *.test.ts           Test files (see "Writing tests" below).

syntaxes/                 TextMate grammars.
snippets/                 Snippet definitions.
```

## Good first issues

The element and property catalogues in `unityElements.ts` and `ussProperties.ts` are the places where new contributors can have the most impact. Adding a missing control, attribute, or property is a one-literal change that immediately improves completion, hover, and diagnostics.

Other welcome improvements:

- **Cross-file analysis.** Parse `<Style src="...">` and `<Template src="...">` references and surface USS classes / template names defined in other files.
- **`var(--…)` completion.** Collect `--` variables defined elsewhere and offer them inside `var()`.
- **More precise grammars.** The TextMate grammars are deliberately simple. Targeted improvements (e.g. recognising `binding-path` differently) are welcome.
- **Translations** of the README and snippet descriptions.

## Writing tests

We have two kinds:

1. **Pure unit tests** for parsing/lint heuristics. These don't need VS Code APIs — just import the function and assert on its return value. See `contextDetection.test.ts` for the pattern.
2. **Integration tests** that open in-memory documents and call VS Code commands like `vscode.executeCompletionItemProvider`. See `extension.test.ts` and `diagnostics.test.ts`.

Always add at least one test for each fix or new feature. PRs without tests will be asked to add them unless the change is purely cosmetic (README, snippet wording, etc).

The integration tests use a small helper:

```ts
const { doc, position } = await openDocWithCursor('uxml', '<engine:Button |');
const items = await getCompletions(doc, position);
```

The `|` marker becomes the cursor position. This makes test cases very readable.

## Pull request expectations

- A clear title and a short description of *why*, not just *what*.
- Tests for the change, where applicable.
- `npm test` passes locally.
- The CHANGELOG has an entry under `## [Unreleased]`.

We use the [Conventional Commits](https://www.conventionalcommits.org/) prefix (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`) for commit messages. Not strictly required, but it makes release notes easier.

## Reporting bugs

Please use the issue templates. A good bug report includes:

- The VS Code version (Help → About).
- The version of this extension.
- A minimal `.uxml` or `.uss` snippet that reproduces the issue.
- What you expected versus what happened.

## Code of conduct

Be kind. We follow the [Contributor Covenant](https://www.contributor-covenant.org/). Disagreement is fine; personal attacks are not.
