/* Listen to the Bible — Gospels player (index.html).
   Same design as the Testament readers' player (listen-bible.js), but it plays
   each event's recorded KJV reading (audio/event-<number>.mp3). Pressing Listen
   plays continuously from the current event through Event 185, then hands off
   to the Acts player (acts-harmony.html) via a localStorage flag. */
(function () {
  'use strict';

  var EVENTS = (window.GOSPEL_DATA && window.GOSPEL_DATA.events) || [];
  if (!EVENTS.length) return;
  var TOTAL = EVENTS.length;
  var SAVE_KEY = 'gh-gospels-listen-v1';
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
    '.gh-listen-resume button{cursor:pointer;font:inherit;font-weight:700;background:#10243f;color:#fff;border:1px solid #10243f;border-radius:10px;padding:.5rem 1rem}'
  ].join('\n');

  var state = {
    idx: 0,          // playlist index of the event currently shown/cued
    wantPlay: false, // user pressed Listen: keep going event after event
    pendingAutoplay: false,
    loadedNumber: null
  };

  var els = {};
  var audio = null;

  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ idx: state.idx })); } catch (e) {}
  }
  function rate() {
    var r = parseFloat(localStorage.getItem(RATE_KEY) || '1');
    return isNaN(r) ? 1 : r;
  }

  function indexFromHash() {
    var id = (location.hash || '').slice(1);
    for (var i = 0; i < TOTAL; i++) if (EVENTS[i].id === id) return i;
    return -1;
  }
  function indexFromHeading() {
    var el = document.getElementById('eventNumber');
    if (!el) return -1;
    var m = /Event\s+(\S+)\s+of/i.exec(el.textContent || '');
    if (!m) return -1;
    for (var i = 0; i < TOTAL; i++) if (String(EVENTS[i].number) === m[1]) return i;
    return -1;
  }
  function pageIndex() {
    var i = indexFromHash();
    return i >= 0 ? i : indexFromHeading();
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
        '<button type="button" class="gh-listen-btn" id="ghPrev" aria-label="Previous event">⏮</button>' +
        '<button type="button" class="gh-listen-btn" id="ghNext" aria-label="Next event">⏭</button>' +
        '<button type="button" class="gh-listen-btn" id="ghStop" aria-label="Stop listening">⏹</button>' +
        '<select class="gh-listen-rate" id="ghRate" aria-label="Listening speed">' +
          '<option value="0.75">0.75×</option><option value="0.9">0.9×</option>' +
          '<option value="1">1×</option><option value="1.1">1.1×</option>' +
          '<option value="1.25">1.25×</option><option value="1.5">1.5×</option>' +
          '<option value="1.75">1.75×</option><option value="2">2×</option>' +
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
    audio = document.createElement('audio');
    audio.preload = 'auto';
    els.play.addEventListener('click', onPlayPause);
    els.prev.addEventListener('click', function () { jump(state.idx - 1); });
    els.next.addEventListener('click', function () { jump(state.idx + 1); });
    els.stop.addEventListener('click', stopAll);
    els.rateSel.addEventListener('change', function () {
      try { localStorage.setItem(RATE_KEY, els.rateSel.value); } catch (e) {}
      if (audio) audio.playbackRate = rate();
    });
    els.rateSel.value = String(rate());
    els.resumeBtn.addEventListener('click', function () {
      var s = loadSave();
      if (s && s.idx >= 0 && s.idx < TOTAL) { state.wantPlay = true; jump(s.idx); }
    });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', refreshUI);
    audio.addEventListener('pause', refreshUI);
    return true;
  }

  function cue(idx, autoplay) {
    state.idx = idx;
    var ev = EVENTS[idx];
    state.loadedNumber = String(ev.number);
    audio.src = 'audio/event-' + ev.number + '.mp3';
    audio.playbackRate = rate();
    if (state.wantPlay) save();
    updateProgress();
    refreshUI();
    if (autoplay) playAudio();
  }

  function playAudio() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { refreshUI(); });
    setMediaSession();
  }

  function setMediaSession() {
    if (!('mediaSession' in navigator)) return;
    var ev = EVENTS[state.idx];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Event ' + ev.number + ': ' + ev.title,
        artist: 'Gospel Harmony — the four Gospels (KJV)',
        album: 'Listen to the Bible'
      });
      navigator.mediaSession.setActionHandler('previoustrack', function () { jump(state.idx - 1); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { jump(state.idx + 1); });
    } catch (e) {}
  }

  function onPlayPause() {
    if (!audio.paused) { audio.pause(); return; }
    state.wantPlay = true;
    if (state.loadedNumber !== String(EVENTS[state.idx].number)) cue(state.idx, false);
    playAudio();
    refreshUI();
  }

  function stopAll() {
    state.wantPlay = false;
    state.pendingAutoplay = false;
    if (audio) { audio.pause(); try { audio.currentTime = 0; } catch (e) {} }
    updateProgress();
    refreshUI();
  }

  function jump(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    var wasPlaying = audio && !audio.paused;
    state.pendingAutoplay = state.wantPlay && (wasPlaying || state.pendingAutoplay);
    if (idx === state.idx) { cue(idx, state.pendingAutoplay); return; }
    // Let the page render the event; syncToPage() cues the audio.
    if (('#' + EVENTS[idx].id) !== location.hash) location.hash = EVENTS[idx].id;
    else syncToPage();
  }

  function onEnded() {
    if (!state.wantPlay) { refreshUI(); return; }
    if (state.idx < TOTAL - 1) {
      state.pendingAutoplay = true;
      jump(state.idx + 1);
    } else {
      // The Gospels are finished — continue into Acts.
      state.wantPlay = false;
      try { localStorage.setItem(ACTS_FLAG, '1'); } catch (e) {}
      location.href = 'acts-harmony.html';
    }
  }

  function updateProgress() {
    if (!els.fill) return;
    var pct = 0;
    if (audio && audio.duration && isFinite(audio.duration)) {
      pct = Math.min(100, Math.max(0, (audio.currentTime / audio.duration) * 100));
    }
    els.fill.style.width = pct.toFixed(1) + '%';
  }

  function refreshUI() {
    if (!els.status) return;
    var ev = EVENTS[state.idx];
    var playing = audio && !audio.paused;
    els.play.textContent = playing ? '⏸ Pause' : (state.wantPlay ? '▶ Resume' : '▶ Listen');
    els.prev.disabled = state.idx <= 0;
    els.next.disabled = state.idx >= TOTAL - 1;
    els.stop.disabled = !playing && !state.wantPlay;
    els.status.textContent = 'Event ' + ev.number + ' of ' + TOTAL + ' · ' + ev.title;
    els.sub.textContent = 'The four Gospels, read aloud in order — after Event ' + EVENTS[TOTAL - 1].number + ' it continues into Acts.';
    var s = loadSave();
    if (s && s.idx > 0 && s.idx !== state.idx && !state.wantPlay) {
      els.resume.hidden = false;
      els.resumeBtn.textContent = '↩ Continue from Event ' + EVENTS[s.idx].number;
    } else {
      els.resume.hidden = true;
    }
  }

  function syncToPage() {
    var i = pageIndex();
    if (i < 0) return;
    if (i === state.idx && state.loadedNumber === String(EVENTS[i].number)) { refreshUI(); return; }
    cue(i, state.pendingAutoplay);
    state.pendingAutoplay = false;
  }

  function init() {
    if (!buildBar()) { setTimeout(init, 300); return; }
    var i = pageIndex();
    state.idx = i >= 0 ? i : 0;
    cue(state.idx, false);
    var target = document.getElementById('eventNumber');
    if (target && window.MutationObserver) {
      new MutationObserver(function () { syncToPage(); }).observe(target, { childList: true, characterData: true, subtree: true });
    }
    window.addEventListener('hashchange', function () { setTimeout(syncToPage, 30); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
