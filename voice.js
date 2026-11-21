/* Gospel Harmony — shared read-aloud voice picker + background helpers.

   One module for every speechSynthesis surface (listen-bible.js on the
   OT/NT readers, listen-acts.js on the Acts player):

   - GHVoice: the device's voices, sorted with English first, and the
     reader's saved choice (localStorage 'gh-voice-uri').
   - A silent looping <audio> keep-alive: while it plays, the page holds
     an audio session, which helps TTS keep going when the app is
     backgrounded (mainly Android Chrome). It cannot force iOS Safari to
     keep speaking after the phone locks — speechSynthesis there is
     paused by the system; the wake-lock toggle below is the mitigation.
   - Screen Wake Lock helpers so the screen can stay awake while a
     chapter is read (toggle persisted in localStorage 'gh-wake-lock',
     default ON).

   Everything is defensive: if anything here fails, the readers must
   still work exactly as before. */
(function () {
  'use strict';
  if (window.GHVoice) return;

  var VOICE_KEY = 'gh-voice-uri';
  var WAKE_KEY = 'gh-wake-lock';
  var SILENT_WAV = 'data:audio/wav;base64,UklGRsQPAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAPAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

  var synth = null;
  try { synth = ('speechSynthesis' in window) ? window.speechSynthesis : null; } catch (e) { synth = null; }

  var voices = [];          // sorted SpeechSynthesisVoice list
  var loaded = false;       // a non-empty list has been seen
  var readyQueue = [];      // callbacks waiting for the list
  var pickers = [];         // <select> elements to keep populated

  /* ---------- voice list ---------- */
  function rank(v) {
    var lang = (v.lang || '').replace('_', '-').toLowerCase();
    if (lang === 'en-us') return 0;
    if (lang === 'en-gb') return 1;
    if (lang.indexOf('en') === 0) return 2;
    return 3;
  }
  function sortVoices(list) {
    return list.slice().sort(function (a, b) {
      var d = rank(a) - rank(b);
      if (d) return d;
      var la = (a.lang || '').toLowerCase(), lb = (b.lang || '').toLowerCase();
      if (la !== lb) return la < lb ? -1 : 1;
      var na = (a.name || '').toLowerCase(), nb = (b.name || '').toLowerCase();
      if (na !== nb) return na < nb ? -1 : 1;
      return 0;
    });
  }
  function flushReady() {
    var q = readyQueue; readyQueue = [];
    for (var i = 0; i < q.length; i++) { try { q[i](voices); } catch (e) {} }
  }
  var refreshing = false;
  function refresh() {
    if (refreshing || !synth) return;
    refreshing = true;
    var raw = [];
    try { raw = synth.getVoices() || []; } catch (e) { raw = []; }
    if (raw.length) {
      voices = sortVoices(raw);
      loaded = true;
      for (var i = 0; i < pickers.length; i++) populate(pickers[i]);
      flushReady();
    }
    refreshing = false;
  }
  if (synth) {
    refresh();
    try {
      if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refresh);
      else if (typeof synth.onvoiceschanged !== 'undefined') {
        var prev = synth.onvoiceschanged;
        synth.onvoiceschanged = function () { refresh(); if (typeof prev === 'function') prev(); };
      }
    } catch (e) {}
    // Some browsers never fire voiceschanged until after a gesture; a
    // late retry means pickers still fill in instead of staying empty.
    setTimeout(refresh, 1200);
    setTimeout(refresh, 4000);
    setTimeout(function () { if (!loaded) { loaded = true; flushReady(); } }, 2500);
  }

  function storedURI() {
    try { return localStorage.getItem(VOICE_KEY) || ''; } catch (e) { return ''; }
  }

  /* ---------- picker ---------- */
  function populate(select) {
    if (!select || !select.appendChild) return;
    refresh(); // pick up voices even if a voiceschanged handler was replaced
    try {
      if (pickers.indexOf(select) === -1) pickers.push(select);
      var want = storedURI();
      select.innerHTML = '';
      var def = document.createElement('option');
      def.value = '';
      def.textContent = 'Default voice';
      select.appendChild(def);
      for (var i = 0; i < voices.length; i++) {
        var o = document.createElement('option');
        o.value = voices[i].voiceURI;
        o.textContent = voices[i].name + ' (' + voices[i].lang + ')';
        select.appendChild(o);
      }
      select.value = want;
      if (select.value !== want) select.value = ''; // saved voice is gone → Default
    } catch (e) {}
  }

  /* ---------- keep-alive (silent looping audio) ---------- */
  var kaAudio = null;
  function keepAliveStart() {
    try {
      if (!kaAudio) {
        kaAudio = document.createElement('audio');
        kaAudio.src = SILENT_WAV;
        kaAudio.loop = true;
        kaAudio.volume = 0;
        kaAudio.setAttribute('playsinline', '');
        kaAudio.setAttribute('aria-hidden', 'true');
      }
      var p = kaAudio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } catch (e) {}
  }
  function keepAliveStop() {
    try { if (kaAudio && !kaAudio.paused) kaAudio.pause(); } catch (e) {}
  }

  /* ---------- wake lock ---------- */
  var wakeSentinel = null;
  function wakeLockOn() {
    try { return localStorage.getItem(WAKE_KEY) !== '0'; } catch (e) { return true; }
  }
  function setWakeLockPref(on) {
    try { localStorage.setItem(WAKE_KEY, on ? '1' : '0'); } catch (e) {}
    if (!on) releaseWakeLock();
  }
  function acquireWakeLock() {
    if (!wakeLockOn()) return;
    try {
      if (!('wakeLock' in navigator) || wakeSentinel) return;
      navigator.wakeLock.request('screen').then(function (s) {
        wakeSentinel = s;
        try {
          s.addEventListener('release', function () { if (wakeSentinel === s) wakeSentinel = null; });
        } catch (e) {}
      }).catch(function () {});
    } catch (e) {}
  }
  function releaseWakeLock() {
    try {
      if (wakeSentinel) { var s = wakeSentinel; wakeSentinel = null; s.release(); }
    } catch (e) {}
  }

  window.GHVoice = {
    /* cb(list) runs once a voice list is available (or after a grace
       period with whatever we have, possibly empty). */
    ready: function (cb) {
      if (typeof cb !== 'function') return;
      if (loaded) { try { cb(voices); } catch (e) {} return; }
      readyQueue.push(cb);
    },
    list: function () { return voices.slice(); },
    /* The reader's chosen voice, or null for the device default. A
       saved voiceURI that no longer exists falls back to null. */
    get: function () {
      var uri = storedURI();
      if (!uri) return null;
      refresh();
      for (var i = 0; i < voices.length; i++) if (voices[i].voiceURI === uri) return voices[i];
      return null;
    },
    set: function (uri) {
      try {
        if (uri) localStorage.setItem(VOICE_KEY, uri);
        else localStorage.removeItem(VOICE_KEY);
      } catch (e) {}
    },
    populate: populate,
    keepAliveStart: keepAliveStart,
    keepAliveStop: keepAliveStop,
    wakeLockOn: wakeLockOn,
    setWakeLockPref: setWakeLockPref,
    acquireWakeLock: acquireWakeLock,
    releaseWakeLock: releaseWakeLock
  };
})();
