/* Listen to the Bible — verse-by-verse read-aloud for the Old and New
   Testament readers (old-testament.html / new-testament.html).

   Press Listen and the chapter on screen is read aloud one verse at a
   time with the device's own voice. The verse being read is highlighted
   and kept in view, a progress bar and "Verse N of M" line show exactly
   where you are, and when a chapter ends the next chapter starts on its
   own — so a reader can listen through the whole Bible page by page.
   Progress (last position + chapters completed) is kept on the device. */
(function () {
  'use strict';

  var versesEl = document.getElementById('chapterVerses');
  var titleEl = document.getElementById('chapterTitle');
  var nextBtn = document.getElementById('nextChapter');
  if (!versesEl || !titleEl) return;

  var page = /new-testament\.html/.test(location.pathname) ? 'new-testament.html' : 'old-testament.html';
  var books = (page === 'new-testament.html' ? window.NT_BOOKS : window.OT_BOOKS) || [];
  var testamentName = page === 'new-testament.html' ? 'New Testament' : 'Old Testament';
  var TOTAL_BIBLE_CHAPTERS = 1189;
  var STORE_KEY = 'gh-listen-v1';
  var RATE_KEY = 'gh-listen-rate';

  var CSS = [
    '.lb-bar{margin:14px 0 20px;padding:12px 14px;border:1px solid #b9c8d7;border-radius:10px;background:#fff}',
    '.lb-bar .lb-kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7a5c14;margin-bottom:8px;font-weight:700}',
    '.lb-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.lb-btn{border:1px solid #b9c8d7;background:#f4f7fa;border-radius:8px;padding:8px 12px;font-size:15px;cursor:pointer;line-height:1}',
    '.lb-btn:disabled{opacity:.4;cursor:default}',
    '.lb-play{background:#7a5c14;border-color:#7a5c14;color:#fff;font-weight:700;padding:9px 18px;font-size:15px}',
    '.lb-rate{border:1px solid #b9c8d7;border-radius:8px;padding:7px 6px;font-size:14px;background:#f4f7fa}',
    '.lb-track{height:8px;background:#e4eaf1;border-radius:99px;margin:12px 0 8px;overflow:hidden}',
    '.lb-fill{height:100%;width:0;background:#7a5c14;border-radius:99px;transition:width .3s ease}',
    '.lb-status{font-size:14px;font-weight:600;color:#22314a}',
    '.lb-overall{font-size:12.5px;color:#4e5a6e;margin-top:3px}',
    '.lb-note{font-size:12px;color:#4e5a6e;margin-top:8px}',
    '.lb-resume{margin-top:10px}',
    '.lb-resume button,.lb-resume a{display:inline-block;border:1px solid #7a5c14;color:#7a5c14;background:#fdf6dd;border-radius:8px;padding:8px 12px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none}',
    '.nt-verse.lb-now{background:#fdf0c0;border-radius:8px;box-shadow:0 0 0 7px #fdf0c0;transition:background .25s ease}',
    '.lb-done{font-size:14px;color:#2e6b30;font-weight:600;margin-top:8px}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('listenBibleStyle')) return;
    var s = document.createElement('style');
    s.id = 'listenBibleStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- saved progress ---------- */
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  }
  var store = loadStore();
  if (!store.done) store.done = {};

  /* ---------- chapter helpers ---------- */
  function chapterId() { return location.hash.slice(1); } // e.g. "GEN-1"

  function chapterInfo() {
    var id = chapterId();
    var dash = id.lastIndexOf('-');
    if (dash < 0) return null;
    var code = id.slice(0, dash);
    var chapter = Number(id.slice(dash + 1));
    var index = 0;
    for (var i = 0; i < books.length; i++) {
      if (books[i].code === code) {
        return { id: id, code: code, chapter: chapter, bookName: books[i].book, globalIndex: index + chapter, testamentChapters: books.reduce(function (n, b) { return n + b.chapters.length; }, 0) };
      }
      index += books[i].chapters.length;
    }
    return null;
  }

  function verseList() {
    return Array.prototype.slice.call(versesEl.querySelectorAll('p.nt-verse'));
  }

  function verseText(el) {
    var clone = el.cloneNode(true);
    var num = clone.querySelector('.verse-number');
    if (num) num.remove();
    var fn = clone.querySelectorAll('.footnote-open');
    for (var i = 0; i < fn.length; i++) fn[i].remove();
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /* ---------- state ---------- */
  var synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  var verses = [];
  var idx = 0;              // verse currently pointed at / being read (0-based)
  var playing = false;
  var paused = false;
  var token = 0;            // guards stale utterance callbacks after cancel()
  var autoAdvance = false;  // next chapter change was triggered by us
  var pendingStart = -1;    // verse to start from after a chapter change
  var voice = null;

  /* ---------- recorded chapter audio (real narrator voice) ----------
     Chapters listed in chapter-audio.js (window.CHAPTER_AUDIO) play a
     recorded KJV reading instead of the device voice; verse timing in
     the recording drives the same highlighting, progress and resume. */
  var CA = window.CHAPTER_AUDIO || {};
  var audioEl = null;
  var audioId = null;       // chapter id currently loaded in audioEl

  function audioEntry() {
    var info = chapterInfo();
    return (info && CA[info.id]) ? CA[info.id] : null;
  }
  function inAudioMode() { return !!audioEntry(); }

  function getAudio() {
    if (audioEl) return audioEl;
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.addEventListener('timeupdate', onAudioTime);
    audioEl.addEventListener('ended', function () { if (playing) chapterDone(); });
    return audioEl;
  }
  function updateFillAudio() {
    var e = audioEntry();
    if (!e || !audioEl || !fillEl) return;
    var d = audioEl.duration || e.dur || 0;
    if (d > 0) fillEl.style.width = Math.min(100, (audioEl.currentTime / d) * 100) + '%';
  }
  function onAudioTime() {
    var e = audioEntry();
    if (!e || !audioEl) return;
    var t = audioEl.currentTime;
    var v = 0;
    for (var i = 0; i < e.verses.length; i++) {
      if (t >= e.verses[i] - 0.05) v = i; else break;
    }
    if (v !== idx) { idx = v; highlight(); updateUI(); savePosition(); }
    updateFillAudio();
  }
  function startAudioAt(verseIndex, withIntro) {
    var e = audioEntry();
    var info = chapterInfo();
    if (!e || !info || !verses.length) return;
    token++;
    if (synth) synth.cancel();
    idx = Math.max(0, Math.min(verseIndex, verses.length - 1));
    playing = true;
    paused = false;
    voiceChangedWhilePaused = false;
    playbackStarted();
    doneEl.hidden = true;
    var a = getAudio();
    if (audioId !== info.id) { a.src = e.src; audioId = info.id; }
    a.playbackRate = rate();
    var target = (withIntro && verseIndex === 0) ? 0 : (e.verses[idx] || 0);
    var begin = function () {
      try { a.currentTime = target; } catch (err) {}
      var p = a.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
      highlight();
      updateUI();
      savePosition();
    };
    if (a.readyState >= 1) begin();
    else a.addEventListener('loadedmetadata', function h() {
      a.removeEventListener('loadedmetadata', h);
      begin();
    });
    highlight();
    updateUI();
  }

  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices();
    if (!vs.length) return;
    voice = vs.filter(function (v) { return /en[-_]US/i.test(v.lang) && /google/i.test(v.name); })[0]
      || vs.filter(function (v) { return /^en[-_]/i.test(v.lang) && v.default; })[0]
      || vs.filter(function (v) { return /^en[-_]/i.test(v.lang); })[0]
      || vs[0];
  }
  if (synth) {
    pickVoice();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = pickVoice;
  }

  /* The reader's saved voice (voice.js) wins; the heuristic above is
     only the fallback when no voice has been chosen. */
  var voiceChangedWhilePaused = false;
  function chosenVoice() {
    try { if (window.GHVoice) { var g = GHVoice.get(); if (g) return g; } } catch (e) {}
    return voice;
  }

  /* ---------- lock-screen / background support ---------- */
  function setMediaMetadata() {
    if (!('mediaSession' in navigator)) return;
    try {
      var info = chapterInfo();
      var t = info ? (info.bookName + ' ' + info.chapter) : (titleEl.textContent || testamentName);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t,
        artist: 'Gospel Harmony',
        album: 'Gospel Harmony \u2014 Listen',
        artwork: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }]
      });
    } catch (e) {}
  }
  function playbackStarted() {
    setMediaMetadata();
    if (window.GHVoice) { GHVoice.keepAliveStart(); GHVoice.acquireWakeLock(); }
  }
  function playbackEnded() {
    if (window.GHVoice) { GHVoice.keepAliveStop(); GHVoice.releaseWakeLock(); }
    if ('mediaSession' in navigator) { try { navigator.mediaSession.playbackState = 'none'; } catch (e) {} }
  }

  function rate() {
    var r = parseFloat(localStorage.getItem(RATE_KEY) || '1');
    return isNaN(r) ? 1 : r;
  }

  /* ---------- UI ---------- */
  var bar, playBtn, prevBtn, nextVerseBtn, stopBtn, rateSel, fillEl, statusEl, overallEl, resumeEl, doneEl, voiceSel, wakeBox;

  function buildBar() {
    addStyle();
    bar = document.createElement('div');
    bar.className = 'lb-bar';
    bar.id = 'listenBibleBar';
    bar.innerHTML =
      '<div class="lb-kicker">🔊 Listen to the Bible</div>' +
      '<div class="lb-row">' +
        '<button type="button" class="lb-btn lb-play" id="lbPlay">▶ Listen</button>' +
        '<button type="button" class="lb-btn" id="lbPrevVerse" aria-label="Previous verse">⏮</button>' +
        '<button type="button" class="lb-btn" id="lbNextVerse" aria-label="Next verse">⏭</button>' +
        '<button type="button" class="lb-btn" id="lbStop" aria-label="Stop listening">⏹</button>' +
        '<select class="lb-rate" id="lbRate" aria-label="Reading speed">' +
          '<option value="0.8">0.8×</option><option value="1">1×</option>' +
          '<option value="1.15">1.15×</option><option value="1.3">1.3×</option><option value="1.5">1.5×</option>' +
        '</select>' +
      '</div>' +
      '<div class="lb-row lb-opts">' +
        '<label class="lb-voice-label" for="lbVoice">Voice</label>' +
        '<select class="lb-voice" id="lbVoice" aria-label="Reading voice"></select>' +
        '<label class="lb-wake"><input type="checkbox" id="lbWake"> Keep screen on</label>' +
      '</div>' +
      '<div class="lb-track"><div class="lb-fill" id="lbFill"></div></div>' +
      '<div class="lb-status" id="lbStatus"></div>' +
      '<div class="lb-overall" id="lbOverall"></div>' +
      '<div class="lb-done" id="lbDone" hidden></div>' +
      '<div class="lb-resume" id="lbResume" hidden></div>' +
      '<div class="lb-note">Read aloud verse by verse with your device\u2019s voice, in the version on screen. When a chapter ends, the next one begins — keep listening through the whole Bible. Your place is saved on this device.</div>';
    versesEl.parentNode.insertBefore(bar, versesEl);
    playBtn = bar.querySelector('#lbPlay');
    prevBtn = bar.querySelector('#lbPrevVerse');
    nextVerseBtn = bar.querySelector('#lbNextVerse');
    stopBtn = bar.querySelector('#lbStop');
    rateSel = bar.querySelector('#lbRate');
    fillEl = bar.querySelector('#lbFill');
    statusEl = bar.querySelector('#lbStatus');
    overallEl = bar.querySelector('#lbOverall');
    resumeEl = bar.querySelector('#lbResume');
    doneEl = bar.querySelector('#lbDone');
    rateSel.value = String(rate());
    voiceSel = bar.querySelector('#lbVoice');
    wakeBox = bar.querySelector('#lbWake');
    if (window.GHVoice) {
      GHVoice.populate(voiceSel);
      voiceSel.addEventListener('change', onVoiceChange);
      wakeBox.checked = GHVoice.wakeLockOn();
      wakeBox.addEventListener('change', function () {
        GHVoice.setWakeLockPref(wakeBox.checked);
        if (wakeBox.checked && playing && !paused) GHVoice.acquireWakeLock();
      });
    } else {
      voiceSel.disabled = true;
      wakeBox.disabled = true;
    }
    if (!synth && !Object.keys(CA).length) {
      playBtn.disabled = true;
      statusEl.textContent = 'Listening is not available in this browser.';
      return;
    }
    playBtn.addEventListener('click', onPlayPause);
    stopBtn.addEventListener('click', function () { stopAll(true); });
    prevBtn.addEventListener('click', function () { jump(idx - 1); });
    nextVerseBtn.addEventListener('click', function () { jump(idx + 1); });
    rateSel.addEventListener('change', function () {
      try { localStorage.setItem(RATE_KEY, rateSel.value); } catch (e) {}
      if (audioEl && inAudioMode()) audioEl.playbackRate = rate();
    });
  }

  function completedCount() { return Object.keys(store.done).length; }

  function updateUI() {
    var info = chapterInfo();
    var total = verses.length;
    var title = titleEl.textContent || (info ? info.bookName + ' ' + info.chapter : '');
    if (total) {
      statusEl.textContent = title + ' · Verse ' + Math.min(idx + 1, total) + ' of ' + total +
        (playing ? (paused ? ' · Paused' : ' · Listening…') : '');
      fillEl.style.width = (total ? ((idx) / total) * 100 : 0) + '%';
    } else {
      statusEl.textContent = title;
      fillEl.style.width = '0%';
    }
    if (info) {
      overallEl.textContent = 'Chapter ' + info.globalIndex + ' of ' + info.testamentChapters + ' in the ' + testamentName +
        ' · ' + completedCount() + ' of ' + TOTAL_BIBLE_CHAPTERS + ' Bible chapters completed';
    }
    if ('mediaSession' in navigator) {
      try { navigator.mediaSession.playbackState = playing ? (paused ? 'paused' : 'playing') : 'none'; } catch (e) {}
    }
    playBtn.textContent = playing ? (paused ? '▶ Resume' : '⏸ Pause') : (idx > 0 ? '▶ Continue' : '▶ Listen');
    prevBtn.disabled = idx <= 0;
    nextVerseBtn.disabled = idx >= total - 1;
    stopBtn.disabled = !playing && idx === 0;
    if (inAudioMode() && audioEl) updateFillAudio();
  }

  function showResume() {
    var pos = store.pos;
    resumeEl.hidden = true;
    resumeEl.innerHTML = '';
    if (!pos || !pos.id) return;
    if (pos.page === page && pos.id === chapterId()) {
      if (pos.verse > 1 && !playing) {
        resumeEl.hidden = false;
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = 'Continue from verse ' + pos.verse;
        b.addEventListener('click', function () { resumeEl.hidden = true; startAt(pos.verse - 1, false); });
        resumeEl.appendChild(b);
      }
    } else {
      resumeEl.hidden = false;
      var a = document.createElement('a');
      a.href = pos.page + '#' + pos.id;
      a.textContent = 'Continue listening — ' + (pos.title || pos.id) + ', verse ' + (pos.verse || 1) + ' →';
      resumeEl.appendChild(a);
    }
  }

  function savePosition() {
    var info = chapterInfo();
    if (!info) return;
    store.pos = { page: page, id: info.id, verse: idx + 1, title: titleEl.textContent || (info.bookName + ' ' + info.chapter) };
    saveStore();
  }

  /* ---------- speaking ---------- */
  function clearHighlight() {
    var old = versesEl.querySelector('.lb-now');
    if (old) old.classList.remove('lb-now');
  }

  function highlight() {
    clearHighlight();
    var el = verses[idx];
    if (!el) return;
    el.classList.add('lb-now');
    var r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 40) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function speak(text, done) {
    var my = ++token;
    var u = new SpeechSynthesisUtterance(text);
    var v = chosenVoice();
    if (v) u.voice = v;
    u.lang = (v && v.lang) || 'en-US';
    u.rate = rate();
    u.onend = function () { if (my === token) done(); };
    u.onerror = function () { if (my === token) done(); };
    synth.speak(u);
  }

  function speakVerse() {
    if (!playing) return;
    if (idx >= verses.length) { chapterDone(); return; }
    highlight();
    updateUI();
    savePosition();
    var text = verseText(verses[idx]);
    if (!text) { idx++; speakVerse(); return; }
    speak(text, function () {
      if (!playing) return;
      idx++;
      if (idx >= verses.length) { chapterDone(); return; }
      speakVerse();
    });
  }

  function startAt(verseIndex, withIntro) {
    if (inAudioMode()) { startAudioAt(verseIndex, withIntro); return; }
    if (!synth || !verses.length) return;
    token++;
    synth.cancel();
    idx = Math.max(0, Math.min(verseIndex, verses.length - 1));
    playing = true;
    paused = false;
    voiceChangedWhilePaused = false;
    playbackStarted();
    doneEl.hidden = true;
    var info = chapterInfo();
    if (withIntro && info) {
      highlight();
      updateUI();
      speak(info.bookName + ', chapter ' + info.chapter + '.', function () {
        if (playing) speakVerse();
      });
    } else {
      speakVerse();
    }
    updateUI();
  }

  function onVoiceChange() {
    if (!window.GHVoice || !voiceSel) return;
    GHVoice.set(voiceSel.value || '');
    if (!playing) return;
    if (paused) { voiceChangedWhilePaused = true; return; } // applied on Resume
    startAt(idx, false); // re-read the current verse in the new voice
  }

  function onPlayPause() {
    if (inAudioMode()) {
      var a = getAudio();
      if (playing && !paused) {
        paused = true;
        a.pause();
        if (window.GHVoice) GHVoice.releaseWakeLock();
        updateUI();
        return;
      }
      if (playing && paused) {
        paused = false;
        a.playbackRate = rate();
        var p = a.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
        if (window.GHVoice) GHVoice.acquireWakeLock();
        updateUI();
        return;
      }
      startAt(idx, idx === 0);
      return;
    }
    if (!synth) return;
    if (playing && !paused) {
      paused = true;
      synth.pause();
      if (window.GHVoice) GHVoice.releaseWakeLock();
      updateUI();
      return;
    }
    if (playing && paused) {
      if (voiceChangedWhilePaused) { startAt(idx, false); return; }
      paused = false;
      synth.resume();
      if (window.GHVoice) GHVoice.acquireWakeLock();
      updateUI();
      return;
    }
    startAt(idx, idx === 0);
  }

  function jump(target) {
    if (!verses.length) return;
    target = Math.max(0, Math.min(target, verses.length - 1));
    if (playing) {
      paused = false;
      startAt(target, false);
    } else {
      idx = target;
      highlight();
      updateUI();
      savePosition();
    }
  }

  function stopAll(reset) {
    token++;
    if (synth) synth.cancel();
    if (audioEl) {
      try { audioEl.pause(); if (reset) audioEl.currentTime = 0; } catch (e) {}
    }
    playing = false;
    paused = false;
    playbackEnded();
    if (reset) { idx = 0; clearHighlight(); }
    updateUI();
    savePosition();
  }

  function chapterDone() {
    var info = chapterInfo();
    if (info) { store.done[info.id] = true; saveStore(); }
    fillEl.style.width = '100%';
    if (nextBtn && !nextBtn.disabled) {
      autoAdvance = true;
      pendingStart = 0;
      nextBtn.click();
      // render is synchronous in the readers, but guard anyway
      setTimeout(function () {
        if (autoAdvance) { autoAdvance = false; if (playing) startAt(0, true); }
      }, 350);
    } else {
      playing = false;
      paused = false;
      playbackEnded();
      idx = 0;
      clearHighlight();
      doneEl.hidden = false;
      if (page === 'old-testament.html') {
        doneEl.innerHTML = 'You have finished the Old Testament. <a href="new-testament.html#MAT-1">Continue into the New Testament →</a>';
      } else {
        doneEl.textContent = '🎉 You have finished the New Testament.';
      }
      updateUI();
      savePosition();
    }
  }

  /* ---------- per-chapter mode UI ---------- */
  function applyModeUI() {
    if (!bar) return;
    var e = audioEntry();
    var note = bar.querySelector('.lb-note');
    if (note) {
      note.textContent = e
        ? 'Read aloud by a real narrator voice, in the King James Version. When a chapter ends, the next one begins — keep listening through the whole Bible. Your place is saved on this device.'
        : 'Read aloud verse by verse with your device\u2019s voice, in the version on screen. When a chapter ends, the next one begins — keep listening through the whole Bible. Your place is saved on this device.';
    }
    var opts = bar.querySelector('.lb-opts');
    if (opts) opts.style.display = e ? 'none' : '';
  }

  /* ---------- chapter changes ---------- */
  function refreshChapter() {
    applyModeUI();
    verses = verseList();
    if (autoAdvance) {
      autoAdvance = false;
      idx = 0;
      if (playing) { startAt(0, true); }
    } else if (pendingStart >= 0) {
      idx = pendingStart;
      pendingStart = -1;
      if (playing) startAt(idx, false);
    } else if (playing) {
      startAt(0, true);
    } else {
      idx = 0;
      clearHighlight();
    }
    doneEl.hidden = true;
    updateUI();
    showResume();
  }

  /* ---------- init ---------- */
  buildBar();
  verses = verseList();
  applyModeUI();
  updateUI();
  showResume();

  var mo = new MutationObserver(function () { refreshChapter(); });
  mo.observe(versesEl, { childList: true });

  window.addEventListener('beforeunload', function () {
    if (synth) { token++; synth.cancel(); }
    if (audioEl) { try { audioEl.pause(); } catch (e) {} }
  });

  /* Returning to the app: if the system killed speech while the screen
     was locked / the app was backgrounded (common on iOS), pick the
     chapter back up at the current verse instead of staying silent. */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    if (window.GHVoice && playing && !paused) GHVoice.acquireWakeLock();
    if (!synth || !playing || paused) return;
    if (inAudioMode()) return;
    setTimeout(function () {
      if (playing && !paused && !autoAdvance && synth && !synth.speaking && !synth.pending) {
        startAt(idx, false);
      }
    }, 600);
  });

  // Chrome can stall long speech sessions; a gentle resume keeps it going.
  setInterval(function () {
    if (synth && playing && !paused && !inAudioMode()) { try { synth.resume(); } catch (e) {} }
  }, 10000);

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', function () { if (!playing) startAt(idx, idx === 0); else if (paused) onPlayPause(); });
      navigator.mediaSession.setActionHandler('pause', function () { if (playing && !paused) onPlayPause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function () { jump(idx - 1); });
      navigator.mediaSession.setActionHandler('nexttrack', function () { jump(idx + 1); });
    } catch (e) {}
  }
})();
