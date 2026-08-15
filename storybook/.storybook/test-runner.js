/**
 * Storybook test-runner hooks: run axe-core against every story.
 *
 * injectAxe must land in preVisit so the page has axe before render;
 * checkA11y runs in postVisit after the story (and any play function) finishes.
 *
 * @see https://storybook.js.org/docs/8/writing-tests/accessibility-testing
 */

import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright';

/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
  async preVisit(page) {
    await injectAxe(page);
  },

  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });

    await checkA11y(page, storyContext.parameters?.a11y?.element ?? '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: storyContext.parameters?.a11y?.options,
    });
  },
};

export default config;
