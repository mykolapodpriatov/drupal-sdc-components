# Contributing

Thanks for your interest in improving SDC Library. This document captures the
conventions every component in this repo follows. Stick to them and your PR
will sail through review.

## Component conventions

### Folder layout

Each component lives under `components/<id>/` and contains, at minimum:

```
components/<id>/
├── <id>.component.yml   # schema — required
├── <id>.twig            # template — required
├── <id>.css             # styles — optional but recommended
└── <id>.js              # ES module — only when behaviour is needed
```

No `dist/`, no `*.min.*`, no compiled output committed.

### Naming

- Component IDs are **snake_case** (`card`, not `Card` or `card-component`).
- Twig blocks (slots) are **snake_case** too (`{% block footer %}`).
- Prop names are **snake_case** (`image_src`, not `imageSrc`) — this matches Drupal's render array conventions.
- CSS classes are BEM-flavoured: `.c-card`, `.c-card__title`, `.c-card--featured`.
- JS files export a single `init(root)` function or auto-attach via Drupal behaviors.

### Schema (.component.yml)

Every prop **must** declare:

- `type` — JSON-Schema type (`string`, `integer`, `boolean`, `array`, `object`).
- `title` — human label.
- `description` — what it's for and where it's used.
- `enum` for constrained string sets (variants, sizes…).

Mark optional props by omitting them from `required`. Use `nullable: true` (via `[string, "null"]`) for props that may explicitly be empty.

### CSS

- Use CSS custom properties for tokens (`--c-card-radius`, `--c-card-padding`).
- Prefer **container queries** (`@container`) over media queries for component-level breakpoints.
- No SCSS, no Tailwind in components — keep components self-contained.
- Scope everything under a single root class (`.c-card { … }`) so consumers can override safely.

### JavaScript

- Vanilla ES modules. No jQuery, no framework runtimes.
- Feature-detect — `if (!('IntersectionObserver' in window)) return;`
- Attach via Drupal behaviors when the component runs in Drupal; the same module should be runnable as a plain ES module in Storybook (it is, in this repo).
- No global side effects on import.

## Accessibility checklist

Before opening a PR, verify the component:

- [ ] Renders with semantic HTML (`<article>`, `<button>`, `<nav>`, `<header>`…).
- [ ] Has visible `:focus-visible` styles on all interactive elements.
- [ ] Is fully usable with the keyboard (Tab to enter, arrows/Home/End where appropriate, Enter/Space to activate).
- [ ] Announces state changes via `aria-*` only when native semantics aren't enough.
- [ ] Passes [axe](https://www.deque.com/axe/) with zero violations on all variants.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Works in forced-colours mode (Windows High Contrast).

## Commit messages

Conventional-ish, imperative, present tense. Examples:

```
Add Tabs component with keyboard navigation
Fix Card focus ring when variant=compact
Refactor Accordion grid-rows animation for Safari 17
```

Don't add issue numbers in the subject line — put them in the body.

## Running the tests / linters locally

```bash
composer install
composer phpcs                       # Drupal coding standards
cd storybook && npm install && npm run lint
```

The CI workflow (`.github/workflows/ci.yml`) runs the same checks plus yamllint
on all `.component.yml` files.

## Questions?

Open a discussion before sending a large refactor PR — it'll save us both time.
