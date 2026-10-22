(() => {
  'use strict';
  // Keep native vertical scrolling, text selection and taps on study controls.
  window.enableStudySwipe = (reader, { previous, next, blocked }) => {
    let start = null;
    const interactive = (target) => target?.closest?.('button, a, input, select, textarea, summary, [role="button"], [contenteditable="true"], .study-map');
    reader.addEventListener('touchstart', (event) => {
      start = null;
      if (event.touches.length !== 1 || blocked() || interactive(event.target)) return;
      const touch = event.touches[0];
      // Leave the screen edges to the browser's back/forward gestures.
      if (touch.clientX < 24 || touch.clientX > window.innerWidth - 24) return;
      start = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }, { passive: true });
    reader.addEventListener('touchcancel', () => { start = null; }, { passive: true });
    reader.addEventListener('touchend', (event) => {
      if (!start || event.changedTouches.length !== 1 || blocked()) { start = null; return; }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const elapsed = Date.now() - start.time;
      start = null;
      if (elapsed > 900 || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.4 || window.getSelection?.()?.toString()) return;
      if (dx < 0) next(); else previous();
    }, { passive: true });
  };
})();
