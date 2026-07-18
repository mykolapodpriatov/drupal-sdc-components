/**
 * Pager stories.
 *
 * Builds DOM programmatically via createElement / textContent to keep stories
 * XSS-safe even when args come from the Storybook controls panel.
 */

export default {
  title: 'Components/Pager',
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object' },
    current_page: { control: 'number' },
    total_pages: { control: 'number' },
    prev_url: { control: 'text' },
    next_url: { control: 'text' },
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

const control = (dir, url) => {
  const label = dir === 'prev' ? 'Previous' : 'Next';
  const arrow = el('span', { 'aria-hidden': 'true', text: dir === 'prev' ? '‹' : '›' });
  const children =
    dir === 'prev'
      ? [arrow, document.createTextNode(` ${label}`)]
      : [document.createTextNode(`${label} `), arrow];

  if (url) {
    return el('a', { class: `c-pager__link c-pager__link--${dir}`, href: url, rel: dir }, children);
  }
  return el(
    'span',
    { class: `c-pager__link c-pager__link--${dir} is-disabled`, 'aria-disabled': 'true' },
    children,
  );
};

const render = ({ items, current_page, total_pages, prev_url, next_url }) => {
  const list = el('ul', { class: 'c-pager__list' });

  const prevLi = el('li', { class: 'c-pager__item c-pager__item--prev' }, [
    control('prev', prev_url),
  ]);
  list.appendChild(prevLi);

  (items || []).forEach((item) => {
    const li = el('li', { class: 'c-pager__item' });
    const label = String(item.label);
    if (item.current) {
      li.appendChild(
        el('span', {
          class: 'c-pager__link c-pager__current',
          'aria-current': 'page',
          text: label,
        }),
      );
    } else if (item.url) {
      li.appendChild(el('a', { class: 'c-pager__link', href: item.url, text: label }));
    } else {
      li.appendChild(
        el('span', {
          class: 'c-pager__link c-pager__ellipsis',
          'aria-hidden': 'true',
          text: label,
        }),
      );
    }
    list.appendChild(li);
  });

  const nextLi = el('li', { class: 'c-pager__item c-pager__item--next' }, [
    control('next', next_url),
  ]);
  list.appendChild(nextLi);

  const status = el('span', {
    class: 'c-pager__status',
    text: `Page ${current_page} of ${total_pages}`,
  });

  return el('nav', { class: 'c-pager', 'aria-label': 'Pagination', 'data-component': 'pager' }, [
    status,
    list,
  ]);
};

export const FirstPage = {
  render,
  args: {
    current_page: 1,
    total_pages: 10,
    prev_url: null,
    next_url: '#',
    items: [
      { label: 1, current: true },
      { label: 2, url: '#' },
      { label: 3, url: '#' },
      { label: '…' },
      { label: 10, url: '#' },
    ],
  },
};

export const MiddlePage = {
  render,
  args: {
    current_page: 5,
    total_pages: 10,
    prev_url: '#',
    next_url: '#',
    items: [
      { label: 1, url: '#' },
      { label: '…' },
      { label: 4, url: '#' },
      { label: 5, current: true },
      { label: 6, url: '#' },
      { label: '…' },
      { label: 10, url: '#' },
    ],
  },
};

export const LastPage = {
  render,
  args: {
    current_page: 10,
    total_pages: 10,
    prev_url: '#',
    next_url: null,
    items: [
      { label: 1, url: '#' },
      { label: '…' },
      { label: 8, url: '#' },
      { label: 9, url: '#' },
      { label: 10, current: true },
    ],
  },
};
