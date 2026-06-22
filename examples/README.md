# Examples

End-to-end recipes for using `sdc_library` components from real Drupal entities.

## Paragraphs → Card

The `examples/paragraphs/` directory shows how to map a `card_paragraph`
paragraph bundle's fields to the Card SDC component.

### 1. Install the paragraph bundle

Import the configuration shipped under `examples/config/`:

```bash
drush config:import --partial --source=modules/contrib/sdc_library/examples/config
drush cache:rebuild
```

This creates:

- `paragraphs.paragraphs_type.card_paragraph` — the bundle definition.
- `field.field.paragraph.card_paragraph.field_title` — short text.
- `field.field.paragraph.card_paragraph.field_body` — long text (formatted).
- `field.field.paragraph.card_paragraph.field_image` — image reference.
- `field.field.paragraph.card_paragraph.field_variant` — list (default / featured / compact).
- `field.field.paragraph.card_paragraph.field_cta_link` — link (the footer-slot CTA).

It requires the `link`, `options`, `text`, `image` and `paragraphs` modules
to be enabled first.

### 2. Override the paragraph template

Copy `examples/paragraphs/paragraph--card-paragraph.html.twig` to your theme's
`templates/paragraphs/` directory and clear caches.

```bash
cp modules/contrib/sdc_library/examples/paragraphs/paragraph--card-paragraph.html.twig \
   themes/custom/mytheme/templates/paragraphs/
drush cache:rebuild
```

The template uses `{% embed %}` to forward field values into the Card component
and to override the `footer` slot with a paragraph reference field (`field_cta_link`).

### 3. Author content

On your own host bundle, add an Entity reference revisions field that targets
paragraphs (for example `field_components` on the Article node type), allow the
`card_paragraph` type on it, and start authoring. That host field is project
specific, so it is **not** shipped under `examples/config/` — only the
`card_paragraph` bundle and its fields are. Every paragraph instance you add
will render through the Card SDC component.

## Block → Hero

`examples/blocks/block--sdc-hero.html.twig` is a block template override for
a custom "Hero" block. Drop the file into `themes/custom/mytheme/templates/blocks/`
and Drupal will pick it up for any block whose plugin id starts with `sdc_hero`.

```bash
cp modules/contrib/sdc_library/examples/blocks/block--sdc-hero.html.twig \
   themes/custom/mytheme/templates/blocks/
drush cache:rebuild
```

The template reads the configured block fields and forwards them to
`sdc_library:hero`.

## Why `{% embed %}` instead of `{% include %}`?

`embed` lets you keep using `{% block %}` overrides for slots while still
forwarding props with `with { … }`. `include` works for prop-only usage, but
the moment you need to override a slot (footer, panels…) you want `embed`.
