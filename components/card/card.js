/**
 * Card component behaviour.
 *
 * Makes the entire card clickable when a .c-card__link is present, without
 * breaking text-selection or middle-click-to-open. Progressive enhancement —
 * the card is fully usable without JS via its title link.
 */

const ALREADY_ATTACHED = 'data-card-enhanced';

/**
 * Enhance a single card root.
 *
 * @param {HTMLElement} root
 */
export function init(root) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(ALREADY_ATTACHED)) {
    return;
  }

  const link = root.querySelector('.c-card__link');
  if (!link) {
    return;
  }

  root.setAttribute(ALREADY_ATTACHED, 'true');
  root.classList.add('c-card--enhanced');
  root.style.cursor = 'pointer';

  let downX = 0;
  let downY = 0;

  root.addEventListener('mousedown', (event) => {
    downX = event.clientX;
    downY = event.clientY;
  });

  root.addEventListener('click', (event) => {
    // Don't hijack actual interactive children (buttons, other links, form controls).
    if (event.target.closest('a, button, input, textarea, select, [role="button"]')) {
      return;
    }

    // Detect text-selection drags — don't navigate if the user dragged.
    const dx = Math.abs(event.clientX - downX);
    const dy = Math.abs(event.clientY - downY);
    if (dx > 4 || dy > 4) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
      // Let the browser handle modified clicks — open the link manually
      // so middle-click / cmd-click still opens in a new tab.
      window.open(link.href, '_blank', 'noopener');
      return;
    }

    link.click();
  });
}

/**
 * Initialise every card found under `scope`.
 *
 * @param {ParentNode} scope
 */
export function initAll(scope = document) {
  scope.querySelectorAll('.c-card').forEach(init);
}

/* Drupal behaviour bridge — only runs inside a Drupal page. */
if (typeof window !== 'undefined' && window.Drupal && window.Drupal.behaviors) {
  window.Drupal.behaviors.sdcLibraryCard = {
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
