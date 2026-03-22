/**
 * Tabs component behaviour — WAI-ARIA Authoring Practices compliant.
 *
 * Keyboard:
 *   ← / →   move focus to previous / next tab (wraps).
 *   Home    focus first tab.
 *   End     focus last tab.
 *   Enter / Space activate the focused tab.
 *
 * Mouse / pointer: clicking a tab activates it immediately.
 */

const ENHANCED = 'data-tabs-enhanced';

/**
 * @param {HTMLElement} root
 */
export function init(root) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(ENHANCED)) {
    return;
  }
  root.setAttribute(ENHANCED, 'true');
  root.classList.add('is-enhanced');

  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  if (tabs.length === 0) {
    return;
  }

  const panels = tabs
    .map((tab) => document.getElementById(tab.getAttribute('aria-controls')))
    .filter(Boolean);

  /**
   * Activate the tab at `index`. Focus it iff `focus` is true.
   *
   * @param {number} index
   * @param {boolean} focus
   */
  function activate(index, focus = false) {
    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.classList.toggle('is-active', isActive);
    });
    panels.forEach((panel, i) => {
      if (!panel) return;
      panel.hidden = i !== index;
      if (i === index) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('tabindex', '0');
      }
    });
    if (focus) {
      tabs[index].focus();
    }
  }

  // Initial state — use the `data-initial` attribute or first tab.
  const initial = Math.max(0, Math.min(parseInt(root.dataset.initial || '0', 10), tabs.length - 1));
  activate(initial, false);

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index, false));

    tab.addEventListener('keydown', (event) => {
      let next = null;
      switch (event.key) {
        case 'ArrowRight':
          next = (index + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          next = (index - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = tabs.length - 1;
          break;
        case 'Enter':
        case ' ':
          // Already focused — clicking activates. But Space scrolls the page
          // by default on buttons inside some shells; prevent that.
          event.preventDefault();
          activate(index, true);
          return;
        default:
          return;
      }
      event.preventDefault();
      activate(next, true);
    });
  });
}

/**
 * @param {ParentNode} scope
 */
export function initAll(scope = document) {
  scope.querySelectorAll('.c-tabs').forEach(init);
}

if (typeof window !== 'undefined' && window.Drupal && window.Drupal.behaviors) {
  window.Drupal.behaviors.sdcLibraryTabs = {
    attach(context) {
      initAll(context);
    },
  };
} else if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') {
    initAll(document);
  } else {
    document.addEventListener('DOMContentLoaded', () => initAll(document));
  }
}
