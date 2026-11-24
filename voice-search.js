/* Gospel Harmony — voice search (owner request 2026-11-24).
   Adds a microphone button beside every Scripture search box: the
   header search (form.hdr-search), the injected reader search bar
   (#ghSearchBar), the search page's main box (#bibleQuery) and the
   home page event filter (#searchInput). Tap the mic, speak a verse,
   a name or a topic, and the words land in the box and the search runs.

   Spoken references are normalized before searching (fix 2026-11-24):
   speech engines hear "Isaiah forty seven" or "Isaiah 40 7" or merge
   it into "Isaiah 47" — none of which the search understands. The
   normalizer turns number words into digits, understands "chapter /
   verse" phrasing ("Isaiah chapter 40 verse 7"), joins a spoken
   chapter + verse pair with a colon, checks every recognition
   alternative and keeps the one that reads as a real reference, and
   only then falls back to the words as heard. Non-reference speech
   ("love one another") passes through untouched.

   Uses the Web Speech API (SpeechRecognition). Where the browser has
   no speech recognition (e.g. Firefox), no button is added at all —
   typing search keeps working exactly as before. Everything is
   defensive: a failure here must never break a page. */
(function () {
  'use strict';

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  /* ---------------- spoken-reference normalizer ---------------- */

  // Book name (lowercase, as spoken) -> number of chapters.
  var BOOKS = {
    'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
    'joshua': 24, 'judges': 21, 'ruth': 4,
    '1 samuel': 31, '2 samuel': 24, '1 kings': 22, '2 kings': 25,
    '1 chronicles': 29, '2 chronicles': 36, 'ezra': 10, 'nehemiah': 13, 'esther': 10,
    'job': 42, 'psalms': 150, 'psalm': 150, 'proverbs': 31, 'ecclesiastes': 12,
    'song of solomon': 8, 'song of songs': 8, 'isaiah': 66, 'jeremiah': 52,
    'lamentations': 5, 'ezekiel': 48, 'daniel': 12, 'hosea': 14, 'joel': 3, 'amos': 9,
    'obadiah': 1, 'jonah': 4, 'micah': 7, 'nahum': 3, 'habakkuk': 3, 'zephaniah': 3,
    'haggai': 2, 'zechariah': 14, 'malachi': 4,
    'matthew': 28, 'mark': 16, 'luke': 24, 'john': 21, 'acts': 28, 'romans': 16,
    '1 corinthians': 16, '2 corinthians': 13, 'galatians': 6, 'ephesians': 6,
    'philippians': 4, 'colossians': 4, '1 thessalonians': 5, '2 thessalonians': 3,
    '1 timothy': 6, '2 timothy': 4, 'titus': 3, 'philemon': 1, 'hebrews': 13,
    'james': 5, '1 peter': 5, '2 peter': 3, '1 john': 5, '2 john': 1, '3 john': 1,
    'jude': 1, 'revelation': 22, 'revelations': 22
  };
  // Longest names first so "song of solomon" wins over "song"-less prefixes.
  var BOOK_NAMES = Object.keys(BOOKS).sort(function (a, b) { return b.length - a.length; });

  var ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
    fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
  var TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
    eighty: 80, ninety: 90 };
  var ORDINAL = { first: '1', second: '2', third: '3', '1st': '1', '2nd': '2', '3rd': '3' };

  function has(obj, k) { return Object.prototype.hasOwnProperty.call(obj, k); }

  // One token that is a number word (or compound like "forty-seven") -> value or null.
  function numberWord(tok) {
    if (/^\d+$/.test(tok)) return parseInt(tok, 10);
    if (has(ONES, tok)) return ONES[tok];
    if (has(TENS, tok)) return TENS[tok];
    var parts = tok.split('-');
    if (parts.length === 2 && has(TENS, parts[0]) && has(ONES, parts[1])) {
      return TENS[parts[0]] + ONES[parts[1]];
    }
    return null;
  }

  // A run of tokens forming ONE spoken number: "forty seven" (47),
  // "one hundred nineteen" (119), "twenty-three" (23). Returns
  // { value, used } or null. Two separate numbers said back to back
  // ("forty, seven") arrive as separate runs only when a pause word
  // or punctuation splits them — handled by the caller.
  function readNumber(tokens, i) {
    var v = numberWord(tokens[i]);
    if (v == null) return null;
    var used = 1;
    // compound: tens followed by a one ("forty" "seven" -> 47).
    // Remember the split: said as two beats it usually means 40 + 7.
    var split = null;
    if (has(TENS, tokens[i]) && i + 1 < tokens.length && has(ONES, tokens[i + 1]) && ONES[tokens[i + 1]] < 10) {
      split = { chapter: TENS[tokens[i]], verse: ONES[tokens[i + 1]] };
      v += ONES[tokens[i + 1]];
      used = 2;
    }
    // hundreds: "one hundred nineteen" / "one hundred and nineteen"
    if (tokens[i + 1] === 'hundred' || (used === 1 && tokens[i + 1] === 'hundred')) {
      // handled below in the hundred branch
    }
    if (used === 1 && v > 0 && v < 10 && tokens[i + 1] === 'hundred') {
      var h = v * 100;
      var j = i + 2;
      if (tokens[j] === 'and') j++;
      var rest = (j < tokens.length) ? readNumber(tokens, j) : null;
      if (rest) return { value: h + rest.value, used: (j - i) + rest.used };
      return { value: h, used: 2 };
    }
    return { value: v, used: used, split: split };
  }

  // Try to read a transcript as a Bible reference. Returns
  // { text: "Isaiah 40:7", score } or null when it is not a reference.
  function parseSpokenReference(raw) {
    var s = ' ' + raw.toLowerCase().replace(/[.,;:!?'"“”‘’()]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    // Ordinal book prefixes: "first corinthians" -> "1 corinthians"
    s = s.replace(/ (first|second|third) /, function (m, w) { return ' ' + ORDINAL[w] + ' '; });

    for (var b = 0; b < BOOK_NAMES.length; b++) {
      var book = BOOK_NAMES[b];
      var idx = s.indexOf(' ' + book + ' ');
      if (idx === -1) continue;
      var display = book.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      if (display === 'Psalm') display = 'Psalms';
      if (display === 'Revelations') display = 'Revelation';
      var rest = s.slice(idx + book.length + 2).trim();
      if (!rest) return null;
      var tokens = rest.split(' ');
      var chapters = BOOKS[book];
      var pos = 0;
      var saidChapter = false;
      if (tokens[pos] === 'chapter') { pos++; saidChapter = true; }
      var ch = readNumber(tokens, pos);
      if (!ch) return null;
      pos += ch.used;
      var chapter = ch.value;
      if (chapter < 1 || chapter > chapters) {
        // A merged number that is not a chapter may be chapter+verse
        // fused ("ruth 41" -> Ruth 4:1, since Ruth has only 4 chapters).
        var str = String(chapter);
        if (str.length === 2) {
          var c1 = parseInt(str.charAt(0), 10);
          var v1 = parseInt(str.charAt(1), 10);
          if (c1 >= 1 && c1 <= chapters && v1 >= 1 && pos >= tokens.length) {
            return { text: display + ' ' + c1 + ':' + v1, score: 3 };
          }
        }
        return null;
      }
      if (pos >= tokens.length) {
        // "Isaiah forty seven" said as two beats (a tens word + a ones
        // word) usually means chapter 40, verse 7 — prefer that split
        // reading. A merged number ("Isaiah 47") stays the chapter: it
        // is also how a genuine chapter citation sounds, and whole
        // chapters (John 21, Jeremiah 29) must not be broken. Psalms
        // are exempt — their bare numbers are whole chapters (Psalm
        // 23) — and so is anything introduced with the word "chapter".
        // A split landing on verse 1 is not taken either: "John
        // twenty one" is the chapter far more often than John 20:1.
        if (!saidChapter && book !== 'psalms' && book !== 'psalm' && ch.split &&
            ch.split.chapter >= 1 && ch.split.chapter <= chapters && ch.split.verse >= 2) {
          return { text: display + ' ' + ch.split.chapter + ':' + ch.split.verse, score: 3 };
        }
        return { text: display + ' ' + chapter, score: 2 };
      }
      if (tokens[pos] === 'verse' || tokens[pos] === 'verses') pos++;
      var vs = readNumber(tokens, pos);
      if (!vs) return null;
      pos += vs.used;
      var verse = vs.value;
      if (verse < 1 || verse > 176) return null;
      var out = display + ' ' + chapter + ':' + verse;
      // Optional range: "to 12" / "through 12"
      if ((tokens[pos] === 'to' || tokens[pos] === 'through') && pos + 1 < tokens.length) {
        var en = readNumber(tokens, pos + 1);
        if (en && en.value > verse && en.value <= 176) out += '-' + en.value;
      }
      return { text: out, score: 3 };
    }
    return null;
  }

  // Pick the best reading from the recognition alternatives.
  function bestTranscript(result) {
    var best = null;
    var bestScore = -1;
    var firstText = '';
    for (var i = 0; i < result.length; i++) {
      var alt = result[i];
      if (!alt || !alt.transcript) continue;
      var text = alt.transcript.trim();
      if (!firstText) firstText = text;
      var ref = parseSpokenReference(text);
      var score = ref ? ref.score : 0;
      if (score > bestScore) {
        bestScore = score;
        best = ref ? ref.text : text;
      }
    }
    return best || firstText;
  }

  /* ---------------- mic buttons ---------------- */

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
    rec.maxAlternatives = 3;

    var restorePlaceholder = input.placeholder;
    active = { rec: rec, input: input, btn: btn, restorePlaceholder: restorePlaceholder };
    paintButton(btn, true);
    input.placeholder = 'Listening… try "Isaiah chapter 40 verse 7"';

    rec.onresult = function (ev) {
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var res = ev.results[i];
        if (res.isFinal) {
          input.value = bestTranscript(res);
          var done = active;
          stopActive();
          if (done) input.placeholder = done.restorePlaceholder;
          runSearch(input);
          return;
        }
        // Interim: show the leading alternative as live feedback.
        if (res[0] && res[0].transcript) input.value = res[0].transcript;
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
