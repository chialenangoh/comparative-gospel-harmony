/* Gospel Harmony — voice search (owner request 2026-11-24).
   Adds a microphone button beside every Scripture search box: the
   header search (form.hdr-search), the injected reader search bar
   (#ghSearchBar), the search page's main box (#bibleQuery) and the
   home page event filter (#searchInput). Tap the mic, speak a verse,
   a name or a topic, and the words land in the box and the search runs.

   Uses the Web Speech API (SpeechRecognition). Where the browser has
   no speech recognition (e.g. Firefox), no button is added at all —
   typing search keeps working exactly as before. Everything is
   defensive: a failure here must never break a page. */
(function () {
  'use strict';

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  var active = null; // { rec, input, btn, restorePlaceholder }

  function stopActive() {
    if (!active) return;
    var a = active;
    active = null;
    try { a.rec.stop(); } catch (e) { /* already stopped */ }
    paintButton(a.btn, false);
    if (a.input && a.restorePlaceholder != null) {
      a.input.placeholder = a.restorePlaceholder;
    }
  }

  function paintButton(btn, listening) {
    if (!btn) return;
    btn.textContent = listening ? '🔴' : '🎤';
    btn.setAttribute('aria-label', listening ? 'Stop voice search' : 'Search by voice');
    btn.style.background = listening ? '#b3261e' : '';
    btn.style.borderColor = listening ? '#b3261e' : '';
  }

  function makeButton(input) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gh-voice-btn';
    btn.textContent = '🎤';
    btn.setAttribute('aria-label', 'Search by voice');
    btn.title = 'Search by voice';
    btn.style.cssText = 'flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;' +
      'width:42px;height:42px;margin-left:6px;border-radius:9px;border:1px solid #b9c8d7;' +
      'background:#fff;color:#10243f;font-size:1.05rem;cursor:pointer;padding:0';
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (active && active.input === input) { stopActive(); return; }
      startListening(input, btn);
    });
    return btn;
  }

  function runSearch(input) {
    var form = input.form;
    if (input.id === 'searchInput') {
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (!form) return;
    if (form.id === 'bibleSearch') {
      // search.js handles this form's submit; requestSubmit fires it.
      if (form.requestSubmit) form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      return;
    }
    // Header / injected bars are plain GET forms to search.html.
    form.submit();
  }

  function startListening(input, btn) {
    stopActive();
    var rec;
    try { rec = new SR(); } catch (e) { return; }
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    var restorePlaceholder = input.placeholder;
    active = { rec: rec, input: input, btn: btn, restorePlaceholder: restorePlaceholder };
    paintButton(btn, true);
    input.placeholder = 'Listening… speak now';

    rec.onresult = function (ev) {
      var text = '';
      var isFinal = false;
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript;
        if (ev.results[i].isFinal) isFinal = true;
      }
      input.value = text;
      if (isFinal) {
        var done = active;
        stopActive();
        if (done) input.placeholder = done.restorePlaceholder;
        runSearch(input);
      }
    };
    rec.onerror = function (ev) {
      var a = active;
      stopActive();
      if (a && ev && ev.error === 'not-allowed') {
        input.placeholder = 'Microphone blocked — allow mic access and try again';
        setTimeout(function () {
          if (a.restorePlaceholder != null) input.placeholder = a.restorePlaceholder;
        }, 3500);
      }
    };
    rec.onend = function () {
      if (active && active.rec === rec) stopActive();
    };

    try { rec.start(); } catch (e) { stopActive(); }
    try { input.focus(); } catch (e) { /* focus is a nicety */ }
  }

  function attach(input) {
    if (!input || input.dataset.ghVoice === '1') return;
    input.dataset.ghVoice = '1';
    var btn = makeButton(input);
    if (input.parentNode) input.parentNode.insertBefore(btn, input.nextSibling);
  }

  function scan() {
    attach(document.querySelector('form.hdr-search input[name="q"]'));
    attach(document.querySelector('#ghSearchBar input[name="q"]'));
    attach(document.getElementById('bibleQuery'));
    attach(document.getElementById('searchInput'));
  }

  function init() {
    scan();
    // searchbar.js injects #ghSearchBar after DOMContentLoaded on some
    // pages; watch briefly for it, then stop watching.
    if (window.MutationObserver && !document.getElementById('ghSearchBar')) {
      var obs = new MutationObserver(function () {
        if (document.getElementById('ghSearchBar')) { scan(); obs.disconnect(); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { obs.disconnect(); }, 8000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
