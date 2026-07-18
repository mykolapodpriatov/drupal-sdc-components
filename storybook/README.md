# Storybook for SDC Library

A minimal Storybook 8 setup for browsing every component in the library with
live controls.

## Quickstart

```bash
cd storybook
npm install
npm run storybook
```

Visit <http://localhost:6006>.

## How the bridge works

Components live under `../components/<id>/`. Storybook is configured (in
`.storybook/main.js`) to load each component's CSS once via the preview
config, then each story builds the same DOM the Twig template would emit.

The component JS modules (`card.js`, `accordion.js`, `tabs.js`) are imported
directly into the relevant story files — they detect when they run outside
Drupal and fall back to a vanilla `DOMContentLoaded` listener, so they work
in Storybook with no glue code.

Stories build DOM with `createElement` + `textContent` (no `innerHTML`) so
controls panel values never produce executable markup.

## File layout

```
storybook/
├── .storybook/
│   ├── main.js       # framework + addons + story glob
│   └── preview.js    # global parameters, loads component CSS once
├── stories/
│   ├── Card.stories.js
│   ├── Accordion.stories.js
│   ├── Tabs.stories.js
│   └── Hero.stories.js
├── package.json
└── README.md
```

## Build for static hosting

```bash
npm run build
# → storybook-static/  (gitignored)
```

Deploy the output to GitHub Pages, Netlify, Vercel, S3 — anywhere that serves
static files.

## Lint

```bash
npm run lint     # prettier --check
npm run format   # prettier --write
```

CI runs the prettier check on every push (see `.github/workflows/ci.yml`).

## Accessibility panel

Every story is checked for accessibility issues automatically. The
[`@storybook/addon-a11y`](https://storybook.js.org/addons/@storybook/addon-a11y)
addon — registered in `.storybook/main.js` — runs
[axe-core](https://github.com/dequelabs/axe-core) against the rendered
component and reports the results in a new **Accessibility** panel in the
Storybook addons tray.

- Open any story, then select the **Accessibility** tab in the bottom panel.
- Violations, passes and incomplete checks are listed with the offending
  element and a link to the rule documentation.
- Checks run on every story render (`a11y.manual` is `false` in
  `.storybook/preview.js`), so WCAG regressions surface as you browse.

Everything runs in the browser — no network access or extra configuration is
needed.

## Keeping stories in sync with components

Each story file mirrors its component's Twig template exactly — when you
change the markup in the Twig file, update the corresponding `.stories.js`
to match. The accessibility addon (`@storybook/addon-a11y`) is enabled, so
violations show up in the addons panel right away.
