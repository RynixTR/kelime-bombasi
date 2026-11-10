// Mobile Virtual Keyboard Handler via Visual Viewport API
// Ensures input bar is pinned above the virtual keyboard without UI getting broken

export function initVisualViewportHandler() {
  if (!window.visualViewport) return;

  function updateViewport() {
    const vv = window.visualViewport;
    const windowH = window.innerHeight;
    const keyboardHeight = Math.max(0, windowH - vv.height);

    document.documentElement.style.setProperty('--keyboard-offset', `${keyboardHeight}px`);

    // If keyboard is open, scroll focused input into comfortable view
    if (keyboardHeight > 0) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }

  window.visualViewport.addEventListener('resize', updateViewport);
  window.visualViewport.addEventListener('scroll', updateViewport);
  window.addEventListener('resize', updateViewport);

  updateViewport();
}
