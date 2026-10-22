/* Verse of the Day + shareable verse cards for the Gospel Harmony.
   The daily verse rotates deterministically through a curated list; its text
   is read from the page's own verse dictionaries, so it follows the reader's
   chosen translation (KJV default). Cards are drawn on a canvas (1080x1350)
   in the site's navy/gold and shared via the Web Share API or download. */
(function () {
  'use strict';

  var VERSES = [{"key": "MAT 1 23", "ref": "Matthew 1:23", "event": "9"}, {"key": "MAT 5 16", "ref": "Matthew 5:16", "event": "54"}, {"key": "MAT 6 33", "ref": "Matthew 6:33", "event": "54"}, {"key": "MAT 7 7", "ref": "Matthew 7:7", "event": "54"}, {"key": "MAT 11 28", "ref": "Matthew 11:28", "event": "58"}, {"key": "MAT 19 26", "ref": "Matthew 19:26", "event": "124"}, {"key": "MAT 28 20", "ref": "Matthew 28:20", "event": "181"}, {"key": "MRK 10 27", "ref": "Mark 10:27", "event": "124"}, {"key": "MRK 11 24", "ref": "Mark 11:24", "event": "131"}, {"key": "LUK 2 7", "ref": "Luke 2:7", "event": "10"}, {"key": "LUK 2 11", "ref": "Luke 2:11", "event": "11"}, {"key": "LUK 4 18", "ref": "Luke 4:18", "event": "39"}, {"key": "LUK 11 9", "ref": "Luke 11:9", "event": "105"}, {"key": "LUK 12 34", "ref": "Luke 12:34", "event": "108"}, {"key": "LUK 15 20", "ref": "Luke 15:20", "event": "116"}, {"key": "LUK 19 10", "ref": "Luke 19:10", "event": "127"}, {"key": "LUK 23 34", "ref": "Luke 23:34", "event": "164"}, {"key": "JOH 1 1", "ref": "John 1:1", "event": "2"}, {"key": "JOH 1 12", "ref": "John 1:12", "event": "2"}, {"key": "JOH 3 16", "ref": "John 3:16", "event": "32"}, {"key": "JOH 3 17", "ref": "John 3:17", "event": "32"}, {"key": "JOH 4 14", "ref": "John 4:14", "event": "35"}, {"key": "JOH 8 12", "ref": "John 8:12", "event": "98"}, {"key": "JOH 10 11", "ref": "John 10:11", "event": "101"}, {"key": "JOH 11 25", "ref": "John 11:25", "event": "118"}, {"key": "JOH 13 34", "ref": "John 13:34", "event": "147"}, {"key": "JOH 14 6", "ref": "John 14:6", "event": "149"}, {"key": "JOH 14 27", "ref": "John 14:27", "event": "149"}, {"key": "JOH 15 13", "ref": "John 15:13", "event": "150"}, {"key": "JOH 16 33", "ref": "John 16:33", "event": "150"}, {"key": "JOH 19 30", "ref": "John 19:30", "event": "165"}, {"key": "JOH 20 29", "ref": "John 20:29", "event": "179"}, {"key": "PSA 23 1", "ref": "Psalm 23:1", "event": null}, {"key": "PSA 27 1", "ref": "Psalm 27:1", "event": null}, {"key": "PSA 46 1", "ref": "Psalm 46:1", "event": null}, {"key": "PSA 91 11", "ref": "Psalm 91:11", "event": null}, {"key": "PRO 3 5", "ref": "Proverbs 3:5", "event": null}, {"key": "ISA 40 31", "ref": "Isaiah 40:31", "event": null}, {"key": "ISA 41 10", "ref": "Isaiah 41:10", "event": null}, {"key": "JER 29 11", "ref": "Jeremiah 29:11", "event": null}, {"key": "PHI 4 13", "ref": "Philippians 4:13", "event": null}, {"key": "ROM 8 28", "ref": "Romans 8:28", "event": null}, {"key": "ROM 10 9", "ref": "Romans 10:9", "event": null}, {"key": "EPH 2 8", "ref": "Ephesians 2:8", "event": null}, {"key": "PHI 4 6", "ref": "Philippians 4:6", "event": null}, {"key": "COL 3 23", "ref": "Colossians 3:23", "event": null}, {"key": "HEB 11 1", "ref": "Hebrews 11:1", "event": null}, {"key": "JAS 1 5", "ref": "James 1:5", "event": null}, {"key": "1PE 5 7", "ref": "1 Peter 5:7", "event": null}, {"key": "1JN 4 19", "ref": "1 John 4:19", "event": null}, {"key": "REV 21 4", "ref": "Revelation 21:4", "event": null}];
  var SITE_URL = 'comparative-gospel-harmony.onrender.com';
  var BOOK_CODE = { Matthew: 'MAT', Mark: 'MAR', Luke: 'LUK', John: 'JOH' };
  var BOOK_NAME = { MAT: 'Matthew', MAR: 'Mark', LUK: 'Luke', JOH: 'John' };

  var CSS = [
    '.votd-card{margin:14px 0 18px;padding:16px 18px;border:1px solid #d5aa57;border-radius:12px;background:linear-gradient(135deg,#10243f,#1b3a5f);color:#f5ecd7;position:relative;clear:both}',
    '.votd-kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#d5aa57;font-weight:700;margin-bottom:8px}',
    '.votd-text{font:italic 1.12rem/1.55 Georgia,serif;color:#fff}',
    '.votd-ref{margin-top:8px;font-size:.9rem;color:#d5aa57;font-weight:700}',
    '.votd-actions{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}',
    '.votd-btn{display:inline-block;padding:8px 14px;border-radius:8px;border:1px solid #d5aa57;background:#d5aa57;color:#10243f;font-weight:700;font-size:.88rem;cursor:pointer;text-decoration:none}',
    '.votd-btn.ghost{background:transparent;color:#f5ecd7}',
    '.verse-card-bar{margin:0 0 14px;clear:both}',
    '.verse-card-bar .votd-btn{border-color:#b9c8d7;background:#fff;color:#10243f}',
    '.votd-modal{position:fixed;inset:0;background:rgba(6,14,26,.82);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px}',
    '.votd-modal-box{background:#fff;border-radius:12px;padding:14px;max-width:420px;width:100%;text-align:center}',
    '.votd-modal-box img{max-width:100%;max-height:62vh;border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.35)}',
    '.votd-modal-actions{margin-top:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}',
    '.votd-modal-actions .votd-btn{border-color:#10243f}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('verseDayStyle')) return;
    var s = document.createElement('style');
    s.id = 'verseDayStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function verseText(key) {
    var g = window.GOSPEL_VERSE_TEXT || {};
    var o = window.OT_VERSE_TEXT || {};
    var n = window.NT_VERSE_TEXT || {};
    return g[key] || o[key] || n[key] || null;
  }

  function versionName() {
    return (window.BibleTranslation && window.BibleTranslation.name) || 'King James Version';
  }

  function todaysVerse() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var doy = Math.floor((now - start) / 86400000);
    return VERSES[doy % VERSES.length];
  }

  function wrapText(ctx, text, maxWidth) {
    var words = text.split(/\s+/), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function makeCard(verse, refLabel, contextLine) {
    var W = 1080, H = 1350;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0d1f38'); grad.addColorStop(1, '#1d4066');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#d5aa57'; ctx.lineWidth = 3;
    ctx.strokeRect(42, 42, W - 84, H - 84);
    ctx.lineWidth = 1; ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.fillStyle = '#d5aa57';
    ctx.font = '54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', W / 2, 200);
    // Auto-fit verse text.
    var size = 46, lines = [];
    while (size >= 26) {
      ctx.font = 'italic ' + size + 'px Georgia, serif';
      lines = wrapText(ctx, '“' + verse + '”', 860);
      if (lines.length * size * 1.5 <= 620) break;
      size -= 2;
    }
    ctx.fillStyle = '#ffffff';
    var y = 300;
    var lh = size * 1.5;
    for (var i = 0; i < lines.length; i++) { ctx.fillText(lines[i], W / 2, y); y += lh; }
    ctx.fillStyle = '#d5aa57';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText(refLabel, W / 2, y + 44);
    ctx.font = '24px Georgia, serif';
    ctx.fillStyle = '#bcd0e8';
    ctx.fillText(versionName(), W / 2, y + 88);
    if (contextLine) {
      ctx.font = 'italic 25px Georgia, serif';
      ctx.fillStyle = '#e8dcbb';
      ctx.fillText(contextLine, W / 2, H - 268);
    }
    ctx.fillStyle = '#d5aa57';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText('COMPARATIVE GOSPEL HARMONY', W / 2, H - 178);
    ctx.font = '24px Georgia, serif';
    ctx.fillStyle = '#bcd0e8';
    ctx.fillText(SITE_URL, W / 2, H - 136);
    ctx.fillText('A Christvision Messages presentation', W / 2, H - 100);
    return cv;
  }

  function openCardModal(verse, refLabel, contextLine) {
    var old = document.getElementById('votdModal');
    if (old) old.remove();
    var cv = makeCard(verse, refLabel, contextLine);
    var modal = document.createElement('div');
    modal.id = 'votdModal';
    modal.className = 'votd-modal';
    modal.innerHTML = '<div class="votd-modal-box">' +
      '<img alt="Verse card">' +
      '<div class="votd-modal-actions">' +
      '<button class="votd-btn" data-act="share">Share</button>' +
      '<button class="votd-btn ghost" data-act="download" style="color:#10243f">Download</button>' +
      '<button class="votd-btn ghost" data-act="close" style="color:#10243f">Close</button>' +
      '</div></div>';
    modal.querySelector('img').src = cv.toDataURL('image/png');
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
    modal.querySelector('[data-act="close"]').addEventListener('click', function () { modal.remove(); });
    modal.querySelector('[data-act="download"]').addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = cv.toDataURL('image/png');
      a.download = 'verse-card.png';
      a.click();
    });
    modal.querySelector('[data-act="share"]').addEventListener('click', function () {
      var text = '“' + verse + '” — ' + refLabel + ' · ' + SITE_URL;
      if (cv.toBlob && navigator.canShare) {
        cv.toBlob(function (blob) {
          var file = new File([blob], 'verse-card.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], text: text }).catch(function () {});
            return;
          }
          if (navigator.share) navigator.share({ text: text }).catch(function () {});
        }, 'image/png');
      } else if (navigator.share) {
        navigator.share({ text: text }).catch(function () {});
      }
    });
    document.body.appendChild(modal);
  }

  function renderVotd() {
    if (document.getElementById('votdCard')) return;
    var root = document.querySelector('.reader-inner');
    if (!root) return;
    var v = todaysVerse();
    var text = verseText(v.key);
    if (!text) return;
    var card = document.createElement('section');
    card.id = 'votdCard';
    card.className = 'votd-card';
    var dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    var html = '<div class="votd-kicker">📖 Verse of the Day · ' + dateStr + '</div>' +
      '<div class="votd-text">“' + text + '”</div>' +
      '<div class="votd-ref">' + v.ref + ' · ' + versionName() + '</div>' +
      '<div class="votd-actions">' +
      '<button class="votd-btn" id="votdShare">🖼 Share verse card</button>';
    if (v.event) {
      html += '<a class="votd-btn ghost" href="#event-' + v.event + '">▶ Read the story — Event ' + v.event + '</a>' +
        '<a class="votd-btn ghost" href="#event-' + v.event + '">🔊 Listen — Event ' + v.event + '</a>';
    }
    html += '</div>';
    card.innerHTML = html;
    root.insertBefore(card, root.firstChild);
    card.querySelector('#votdShare').addEventListener('click', function () {
      openCardModal(text, v.ref, v.event ? 'From Event ' + v.event + ' of the Gospel Harmony' : '');
    });
  }

  function currentEventNumber() {
    var el = document.getElementById('eventNumber');
    if (!el) return null;
    var m = /Event\s+(\S+)\s+of/i.exec(el.textContent || '');
    return m ? m[1] : null;
  }

  function eventKeyVerse(num) {
    var data = window.GOSPEL_DATA;
    if (!data || !data.events) return null;
    for (var i = 0; i < data.events.length; i++) {
      var e = data.events[i];
      if (String(e.number) !== String(num)) continue;
      var order = ['Matthew', 'Mark', 'Luke', 'John'];
      for (var j = 0; j < order.length; j++) {
        var a = e.accounts && e.accounts[order[j]];
        if (!a || !a.recorded) continue;
        var m = /(\d+)\s*:\s*(\d+)/.exec(a.reference || '');
        if (!m) continue;
        var key = BOOK_CODE[order[j]] + ' ' + m[1] + ' ' + m[2];
        var text = verseText(key);
        if (text) return { text: text, ref: BOOK_NAME[BOOK_CODE[order[j]]] + ' ' + m[1] + ':' + m[2], title: e.title };
      }
      return null;
    }
    return null;
  }

  function renderEventCardBar() {
    var num = currentEventNumber();
    var old = document.getElementById('verseCardBar');
    var kv = num ? eventKeyVerse(num) : null;
    if (!kv) { if (old) old.remove(); return; }
    var anchor = document.getElementById('eventVisuals');
    if (!anchor || !anchor.parentNode) return;
    var bar = old || document.createElement('div');
    bar.id = 'verseCardBar';
    bar.className = 'verse-card-bar';
    bar.innerHTML = '';
    var btn = document.createElement('button');
    btn.className = 'votd-btn';
    btn.textContent = '🖼 Share a verse card — ' + kv.ref;
    btn.addEventListener('click', function () {
      openCardModal(kv.text, kv.ref, 'Event ' + num + ' · ' + kv.title);
    });
    bar.appendChild(btn);
    var listen = document.getElementById('listenBar');
    if (listen && listen.parentNode === anchor.parentNode) {
      listen.parentNode.insertBefore(bar, listen.nextSibling);
    } else {
      anchor.parentNode.insertBefore(bar, anchor);
    }
  }

  function init() {
    addStyle();
    renderVotd();
    renderEventCardBar();
    var target = document.getElementById('eventNumber');
    if (target && window.MutationObserver) {
      var obs = new MutationObserver(function () { renderEventCardBar(); });
      obs.observe(target, { childList: true, characterData: true, subtree: true });
    }
    window.addEventListener('hashchange', function () { setTimeout(renderEventCardBar, 60); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
