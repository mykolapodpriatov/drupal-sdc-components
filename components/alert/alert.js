/**
 * Alert component behaviour.
 *
 * Wires the optional dismiss button. Progressive enhancement — an alert with
 * no JS still renders and reads correctly; JS only adds the close affordance.
 *
 * Idempotent: each alert is enhanced at most once. The `data-alert-enhanced`
 * guard plays the role of Drupal's `once()`, so re-running attach() over the
 * same DOM never double-binds the handler.
 */

const ENHANCED = 'data-alert-enhanced';

/**
 * Enhance a single alert root.
 *
 * @param {HTMLElement} root
 */
export function init(root) {
  if (!(root instanceof HTMLElement) || root.hasAttribute(ENHANCED)) {
    return;
  }

  const button = root.querySelector('.c-alert__close');
  if (!button) {
    return;
  }

  root.setAttribute(ENHANCED, 'true');

  const dismiss = () => {
    root.classList.add('is-dismissing');

    let done = false;
    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      root.remove();
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      finish();
      return;
    }

    root.addEventListener('transitionend', finish, { once: true });
    // Fallback in case the transition never fires (e.g. a hidden ancestor).
    window.setTimeout(finish, 300);
  };

  button.addEventListener('click', dismiss);
}

/**
 * Initialise every alert found under `scope`.
 *
 * @param {ParentNode} scope
 */
export function initAll(scope = document) {
  scope.querySelectorAll('.c-alert').forEach(init);
}

/* Drupal behaviour bridge — only runs inside a Drupal page. */
if (typeof window !== 'undefined' && window.Drupal && window.Drupal.behaviors) {
  window.Drupal.behaviors.sdcLibraryAlert = {
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
