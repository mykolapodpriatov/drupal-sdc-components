/**
 * Accordion component behaviour.
 *
 * Native <details> handles state already. This module adds:
 *   - "single open" behaviour for browsers that don't support the
 *     `name="…"` grouping attribute on <details>.
 *   - the `.c-accordion--js` marker that activates the CSS height animation.
 */

const ENHANCED = 'data-accordion-enhanced';

/**
 * @param {HTMLElement} root
 */
export function init(root) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(ENHANCED)) {
    return;
  }
  root.setAttribute(ENHANCED, 'true');
  root.classList.add('c-accordion--js');

  const items = Array.from(root.querySelectorAll('.c-accordion__item'));
  const allowMultiple = root.dataset.allowMultiple === 'true';

  // Polyfill the single-open behaviour for browsers that don't support
  // <details name="…">. Feature-detect by checking for the `name` IDL property.
  const supportsDetailsName = 'name' in document.createElement('details');

  if (!allowMultiple && !supportsDetailsName) {
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) {
          return;
        }
        items.forEach((other) => {
          if (other !== item && other.open) {
            other.open = false;
          }
        });
      });
    });
  }
}

/**
 * @param {ParentNode} scope
 */
export function initAll(scope = document) {
  scope.querySelectorAll('.c-accordion').forEach(init);
}

if (typeof window !== 'undefined' && window.Drupal && window.Drupal.behaviors) {
  window.Drupal.behaviors.sdcLibraryAccordion = {
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
