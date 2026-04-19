/**
 * Card component stories.
 *
 * Storybook renders plain HTML — production builds use the .twig template
 * through Drupal. We build DOM programmatically via createElement to keep
 * stories XSS-safe even when args come from the Storybook controls panel.
 */

import { initAll as initAllCards } from '../../components/card/card.js';

export default {
  title: 'Components/Card',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    image_src: { control: 'text' },
    image_alt: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'featured', 'compact'],
    },
    url: { control: 'text' },
    footer_label: { control: 'text' },
    footer_url: { control: 'text' },
  },
  decorators: [
    (story) => {
      const wrap = document.createElement('div');
      wrap.style.maxWidth = '40rem';
      wrap.appendChild(story());
      queueMicrotask(() => initAllCards(wrap));
      return wrap;
    },
  ],
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

const render = ({ title, body, image_src, image_alt, variant, url, footer_label, footer_url }) => {
  const v = variant || 'default';
  const classes = [
    'c-card',
    `c-card--${v}`,
    image_src ? 'c-card--has-image' : 'c-card--no-image',
  ].join(' ');

  const article = el('article', {
    class: classes,
    'data-component': 'card',
    'data-variant': v,
  });

  if (image_src) {
    const media = el('div', { class: 'c-card__media' }, [
      el('img', {
        class: 'c-card__image',
        src: image_src,
        alt: image_alt || '',
        loading: 'lazy',
        decoding: 'async',
      }),
    ]);
    article.appendChild(media);
  }

  const titleNode = url
    ? el('a', { class: 'c-card__link', href: url, text: title })
    : document.createTextNode(title);

  const titleEl = el('h3', { class: 'c-card__title' });
  titleEl.appendChild(titleNode);

  const body_ = el('div', { class: 'c-card__body' }, [
    titleEl,
    el('p', { class: 'c-card__text', text: body }),
  ]);
  article.appendChild(body_);

  if (footer_label) {
    const footer = el('footer', { class: 'c-card__footer' }, [
      el('a', { class: 'c-card__cta', href: footer_url || '#', text: footer_label }),
    ]);
    article.appendChild(footer);
  }

  return article;
};

export const Default = {
  render,
  args: {
    title: 'Drupal 11 ships SDC',
    body: 'A short overview of what Single Directory Components bring to Drupal core.',
    variant: 'default',
    url: '#',
  },
};

export const Featured = {
  render,
  args: {
    title: 'Highlight of the month',
    body: 'Featured cards use a stronger border, larger title and an accent shadow.',
    image_src: 'https://picsum.photos/seed/featured/720/400',
    image_alt: 'Editorial photo',
    variant: 'featured',
    url: '#',
  },
};

export const Compact = {
  render,
  args: {
    title: 'Tight list item',
    body: 'Compact cards trim paddings — good for dense lists or sidebars.',
    image_src: 'https://picsum.photos/seed/compact/600/450',
    image_alt: 'Square cover',
    variant: 'compact',
    url: '#',
  },
};

export const WithFooter = {
  render,
  args: {
    title: 'Pricing — Pro',
    body: 'Everything in Starter plus unlimited collaborators and priority support.',
    variant: 'default',
    footer_label: 'Get started',
    footer_url: '#',
  },
};

export const NoImage = {
  render,
  args: {
    title: 'Text-only card',
    body: 'Skips the media slot entirely. Useful for quotes, notes, plain teasers.',
    variant: 'default',
  },
};
