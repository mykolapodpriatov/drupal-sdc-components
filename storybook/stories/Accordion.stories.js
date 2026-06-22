/**
 * Accordion stories.
 *
 * Builds DOM programmatically via createElement / textContent to keep stories
 * XSS-safe even when args come from the Storybook controls panel.
 */

import { initAll as initAllAccordions } from '../../components/accordion/accordion.js';

export default {
  title: 'Components/Accordion',
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    allow_multiple: { control: 'boolean' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'bordered'],
    },
  },
  decorators: [
    (story) => {
      const wrap = document.createElement('div');
      wrap.style.maxWidth = '36rem';
      wrap.appendChild(story());
      queueMicrotask(() => initAllAccordions(wrap));
      return wrap;
    },
  ],
};

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(props)) {
    if (key === 'class') node.className = val;
    else if (key === 'text') node.textContent = val;
    else if (
      key.startsWith('data-') ||
      key === 'name' ||
      key === 'role' ||
      key.startsWith('aria-')
    ) {
      node.setAttribute(key, val);
    } else {
      node[key] = val;
    }
  }
  for (const child of children) {
    if (child) node.appendChild(child);
  }
  return node;
};

const svgChevron = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'c-accordion__icon');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M4 6l4 4 4-4');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.75');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  return svg;
};

const render = ({ items, allow_multiple, variant }) => {
  const v = variant || 'default';
  const groupName = allow_multiple ? '' : `sdc-acc-${Math.random().toString(36).slice(2)}`;
  const root = el('div', {
    class: [
      'c-accordion',
      `c-accordion--${v}`,
      allow_multiple ? 'c-accordion--multi' : 'c-accordion--single',
    ].join(' '),
    'data-component': 'accordion',
    'data-allow-multiple': String(Boolean(allow_multiple)),
  });

  for (const item of items) {
    const details = el('details', { class: 'c-accordion__item', name: groupName });
    const summary = el('summary', { class: 'c-accordion__summary' }, [
      el('span', { class: 'c-accordion__title', text: item.title }),
      svgChevron(),
    ]);
    const panel = el('div', { class: 'c-accordion__panel' }, [
      el('div', { class: 'c-accordion__content', text: item.body }),
    ]);
    details.appendChild(summary);
    details.appendChild(panel);
    root.appendChild(details);
  }

  return root;
};

const sampleItems = [
  {
    title: 'What is SDC?',
    body: 'Single Directory Components — a Drupal core feature for shipping self-contained UI components.',
  },
  {
    title: 'Which Drupal version?',
    body: 'Drupal 10.3 and above. Stable since 10.3 and recommended for new code in 11.x.',
  },
  {
    title: 'Can I use it in a theme?',
    body: 'Yes — themes and modules can both define and consume components.',
  },
];

export const SingleOpen = {
  render,
  args: { items: sampleItems, allow_multiple: false, variant: 'default' },
};

export const AllowMultiple = {
  render,
  args: { items: sampleItems, allow_multiple: true, variant: 'default' },
};

export const Bordered = {
  render,
  args: { items: sampleItems, allow_multiple: false, variant: 'bordered' },
};
