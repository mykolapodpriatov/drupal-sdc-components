/**
 * Tabs stories.
 */

import { expect, userEvent, within } from '@storybook/test';
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
    else if (
      key.startsWith('data-') ||
      key.startsWith('aria-') ||
      key === 'role' ||
      key === 'tabindex' ||
      key === 'type' ||
      key === 'hidden'
    )
      node.setAttribute(key, val);
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
      { label: 'One', panel_id: 't1', content: 'One.' },
      { label: 'Two', panel_id: 't2', content: 'Two.' },
      { label: 'Three', panel_id: 't3', content: 'Three.' },
      { label: 'Four', panel_id: 't4', content: 'Four.' },
      { label: 'Five', panel_id: 't5', content: 'Five.' },
    ],
  },
};

/**
 * Interaction test — keyboard roving focus, wrap-around, Home/End, and that
 * `aria-selected` / `tabindex` / panel `hidden` stay in sync with the
 * focused tab. See components/tabs/tabs.js for the behaviour under test.
 */
export const KeyboardNavigation = {
  render,
  args: { tabs: sampleTabs, initial: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    const panels = canvas.getAllByRole('tabpanel', { hidden: true });
    const last = tabs.length - 1;

    // Initial state — first tab selected and focusable, its panel visible.
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await expect(tabs[0]).toHaveAttribute('tabindex', '0');
    await expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    await expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    await expect(panels[0]).not.toHaveAttribute('hidden');
    await expect(panels[1]).toHaveAttribute('hidden');

    tabs[0].focus();

    // ArrowRight moves focus AND selection to the next tab.
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[1]).toHaveFocus();
    await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    await expect(tabs[0]).toHaveAttribute('tabindex', '-1');
    await expect(panels[1]).not.toHaveAttribute('hidden');
    await expect(panels[0]).toHaveAttribute('hidden');

    // End jumps straight to the last tab.
    await userEvent.keyboard('{End}');
    await expect(tabs[last]).toHaveFocus();
    await expect(tabs[last]).toHaveAttribute('aria-selected', 'true');
    await expect(panels[last]).not.toHaveAttribute('hidden');

    // ArrowRight wraps from the last tab back to the first.
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[0]).toHaveFocus();
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // ArrowLeft wraps the other way, from the first tab to the last.
    await userEvent.keyboard('{ArrowLeft}');
    await expect(tabs[last]).toHaveFocus();
    await expect(tabs[last]).toHaveAttribute('aria-selected', 'true');

    // Home jumps back to the first tab.
    await userEvent.keyboard('{Home}');
    await expect(tabs[0]).toHaveFocus();
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // Clicking a tab directly activates it too (mouse path, not just keyboard).
    await userEvent.click(tabs[2]);
    await expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    await expect(panels[2]).not.toHaveAttribute('hidden');

    // Space on the already-focused, already-active tab re-activates it
    // without throwing and keeps focus in place (guards the
    // `event.preventDefault()` path documented in tabs.js).
    tabs[2].focus();
    await userEvent.keyboard(' ');
    await expect(tabs[2]).toHaveFocus();
    await expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
  },
};
