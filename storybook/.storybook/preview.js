/**
 * Global Storybook preview config.
 *
 * Loads every component's CSS once so stories don't have to. Each component's
 * JS is imported lazily by its story file when behaviour is needed.
 */

import '../../components/card/card.css';
import '../../components/accordion/accordion.css';
import '../../components/tabs/tabs.css';
import '../../components/hero/hero.css';

/** @type {import('@storybook/html').Preview} */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'muted', value: '#f5f5f7' },
        { name: 'dark', value: '#0a1019' },
      ],
    },
    a11y: {
      element: '#storybook-root',
      manual: false,
    },
  },
};

export default preview;
