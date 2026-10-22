/* Easier swipe navigation for the harmony reader.
   The app's built-in swipe (swipe.js via app.js) demands a 70px, fast,
   near-perfectly-horizontal gesture starting on a non-interactive spot —
   on a phone, most real swipes start on an underlined word and fail.
   This handler listens in the capture phase with friendlier thresholds and,
   when it navigates, stops the event so the built-in handler cannot also
   fire (which would skip two events). Taps are untouched: a tap has almost
   no movement, so buttons and underlined words keep working exactly as
   before. Navigation goes through the app's own Previous/Next buttons. */
(function () {
  'use strict';

  var start = null;

  function blockedNow(target) {
    if (document.getElementById('votdModal')) return true;
    if (document.querySelector('dialog[open]')) return true;
    if (!target || !target.closest) return false;
    if (target.closest('audio, video, select, input, textarea, [contenteditable="true"]')) return true;
    return false;
  }

  document.addEventListener('touchstart', function (event) {
    start = null;
    if (event.touches.length !== 1) return;
    if (blockedNow(event.target)) return;
    var t = event.touches[0];
    if (t.clientX < 8 || t.clientX > window.innerWidth - 8) return;
    start = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, { passive: true, capture: true });

  document.addEventListener('touchcancel', function () { start = null; }, { passive: true, capture: true });

  document.addEventListener('touchend', function (event) {
    if (!start || event.changedTouches.length !== 1) { start = null; return; }
    var t = event.changedTouches[0];
    var dx = t.clientX - start.x;
    var dy = t.clientY - start.y;
    var elapsed = Date.now() - start.time;
    start = null;
    if (elapsed > 1200) return;
    if (Math.abs(dx) < 56) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (window.getSelection && String(window.getSelection())) return;
    var btn = document.getElementById(dx < 0 ? 'nextEvent' : 'previousEvent');
    if (!btn || btn.disabled || !btn.dataset.id) return;
    event.stopPropagation();
    btn.click();
  }, { passive: true, capture: true });
})();
