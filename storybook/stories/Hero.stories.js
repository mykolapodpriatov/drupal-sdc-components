/**
 * Hero stories.
 */

export default {
  title: 'Components/Hero',
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    subheading: { control: 'text' },
    image_src: { control: 'text' },
    image_alt: { control: 'text' },
    cta_label: { control: 'text' },
    cta_url: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['full', 'split', 'compact'],
    },
  },
};

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(props)) {
    if (val === undefined || val === null) continue;
    if (key === 'class') node.className = val;
    else if (key === 'text') node.textContent = val;
    else if (key.startsWith('data-') || key.startsWith('aria-')) node.setAttribute(key, val);
    else node[key] = val;
  }
  for (const child of children) {
    if (child) node.appendChild(child);
  }
  return node;
};

const ctaArrow = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'c-hero__cta-arrow');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M3 8h10m-4-4l4 4-4 4');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.75');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  return svg;
};

const render = ({ heading, subheading, image_src, image_alt, cta_label, cta_url, variant }) => {
  const v = variant || 'split';
  const classes = [
    'c-hero',
    `c-hero--${v}`,
    image_src ? 'c-hero--has-image' : 'c-hero--no-image',
  ].join(' ');

  const root = el('header', {
    class: classes,
    'data-component': 'hero',
    'data-variant': v,
  });

  if (image_src && v !== 'compact') {
    const picture = el('picture', { class: 'c-hero__picture' }, [
      el('img', {
        class: 'c-hero__image',
        src: image_src,
        alt: image_alt || '',
        loading: 'eager',
        fetchpriority: 'high',
        decoding: 'async',
      }),
    ]);
    root.appendChild(el('div', { class: 'c-hero__media' }, [picture]));
  }

  const inner = el('div', { class: 'c-hero__inner' }, [
    el('h1', { class: 'c-hero__heading', text: heading }),
  ]);
  if (subheading) inner.appendChild(el('p', { class: 'c-hero__subheading', text: subheading }));
  if (cta_label && cta_url) {
    const cta = el('a', { class: 'c-hero__cta', href: cta_url, text: cta_label });
    cta.appendChild(ctaArrow());
    inner.appendChild(el('p', { class: 'c-hero__actions' }, [cta]));
  }
  root.appendChild(el('div', { class: 'c-hero__content' }, [inner]));

  return root;
};

export const Split = {
  render,
  args: {
    heading: 'Build faster with SDC',
    subheading:
      'A drop-in component library for Drupal 11. Card, Accordion, Tabs and Hero — production-ready out of the box.',
    image_src: 'https://picsum.photos/seed/hero-split/960/600',
    image_alt: 'Abstract gradient',
    cta_label: 'Get started',
    cta_url: '#',
    variant: 'split',
  },
};

export const Full = {
  render,
  args: {
    heading: 'A single source of truth for your UI',
    subheading: 'Ship a consistent design system across every theme in your Drupal multisite.',
    image_src: 'https://picsum.photos/seed/hero-full/1600/700',
    image_alt: '',
    cta_label: 'Explore the library',
    cta_url: '#',
    variant: 'full',
  },
};

export const Compact = {
  render,
  args: {
    heading: 'Documentation',
    subheading: 'Everything you need to build with SDC Library.',
    cta_label: 'Read the docs',
    cta_url: '#',
    variant: 'compact',
  },
};
