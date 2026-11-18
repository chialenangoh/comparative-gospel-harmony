/* Listen to the Bible — Acts player (acts-harmony.html).
   Same design as the other Listen players. Reads each Acts event's passage
   aloud verse by verse with the device voice, highlights the verse being read,
   and keeps going event after event to the end of Acts. When the listener
   arrives from the Gospels player (which sets a flag when the last Gospel
   event finishes), it starts by itself. Progress is saved on the device. */
(function () {
  'use strict';

  var EVENTS = window.ACTS_EVENTS || [];
  var synth = window.speechSynthesis;
  if (!EVENTS.length || !synth) return;
  var TOTAL = EVENTS.length;
  var SAVE_KEY = 'gh-acts-listen-v1';
  var RATE_KEY = 'gh-listen-rate';
  var ACTS_FLAG = 'gh-acts-autoplay';

  var CSS = [
    '.gh-listen{margin:14px 0 22px;padding:14px 16px;border:1px solid #b9c8d7;border-radius:12px;background:#fff;clear:both}',
    '.gh-listen-kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7a5c14;font-weight:700;margin-bottom:10px}',
    '.gh-listen-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
    '.gh-listen-play{cursor:pointer;font:inherit;font-weight:800;font-size:1.05rem;background:#e3c57e;color:#101f33;border:1px solid #e3c57e;border-radius:10px;padding:.55rem 1.2rem}',
    '.gh-listen-play:hover,.gh-listen-play:focus-visible{background:#ffe2a1}',
    '.gh-listen-btn{cursor:pointer;font:inherit;font-size:1rem;background:#fff;color:#10243f;border:1px solid #b9c8d7;border-radius:10px;padding:.55rem .8rem}',
    '.gh-listen-btn:disabled{opacity:.4;cursor:default}',
    '.gh-listen-rate{font:inherit;background:#fff;color:#10243f;border:1px solid #b9c8d7;border-radius:10px;padding:.55rem .5rem}',
    '.gh-listen-track{height:8px;border-radius:99px;background:#e3eaf2;margin-top:12px;overflow:hidden}',
    '.gh-listen-fill{height:100%;width:0%;background:#c9a227;border-radius:99px;transition:width .2s linear}',
    '.gh-listen-status{margin-top:8px;font-weight:700;color:#10243f}',
    '.gh-listen-sub{font-size:.85rem;color:#4e5a6e;margin-top:2px}',
    '.gh-listen-resume{margin-top:10px}',
    '.gh-listen-resume button{cursor:pointer;font:inherit;font-weight:700;background:#10243f;color:#fff;border:1px solid #10243f;border-radius:10px;padding:.5rem 1rem}',
    '.gh-listen-current{background:#fdf3d0!important;border-radius:6px;box-shadow:0 0 0 3px #fdf3d0}'
  ].join('\n');

  var state = {
    idx: 0,        // Acts event index (0-based)
    verses: [],    // [{el, text}] for the current event's main passage
    vi: -1,        // verse being read (-1 = intro / none)
    playing: false,
    paused: false,
    token: 0,      // increments to invalidate stale utterance callbacks
    awaitingRender: false,
    fromGospels: false
  };
  var els = {};

  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; }
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ idx: state.idx, vi: Math.max(0, state.vi) }));
    } catch (e) {}
  }
  function rate() {
    var r = parseFloat(localStorage.getItem(RATE_KEY) || '1');
    return isNaN(r) ? 1 : r;
  }
  function ev() { return EVENTS[state.idx]; }
  function evLabel() {
    var e = ev();
    return 'Acts ' + e.chapter + ':' + e.start + '–' + e.end;
  }

  function buildBar() {
    if (document.getElementById('ghListen')) return true;
    var anchor = document.getElementById('eventVisuals');
    if (!anchor || !anchor.parentNode) return false;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    var bar = document.createElement('div');
    bar.className = 'gh-listen';
    bar.id = 'ghListen';
    bar.innerHTML =
      '<div class="gh-listen-kicker">🔊 Listen to the Bible</div>' +
      '<div class="gh-listen-row">' +
        '<button type="button" class="gh-listen-play" id="ghPlay">▶ Listen</button>' +
        '<button type="button" class="gh-listen-btn" id="ghPrev" aria-label="Previous verse">⏮</button>' +
        '<button type="button" class="gh-listen-btn" id="ghNext" aria-label="Next verse">⏭</button>' +
        '<button type="button" class="gh-listen-btn" id="ghStop" aria-label="Stop listening">⏹</button>' +
        '<select class="gh-listen-rate" id="ghRate" aria-label="Listening speed">' +
          '<option value="0.8">0.8×</option><option value="0.9">0.9×</option>' +
          '<option value="1">1×</option><option value="1.1">1.1×</option>' +
          '<option value="1.25">1.25×</option><option value="1.5">1.5×</option>' +
        '</select>' +
      '</div>' +
      '<div class="gh-listen-track"><div class="gh-listen-fill" id="ghFill"></div></div>' +
      '<div class="gh-listen-status" id="ghStatus"></div>' +
      '<div class="gh-listen-sub" id="ghSub"></div>' +
      '<div class="gh-listen-resume" id="ghResume" hidden><button type="button" id="ghResumeBtn"></button></div>';
    anchor.parentNode.insertBefore(bar, anchor);
    els = {
      play: document.getElementById('ghPlay'),
      prev: document.getElementById('ghPrev'),
      next: document.getElementById('ghNext'),
      stop: document.getElementById('ghStop'),
      rateSel: document.getElementById('ghRate'),
      fill: document.getElementById('ghFill'),
      status: document.getElementById('ghStatus'),
      sub: document.getElementById('ghSub'),
      resume: document.getElementById('ghResume'),
      resumeBtn: document.getElementById('ghResumeBtn')
    };
    els.play.addEventListener('click', onPlayPause);
    els.prev.addEventListener('click', function () { stepVerse(-1); });
    els.next.addEventListener('click', function () { stepVerse(1); });
    els.stop.addEventListener('click', stopAll);
    els.rateSel.addEventListener('change', function () {
      try { localStorage.setItem(RATE_KEY, els.rateSel.value); } catch (e) {}
      if (state.playing && !state.paused) restartVerse();
    });
    els.rateSel.value = String(rate());
    els.resumeBtn.addEventListener('click', function () {
      var s = loadSave();
      if (!s) return;
      goToEvent(s.idx, function () { startAt(s.vi || 0); });
    });
    return true;
  }

  function collectVerses() {
    var nodes = document.querySelectorAll('#eventPassages .acts-primary p.nt-verse');
    state.verses = [];
    for (var i = 0; i < nodes.length; i++) {
      var clone = nodes[i].cloneNode(true);
      var num = clone.querySelector('.verse-number');
      if (num) num.remove();
      var text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) state.verses.push({ el: nodes[i], text: text });
    }
  }

  function indexFromPage() {
    var id = (location.hash || '').slice(1);
    for (var i = 0; i < TOTAL; i++) if (EVENTS[i].id === id) return i;
    var el = document.getElementById('eventNumber');
    var m = el && /Event\s+(\d+)\s+of/i.exec(el.textContent || '');
    return m ? Math.min(TOTAL - 1, parseInt(m[1], 10) - 1) : -1;
  }

  function highlight() {
    var prev = document.querySelector('.gh-listen-current');
    if (prev) prev.classList.remove('gh-listen-current');
    if (state.vi >= 0 && state.verses[state.vi]) {
      var el = state.verses[state.vi].el;
      el.classList.add('gh-listen-current');
      if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function refreshUI() {
    if (!els.status) return;
    var e = ev();
    els.play.textContent = state.playing ? (state.paused ? '▶ Resume' : '⏸ Pause') : '▶ Listen';
    els.prev.disabled = !state.verses.length || (state.idx === 0 && state.vi <= 0);
    els.next.disabled = !state.verses.length || (state.idx === TOTAL - 1 && state.vi >= state.verses.length - 1);
    els.stop.disabled = !state.playing;
    var verseBit = state.verses.length
      ? ' · Verse ' + Math.max(1, state.vi + 1) + ' of ' + state.verses.length
      : '';
    els.status.textContent = evLabel() + verseBit + ' — ' + e.title;
    els.sub.textContent = 'Event ' + (state.idx + 1) + ' of ' + TOTAL + ' in Acts · the story continues from the Gospels';
    var total = state.verses.length || 1;
    var done = state.vi < 0 ? 0 : state.vi + (state.playing && !state.paused ? 0.5 : 0);
    els.fill.style.width = Math.min(100, (done / total) * 100).toFixed(1) + '%';
    var s = loadSave();
    if (s && !state.playing && (s.idx !== state.idx || (s.vi || 0) !== Math.max(0, state.vi)) && (s.idx > 0 || (s.vi || 0) > 0)) {
      els.resume.hidden = false;
      els.resumeBtn.textContent = '↩ Continue from Event ' + (s.idx + 1) + ', verse ' + ((s.vi || 0) + 1);
    } else {
      els.resume.hidden = true;
    }
  }

  function speak(text, onend) {
    var my = ++state.token;
    var u = new SpeechSynthesisUtterance(text);
    u.rate = rate();
    u.onend = function () { if (my === state.token) onend(); };
    u.onerror = function () { if (my === state.token) onend(); };
    synth.speak(u);
  }

  function playVerse() {
    if (state.vi >= state.verses.length) { finishEvent(); return; }
    highlight();
    refreshUI();
    save();
    speak(state.verses[state.vi].text, function () {
      if (!state.playing || state.paused) return;
      state.vi++;
      playVerse();
    });
  }

  function startAt(vi) {
    collectVerses();
    if (!state.verses.length) { finishEvent(); return; }
    state.playing = true;
    state.paused = false;
    state.vi = Math.max(0, Math.min(vi || 0, state.verses.length - 1));
    highlight();
    refreshUI();
    var e = ev();
    speak('Event ' + (state.idx + 1) + ' of ' + TOTAL + '. ' + e.title + '. ' + evLabel() + '.', function () {
      if (!state.playing || state.paused) return;
      playVerse();
    });
  }

  function finishEvent() {
    clearHighlightOnly();
    if (state.idx < TOTAL - 1) {
      goToEvent(state.idx + 1, function () { startAt(0); });
    } else {
      state.playing = false;
      state.paused = false;
      state.vi = -1;
      refreshUI();
      els.status.textContent = '🎉 You have finished the Gospels and Acts';
      els.sub.innerHTML = 'From the birth of Jesus to Paul in Rome — the whole story, read aloud. <a href="index.html">Back to the Gospels</a>';
      els.fill.style.width = '100%';
    }
  }

  function clearHighlightOnly() {
    var prev = document.querySelector('.gh-listen-current');
    if (prev) prev.classList.remove('gh-listen-current');
  }

  function goToEvent(idx, after) {
    if (idx < 0 || idx >= TOTAL) return;
    state.idx = idx;
    state.vi = -1;
    state.awaitingRender = true;
    var target = '#' + EVENTS[idx].id;
    if (location.hash !== target) location.hash = target;
    var tries = 0;
    (function wait() {
      var now = indexFromPage();
      var ready = now === idx && document.querySelectorAll('#eventPassages .acts-primary p.nt-verse').length > 0;
      if (ready || tries > 30) {
        state.awaitingRender = false;
        collectVerses();
        refreshUI();
        if (after) after();
      } else {
        tries++;
        setTimeout(wait, 120);
      }
    })();
  }

  function onPlayPause() {
    if (state.playing && !state.paused) { synth.pause(); state.paused = true; refreshUI(); return; }
    if (state.playing && state.paused) { state.paused = false; synth.resume(); refreshUI(); return; }
    startAt(state.vi > 0 ? state.vi : 0);
  }

  function stopAll() {
    state.token++;
    synth.cancel();
    state.playing = false;
    state.paused = false;
    state.vi = -1;
    clearHighlightOnly();
    refreshUI();
  }

  function restartVerse() {
    if (state.vi < 0) return;
    synth.cancel();
    state.token++;
    state.paused = false;
    playVerse();
  }

  function stepVerse(dir) {
    if (!state.verses.length) collectVerses();
    if (!state.playing) {
      state.vi = Math.max(0, Math.min((state.vi < 0 ? 0 : state.vi) + dir, state.verses.length - 1));
      highlight();
      refreshUI();
      return;
    }
    var target = state.vi + dir;
    if (target < 0) {
      if (state.idx > 0) { var wasPlaying = true; goToEvent(state.idx - 1, function () { if (wasPlaying) startAt(state.verses.length - 1); }); }
      return;
    }
    if (target >= state.verses.length) { synth.cancel(); state.token++; finishEvent(); return; }
    synth.cancel();
    state.token++;
    state.vi = target;
    state.paused = false;
    playVerse();
  }

  function syncToPage() {
    if (state.awaitingRender || state.playing) return;
    var i = indexFromPage();
    if (i >= 0 && i !== state.idx) {
      state.idx = i;
      state.vi = -1;
      collectVerses();
      refreshUI();
    }
  }

  function init() {
    if (!buildBar()) { setTimeout(init, 300); return; }
    var i = indexFromPage();
    state.idx = i >= 0 ? i : 0;
    collectVerses();
    refreshUI();
    window.addEventListener('hashchange', function () { setTimeout(syncToPage, 60); });
    var target = document.getElementById('eventNumber');
    if (target && window.MutationObserver) {
      new MutationObserver(function () { syncToPage(); }).observe(target, { childList: true, characterData: true, subtree: true });
    }
    // Arriving from the Gospels player: keep the story going on its own.
    var flagged = false;
    try {
      flagged = localStorage.getItem(ACTS_FLAG) === '1';
      if (flagged) localStorage.removeItem(ACTS_FLAG);
    } catch (e) {}
    if (flagged) {
      state.fromGospels = true;
      goToEvent(0, function () {
        startAt(0);
        // Some browsers will not speak until the visitor taps once; arm a
        // one-tap fallback so the first touch anywhere starts the reading.
        setTimeout(function () {
          if (state.playing && !synth.speaking && !synth.pending) {
            var arm = function () {
              document.removeEventListener('pointerdown', arm);
              if (state.playing) { synth.cancel(); state.token++; playVerse(); }
            };
            document.addEventListener('pointerdown', arm);
            els.status.textContent = 'Continuing from the Gospels — tap anywhere to hear Acts';
          }
        }, 900);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
