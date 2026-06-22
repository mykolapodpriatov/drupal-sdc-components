# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-06-22

### Added
- Initial module scaffold with SDC discovery structure.
- `card` component with three variants (default, featured, compact), optional image and footer slot.
- `accordion` component using native `<details>/<summary>` with optional single-open behaviour.
- `tabs` component with full keyboard support (arrows, Home/End) and ARIA tablist semantics.
- `hero` component with full/split/compact responsive variants.
- Example paragraph integration (`card_paragraph` bundle, including the `field_cta_link` CTA field) and block template wiring.
- Storybook 8 setup with one stories file per component.
- GitHub Actions CI workflow: yamllint, stylelint, prettier check, PHPCS.
- Root `package.json` and `.stylelintrc.json` so contributors can reproduce the CI lint checks locally.

[Unreleased]: https://github.com/mykolapodpriatov/drupal-sdc-components/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mykolapodpriatov/drupal-sdc-components/releases/tag/v0.1.0
