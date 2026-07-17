/**
 * Breadcrumb stories.
 *
 * Builds DOM programmatically via createElement / textContent to keep stories
 * XSS-safe even when args come from the Storybook controls panel.
 */

export default {
  title: 'Components/Breadcrumb',
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    separator: { control: 'text' },
    aria_label: { control: 'text' },
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

const render = ({ items, separator, aria_label }) => {
  const sep = separator || '/';
  const list = el('ol', { class: 'c-breadcrumb__list' });

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const li = el('li', { class: 'c-breadcrumb__item' });

    if (isLast) {
      li.appendChild(
        el('span', { class: 'c-breadcrumb__current', 'aria-current': 'page', text: item.title }),
      );
    } else if (item.url) {
      li.appendChild(el('a', { class: 'c-breadcrumb__link', href: item.url, text: item.title }));
    } else {
      li.appendChild(el('span', { class: 'c-breadcrumb__text', text: item.title }));
    }

    if (!isLast) {
      li.appendChild(
        el('span', { class: 'c-breadcrumb__separator', 'aria-hidden': 'true', text: sep }),
      );
    }

    list.appendChild(li);
  });

  return el(
    'nav',
    {
      class: 'c-breadcrumb',
      'aria-label': aria_label || 'Breadcrumb',
      'data-component': 'breadcrumb',
    },
    [list],
  );
};

export const Default = {
  render,
  args: {
    items: [
      { title: 'Home', url: '#' },
      { title: 'Documentation', url: '#' },
      { title: 'Components', url: '#' },
      { title: 'Breadcrumb' },
    ],
    separator: '/',
    aria_label: 'Breadcrumb',
  },
};

export const LongTrail = {
  render,
  args: {
    items: [
      { title: 'Home', url: '#' },
      { title: 'Products', url: '#' },
      { title: 'Drupal', url: '#' },
      { title: 'Modules', url: '#' },
      { title: 'SDC Library', url: '#' },
      { title: 'Breadcrumb component' },
    ],
    separator: '›',
    aria_label: 'Breadcrumb',
  },
};

export const SingleItem = {
  render,
  args: {
    items: [{ title: 'Home' }],
    separator: '/',
    aria_label: 'Breadcrumb',
  },
};
