# UXML & USS Language Tools — VS Code extension

Language support for Unity's UI Toolkit file formats:

- **`.uxml`** — XML-based UI layout (think HTML/XAML for Unity)
- **`.uss`** — CSS-like stylesheets for UXML

[![CI](https://github.com/helizac/uxml-uss-language-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/helizac/uxml-uss-language-tools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- **Syntax highlighting** for both formats. Unity element names like `Button`, `Toggle`, `ScrollView` are highlighted distinctly from custom controls; `-unity-*` USS properties get their own scope.
- **Snippets** for common scaffolding (`uxml`, `button`, `toggle`, `style`, `template`, `instance`, `flex`, `bg`, `unityfont`, …).
- **IntelliSense / completion**:
  - In UXML: element names, attributes for the element under the cursor (including inherited `VisualElement` attributes), and value enums (`true`/`false`, `Position`/`Ignore`, …).
  - In USS: property names (CSS + `-unity-*`) and value enums for properties with finite value lists (`flex-direction`, `-unity-text-align`, …).
- **Hover docs** for elements, attributes, and USS properties.
- **Diagnostics**: unknown elements, unknown attributes, invalid enum values (UXML); unknown properties and invalid values (USS). Custom CSS variables (`--*`) and user-defined non-Unity-namespaced controls are correctly excluded.
- **Quick fixes**: every diagnostic with a "did you mean …?" suggestion comes with a one-click *Replace with …* code action, powered by edit-distance matching.
- **Auto-closing brackets, tag matching, and CSS-style block folding.**

## Install

### From the Marketplace

```
ext install helizac.uxml-uss-language-tools
```

…or open the Extensions panel and search for *UXML & USS Language Tools*.

### From a `.vsix`

Download the `.vsix` from the [Releases](https://github.com/helizac/uxml-uss-language-tools/releases) page and:

```
code --install-extension uxml-uss-language-tools-<version>.vsix
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (bundled with Node)

### Build

```bash
git clone https://github.com/helizac/uxml-uss-language-tools.git
cd uxml-uss-language-tools
npm install
npm run compile     # one-shot
npm run watch       # rebuild on change
```

### Run locally

1. Open the repo in VS Code.
2. Press <kbd>F5</kbd> (or pick **Run Extension** from the Run and Debug view).
3. A second VS Code window opens — the *Extension Development Host* — with the extension loaded.
4. Open `examples/example.uxml` and `examples/example.uss`.

### Run tests

```bash
npm test
```

The suite has three layers:

1. **Pure unit tests** (`contextDetection.test.ts`) for the cursor-context heuristics.
2. **Provider integration tests** (`extension.test.ts`) that open in-memory documents and call `vscode.executeCompletionItemProvider` / `vscode.executeHoverProvider`.
3. **Diagnostics + quick-fix tests** (`diagnostics.test.ts`) that lint sample documents and exercise the code action provider.

You can also pick **Extension Tests** from the Run and Debug view to run them with breakpoints.

## Publishing

This section is for maintainers releasing new versions.

### One-time setup

1. **Pick a publisher ID.** Go to <https://marketplace.visualstudio.com/manage/createpublisher> and create one. Update `"publisher"` in `package.json`.
2. **Create an Azure DevOps Personal Access Token** ([instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)). Scope: *Marketplace → Manage*. Save it as the `VSCE_PAT` repository secret on GitHub.
3. **(Optional) Create an Open VSX token** at <https://open-vsx.org/user-settings/tokens> and save it as `OVSX_PAT`. Open VSX is the registry used by VSCodium and other VS Code forks — publishing there roughly doubles your reach.
4. **Add an `icon.png`** (128×128 PNG) at the repo root. The Marketplace requires one; without it, `vsce package` will warn but still succeed.

### Cutting a release

The release workflow handles three triggers, in order of how I recommend using them:

**1. Bump the version on `main` (most common — fully automated)**

```bash
npm version patch    # 0.1.0 -> 0.1.1, also commits the change
git push origin main
```

The CI workflow detects that `package.json`'s version field changed since the previous commit, creates the matching `v0.1.1` tag automatically, builds the `.vsix`, attaches it to a GitHub Release, and publishes to both registries. The user side is fully automatic too — VS Code checks for extension updates in the background and installs them silently within a few hours, or immediately if the user has the extension open.

**2. Manual tag push (if you want full control)**

```bash
git tag v0.1.1
git push origin v0.1.1
```

**3. Manual dispatch from the Actions tab** — useful for re-running a failed publish without bumping the version.

For all three triggers, if `VSCE_PAT` or `OVSX_PAT` is missing, the workflow will skip that publish step and continue. So you can land the workflow first and add the secrets later.

### Doing it manually (no CI)

If you'd rather publish from your machine:

```bash
npx --yes @vscode/vsce login helizac        # paste the Azure DevOps PAT once
npx --yes @vscode/vsce publish              # bumps + publishes
npx --yes ovsx publish -p $OVSX_PAT         # also publish to Open VSX
```

`vsce publish patch|minor|major` will bump the version in `package.json` and publish in one step.

### Versioning

We follow [SemVer](https://semver.org/):

- **Patch** for bug fixes and grammar/snippet additions.
- **Minor** for new features (new diagnostics, new providers).
- **Major** for breaking changes to defaults (e.g. changing what we flag).

Always update `CHANGELOG.md` before tagging. The release workflow uses the GitHub-generated notes by default, but a human-curated changelog is much more useful for users.

## Contributing

PRs are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the dev setup, project layout, and review expectations.

The most impactful contributions are usually:

- **Adding missing elements or attributes** to `src/unityElements.ts`.
- **Adding missing USS properties** to `src/ussProperties.ts`.
- **Fixing false positives** in the diagnostics — open an issue with a minimal `.uxml` or `.uss` snippet that is incorrectly flagged.

## Project layout

```
uxml-uss-language-tools/
├── package.json                       Extension manifest
├── tsconfig.json
├── language-configuration-uxml.json   Bracket / comment behavior for UXML
├── language-configuration-uss.json    Bracket / comment behavior for USS
├── syntaxes/
│   ├── uxml.tmLanguage.json           TextMate grammar for UXML
│   └── uss.tmLanguage.json            TextMate grammar for USS
├── snippets/
│   ├── uxml.json
│   └── uss.json
├── src/
│   ├── extension.ts                   Activation: registers all providers
│   ├── unityElements.ts               Element + attribute metadata
│   ├── ussProperties.ts               USS property metadata
│   ├── uxmlProviders.ts               Completion + hover for UXML
│   ├── ussProviders.ts                Completion + hover for USS
│   ├── uxmlDiagnostics.ts             Linter + quick-fix provider for UXML
│   ├── ussDiagnostics.ts              Linter + quick-fix provider for USS
│   ├── util.ts                        Shared helpers
│   └── test/...
├── examples/
│   ├── example.uxml
│   └── example.uss
└── .github/
    ├── workflows/                     CI + Release pipelines
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

## License

[MIT](LICENSE)

## Disclaimer

This extension is provided "as is" under the [MIT License](LICENSE), without
warranty of any kind. It is not affiliated with, endorsed by, or sponsored by
Unity Technologies. "Unity" and "UI Toolkit" are trademarks of Unity
Technologies. The author is not liable for any issues arising from use of
this software.