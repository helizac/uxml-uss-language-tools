# Changelog

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-04-25

### Added
- Syntax highlighting for `.uxml` files (Unity element names highlighted distinctly from custom controls).
- Syntax highlighting for `.uss` files (CSS-derived, with `-unity-*` properties highlighted distinctly).
- IntelliSense for UXML: element names, element-specific attributes, inherited `VisualElement` attributes, and value enums.
- IntelliSense for USS: property names, property values, and selector context.
- Hover documentation for Unity elements, attributes, and USS properties.
- Snippets for common UXML scaffolding and USS rules.
- Diagnostics: unknown elements, unknown attributes, invalid enum values (UXML); unknown properties, invalid values (USS).
- Quick-fix code actions: "Replace with …" suggestions powered by edit-distance matching.
