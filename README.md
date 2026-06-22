# SDC Library

[![CI](https://github.com/mykolapodpriatov/drupal-sdc-components/actions/workflows/ci.yml/badge.svg)](https://github.com/mykolapodpriatov/drupal-sdc-components/actions/workflows/ci.yml)

A reusable library of **Single Directory Components** (SDC) for Drupal 10.3+ / 11.

Ships four production-ready components — **Card**, **Accordion**, **Tabs**, **Hero** — with
proper component schemas, slots, modern CSS and vanilla JS where it adds value. Any theme
(or other module) can pull them in via Twig:

```twig
{% include 'sdc_library:card' with {
  title: 'Hello world',
  body: 'A short summary…',
  variant: 'featured',
} %}
```

## What is SDC?

Single Directory Components are a Drupal core feature introduced in 10.3. Each component
lives in a single folder under `components/<id>/` and consists of:

- `<id>.component.yml` — schema (props, slots, libraries, metadata)
- `<id>.twig` — markup
- `<id>.css` / `<id>.js` — auto-attached assets

See the official docs: <https://www.drupal.org/docs/develop/theming-drupal/using-single-directory-components>.

## Components

| ID                       | Purpose                                       | Variants                       |
| ------------------------ | --------------------------------------------- | ------------------------------ |
| `sdc_library:card`       | Article card with title/body/image + footer slot | `default`, `featured`, `compact` |
| `sdc_library:accordion`  | Native `<details>` accordion                  | `default`, `bordered`          |
| `sdc_library:tabs`       | ARIA tablist with full keyboard nav           | (single style, themeable)      |
| `sdc_library:hero`       | Page-top hero                                 | `full`, `split`, `compact`     |

## Installation

### Via Composer (VCS repository)

```bash
composer config repositories.sdc-components vcs https://github.com/mykolapodpriatov/drupal-sdc-components
composer require mykolapodpriatov/drupal-sdc-components:@dev
drush en sdc_library -y
```

### Via Composer (path repository)

```bash
composer config repositories.sdc-components path /path/to/drupal-sdc-components
composer require mykolapodpriatov/drupal-sdc-components:@dev
drush en sdc_library -y
```

That's it — components are auto-discovered. No further configuration needed.

## Usage

### Include (simple)

```twig
{% include 'sdc_library:card' with {
  title: node.label,
  body: node.body.summary,
  image_src: file_url(node.field_image.entity.uri.value),
  image_alt: node.field_image.alt,
  variant: 'featured',
  url: path('entity.node.canonical', { node: node.id }),
} %}
```

### Embed with slot override

```twig
{% embed 'sdc_library:card' with { title: 'Pricing', body: '€19/mo' } %}
  {% block footer %}
    <a href="/signup" class="button button--primary">Get started</a>
  {% endblock %}
{% endembed %}
```

### Accordion with items

```twig
{% include 'sdc_library:accordion' with {
  allow_multiple: false,
  items: [
    { title: 'What is SDC?',          body: 'Single Directory Components…' },
    { title: 'Which Drupal version?', body: 'Drupal 10.3 or 11.' },
  ],
} %}
```

### Tabs

```twig
{% include 'sdc_library:tabs' with {
  initial: 0,
  tabs: [
    { label: 'Overview', panel_id: 'overview' },
    { label: 'Specs',    panel_id: 'specs' },
    { label: 'Reviews',  panel_id: 'reviews' },
  ],
} %}
```

### Hero

```twig
{% include 'sdc_library:hero' with {
  heading: 'Build faster with SDC',
  subheading: 'A drop-in component library for Drupal 11.',
  image_src: '/themes/custom/mytheme/images/hero.webp',
  image_alt: 'Abstract gradient',
  cta_label: 'Get started',
  cta_url: '/docs',
  variant: 'split',
} %}
```

## Preview

There are no bundled screenshots. Run Storybook locally to preview every
component and variant interactively:

```bash
cd storybook
npm install
npm run storybook
```

Then open <http://localhost:6006>.

## Paragraph & block integration

See [`examples/`](./examples/) for a complete walkthrough:

- **Paragraphs** — config export for a `card_paragraph` bundle + `paragraph--card-paragraph.html.twig` that delegates to `sdc_library:card` via `{% embed %}`.
- **Blocks** — `block--sdc-hero.html.twig` showing how to render Hero from a custom block.

## Storybook (optional)

A minimal Storybook 8 setup lives in [`storybook/`](./storybook/) for design-system documentation.

```bash
cd storybook
npm install
npm run storybook
```

Visit <http://localhost:6006>. See [`storybook/README.md`](./storybook/README.md) for details.

## Development

```bash
composer install
composer phpcs            # Drupal coding standards

npm install              # root dev tooling: stylelint + prettier
npm run lint             # stylelint on CSS + prettier --check on JS
npm run format           # auto-format JS with prettier
```

Linting is driven by the committed `.stylelintrc.json` and `.prettierrc.json`,
so local runs match CI exactly. CI runs yamllint on component schemas, stylelint
on CSS, prettier check on JS, and PHPCS on the `.module` file.

## Accessibility

All components target WCAG 2.1 AA:

- Semantic HTML (`<article>`, `<details>`, `<nav>`, `<header>`).
- Visible focus states on every interactive element.
- ARIA only where native semantics aren't enough (tabs).
- Keyboard parity for all mouse interactions.

## Browser support

Modern evergreen browsers (last 2 versions). Container queries are used progressively;
older browsers get the desktop layout.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) — component conventions, naming, accessibility checklist.

## License

MIT — see [LICENSE](./LICENSE).
