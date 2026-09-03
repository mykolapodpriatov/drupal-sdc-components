/**
 * Alert stories.
 *
 * Builds DOM programmatically via createElement / textContent to keep stories
 * XSS-safe even when args come from the Storybook controls panel.
 */

import { expect, userEvent, waitFor, within } from '@storybook/test';
import { initAll as initAllAlerts } from '../../components/alert/alert.js';

export default {
  title: 'Components/Alert',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
    },
    title: { control: 'text' },
    body: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  decorators: [
    (story) => {
      const wrap = document.createElement('div');
      wrap.style.maxWidth = '36rem';
      wrap.appendChild(story());
      queueMicrotask(() => initAllAlerts(wrap));
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
    else if (key.startsWith('data-') || key.startsWith('aria-') || key === 'role')
      node.setAttribute(key, val);
    else node[key] = val;
  }
  for (const child of children) {
    if (child) node.appendChild(child);
  }
  return node;
};

const closeButton = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 14 14');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M2 2l10 10M12 2L2 12');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.75');
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);

  const button = el('button', {
    type: 'button',
    class: 'c-alert__close',
    'aria-label': 'Dismiss',
  });
  button.appendChild(svg);
  return button;
};

const render = ({ variant, title, body, dismissible }) => {
  const v = variant || 'info';
  const assertive = v === 'warning' || v === 'error';

  const content = el('div', { class: 'c-alert__content' });
  if (title) {
    content.appendChild(el('p', { class: 'c-alert__title', text: title }));
  }
  content.appendChild(el('div', { class: 'c-alert__body' }, [el('span', { text: body })]));

  const children = [el('span', { class: 'c-alert__icon', 'aria-hidden': 'true' }), content];
  if (dismissible) {
    children.push(closeButton());
  }

  return el(
    'div',
    {
      class: `c-alert c-alert--${v}`,
      role: assertive ? 'alert' : 'status',
      'aria-live': assertive ? 'assertive' : 'polite',
      'data-component': 'alert',
      'data-variant': v,
    },
    children,
  );
};

/**
 * Interaction test — a non-dismissible alert renders no close button, and
 * alert.js's `init()` correctly no-ops (no `data-alert-enhanced` guard is
 * written) when there is nothing to wire up. See alert.js: `init()` returns
 * early when `.c-alert__close` isn't found.
 */
export const Info = {
  render,
  args: {
    variant: 'info',
    title: 'Heads up',
    body: 'A new version of the component library is available.',
    dismissible: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvasElement.querySelector('.c-alert')).not.toHaveAttribute(
      'data-alert-enhanced',
    );
  },
};

export const Success = {
  render,
  args: {
    variant: 'success',
    title: 'Changes saved',
    body: 'Your profile was updated successfully.',
    dismissible: false,
  },
};

export const Warning = {
  render,
  args: {
    variant: 'warning',
    title: 'Check your input',
    body: 'Some fields need your attention before you continue.',
    dismissible: false,
  },
};

export const Error = {
  render,
  args: {
    variant: 'error',
    title: 'Something went wrong',
    body: 'We could not save your changes. Please try again.',
    dismissible: false,
  },
};

/**
 * Interaction test — dismissal. alert.js only implements click-to-dismiss on
 * `.c-alert__close`; there is no Escape-key handling and no explicit focus
 * management in the source, so this test does not assert either — it only
 * covers the behaviour that actually exists: the `is-dismissing` class gets
 * added immediately, and the alert removes itself from the DOM once the
 * transition (or its 300ms fallback) finishes.
 */
export const Dismissible = {
  render,
  args: {
    variant: 'info',
    title: 'Dismissible alert',
    body: 'Click the close button to remove this message.',
    dismissible: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alertRoot = canvasElement.querySelector('.c-alert');
    const closeButton = canvas.getByRole('button', { name: /dismiss/i });

    await userEvent.click(closeButton);

    await waitFor(() => expect(alertRoot).toHaveClass('is-dismissing'));
    await waitFor(() => expect(canvasElement.contains(alertRoot)).toBe(false), { timeout: 1000 });
  },
};

export const NoTitle = {
  render,
  args: {
    variant: 'success',
    body: 'A compact single-line alert with no heading.',
    dismissible: false,
  },
};
