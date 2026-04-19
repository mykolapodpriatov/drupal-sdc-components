/**
 * Tabs stories.
 */

import { initAll as initAllTabs } from '../../components/tabs/tabs.js';

export default {
  title: 'Components/Tabs',
  tags: ['autodocs'],
  argTypes: {
    tabs: { control: 'object' },
    initial: { control: { type: 'number', min: 0 } },
  },
  decorators: [
    (story) => {
      const wrap = document.createElement('div');
      wrap.style.maxWidth = '40rem';
      wrap.appendChild(story());
      queueMicrotask(() => initAllTabs(wrap));
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
    else if (key.startsWith('data-') || key.startsWith('aria-') || key === 'role' || key === 'tabindex' || key === 'type' || key === 'hidden') node.setAttribute(key, val);
    else node[key] = val;
  }
  for (const child of children) {
    if (child) node.appendChild(child);
  }
  return node;
};

const render = ({ tabs, initial }) => {
  const initialIdx = Math.max(0, Math.min(initial || 0, tabs.length - 1));
  const uid = `sdc-tabs-${Math.random().toString(36).slice(2)}`;

  const root = el('div', {
    class: 'c-tabs',
    'data-component': 'tabs',
    'data-initial': String(initialIdx),
  });

  const list = el('div', {
    class: 'c-tabs__list',
    role: 'tablist',
    'aria-orientation': 'horizontal',
  });
  tabs.forEach((t, i) => {
    const isActive = i === initialIdx;
    list.appendChild(
      el('button', {
        type: 'button',
        class: `c-tabs__tab${isActive ? ' is-active' : ''}`,
        id: `${uid}-tab-${i}`,
        role: 'tab',
        'aria-selected': isActive ? 'true' : 'false',
        'aria-controls': t.panel_id,
        tabindex: isActive ? '0' : '-1',
        'data-tab-index': String(i),
        text: t.label,
      }),
    );
  });
  root.appendChild(list);

  const panels = el('div', { class: 'c-tabs__panels' });
  tabs.forEach((t, i) => {
    const section = el('section', {
      id: t.panel_id,
      role: 'tabpanel',
      tabindex: '0',
      hidden: i === initialIdx ? null : '',
      text: t.content || `Panel content for "${t.label}".`,
    });
    panels.appendChild(section);
  });
  root.appendChild(panels);

  return root;
};

const sampleTabs = [
  { label: 'Overview', panel_id: 'p-overview', content: 'A general overview of the product.' },
  { label: 'Specs', panel_id: 'p-specs', content: 'Detailed technical specifications.' },
  { label: 'Reviews', panel_id: 'p-reviews', content: 'What customers say about it.' },
];

export const Default = {
  render,
  args: { tabs: sampleTabs, initial: 0 },
};

export const SecondTabActive = {
  render,
  args: { tabs: sampleTabs, initial: 1 },
};

export const ManyTabs = {
  render,
  args: {
    initial: 0,
    tabs: [
      { label: 'One',   panel_id: 't1', content: 'One.' },
      { label: 'Two',   panel_id: 't2', content: 'Two.' },
      { label: 'Three', panel_id: 't3', content: 'Three.' },
      { label: 'Four',  panel_id: 't4', content: 'Four.' },
      { label: 'Five',  panel_id: 't5', content: 'Five.' },
    ],
  },
};
