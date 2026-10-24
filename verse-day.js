/* Verse of the Day + shareable verse cards for the Gospel Harmony.
   The daily verse rotates deterministically through a curated list; its text
   is read from the page's own verse dictionaries, so it follows the reader's
   chosen translation (KJV default). Cards are drawn on a canvas (1080x1350)
   in the site's navy/gold and shared via the Web Share API or download. */
(function () {
  'use strict';

  var VERSES = [{"key": "MAT 1 23", "ref": "Matthew 1:23", "event": "9", "kjv": "Behold, a virgin shall be with child, and shall bring forth a son, and they shall call his name Emmanuel, which being interpreted is, God with us."}, {"key": "MAT 5 16", "ref": "Matthew 5:16", "event": "54", "kjv": "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven."}, {"key": "MAT 6 33", "ref": "Matthew 6:33", "event": "54", "kjv": "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you."}, {"key": "MAT 7 7", "ref": "Matthew 7:7", "event": "54", "kjv": "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:"}, {"key": "MAT 11 28", "ref": "Matthew 11:28", "event": "58", "kjv": "Come unto me, all ye that labour and are heavy laden, and I will give you rest."}, {"key": "MAT 19 26", "ref": "Matthew 19:26", "event": "124", "kjv": "But Jesus beheld them, and said unto them, With men this is impossible; but with God all things are possible."}, {"key": "MAT 28 20", "ref": "Matthew 28:20", "event": "181", "kjv": "Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen."}, {"key": "MRK 10 27", "ref": "Mark 10:27", "event": "124", "kjv": "And Jesus looking upon them saith, With men it is impossible, but not with God: for with God all things are possible."}, {"key": "MRK 11 24", "ref": "Mark 11:24", "event": "131", "kjv": "Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them."}, {"key": "LUK 2 7", "ref": "Luke 2:7", "event": "10", "kjv": "And she brought forth her firstborn son, and wrapped him in swaddling clothes, and laid him in a manger; because there was no room for them in the inn."}, {"key": "LUK 2 11", "ref": "Luke 2:11", "event": "11", "kjv": "For unto you is born this day in the city of David a Saviour, which is Christ the Lord."}, {"key": "LUK 4 18", "ref": "Luke 4:18", "event": "39", "kjv": "The Spirit of the Lord is upon me, because he hath anointed me to preach the gospel to the poor; he hath sent me to heal the brokenhearted, to preach deliverance to the captives, and recovering of sight to the blind, to set at liberty them that are bruised,"}, {"key": "LUK 11 9", "ref": "Luke 11:9", "event": "105", "kjv": "And I say unto you, Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you."}, {"key": "LUK 12 34", "ref": "Luke 12:34", "event": "108", "kjv": "For where your treasure is, there will your heart be also."}, {"key": "LUK 15 20", "ref": "Luke 15:20", "event": "116", "kjv": "And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him."}, {"key": "LUK 19 10", "ref": "Luke 19:10", "event": "127", "kjv": "For the Son of man is come to seek and to save that which was lost."}, {"key": "LUK 23 34", "ref": "Luke 23:34", "event": "164", "kjv": "Then said Jesus, Father, forgive them; for they know not what they do. And they parted his raiment, and cast lots."}, {"key": "JOH 1 1", "ref": "John 1:1", "event": "2", "kjv": "In the beginning was the Word, and the Word was with God, and the Word was God."}, {"key": "JOH 1 12", "ref": "John 1:12", "event": "2", "kjv": "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:"}, {"key": "JOH 3 16", "ref": "John 3:16", "event": "32", "kjv": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."}, {"key": "JOH 3 17", "ref": "John 3:17", "event": "32", "kjv": "For God sent not his Son into the world to condemn the world; but that the world through him might be saved."}, {"key": "JOH 4 14", "ref": "John 4:14", "event": "35", "kjv": "But whosoever drinketh of the water that I shall give him shall never thirst; but the water that I shall give him shall be in him a well of water springing up into everlasting life."}, {"key": "JOH 8 12", "ref": "John 8:12", "event": "98", "kjv": "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life."}, {"key": "JOH 10 11", "ref": "John 10:11", "event": "101", "kjv": "I am the good shepherd: the good shepherd giveth his life for the sheep."}, {"key": "JOH 11 25", "ref": "John 11:25", "event": "118", "kjv": "Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live:"}, {"key": "JOH 13 34", "ref": "John 13:34", "event": "147", "kjv": "A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another."}, {"key": "JOH 14 6", "ref": "John 14:6", "event": "149", "kjv": "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me."}, {"key": "JOH 14 27", "ref": "John 14:27", "event": "149", "kjv": "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid."}, {"key": "JOH 15 13", "ref": "John 15:13", "event": "150", "kjv": "Greater love hath no man than this, that a man lay down his life for his friends."}, {"key": "JOH 16 33", "ref": "John 16:33", "event": "150", "kjv": "These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world."}, {"key": "JOH 19 30", "ref": "John 19:30", "event": "165", "kjv": "When Jesus therefore had received the vinegar, he said, It is finished: and he bowed his head, and gave up the ghost."}, {"key": "JOH 20 29", "ref": "John 20:29", "event": "179", "kjv": "Jesus saith unto him, Thomas, because thou hast seen me, thou hast believed: blessed are they that have not seen, and yet have believed."}, {"key": "PSA 23 1", "ref": "Psalm 23:1", "event": null, "kjv": "The LORD is my shepherd; I shall not want."}, {"key": "PSA 27 1", "ref": "Psalm 27:1", "event": null, "kjv": "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?"}, {"key": "PSA 46 1", "ref": "Psalm 46:1", "event": null, "kjv": "God is our refuge and strength, a very present help in trouble."}, {"key": "PSA 91 11", "ref": "Psalm 91:11", "event": null, "kjv": "For he shall give his angels charge over thee, to keep thee in all thy ways."}, {"key": "PRO 3 5", "ref": "Proverbs 3:5", "event": null, "kjv": "Trust in the LORD with all thine heart; and lean not unto thine own understanding."}, {"key": "ISA 40 31", "ref": "Isaiah 40:31", "event": null, "kjv": "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."}, {"key": "ISA 41 10", "ref": "Isaiah 41:10", "event": null, "kjv": "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness."}, {"key": "JER 29 11", "ref": "Jeremiah 29:11", "event": null, "kjv": "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."}, {"key": "PHI 4 13", "ref": "Philippians 4:13", "event": null, "kjv": "I can do all things through Christ which strengtheneth me."}, {"key": "ROM 8 28", "ref": "Romans 8:28", "event": null, "kjv": "And we know that all things work together for good to them that love God, to them who are the called according to his purpose."}, {"key": "ROM 10 9", "ref": "Romans 10:9", "event": null, "kjv": "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved."}, {"key": "EPH 2 8", "ref": "Ephesians 2:8", "event": null, "kjv": "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:"}, {"key": "PHI 4 6", "ref": "Philippians 4:6", "event": null, "kjv": "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God."}, {"key": "COL 3 23", "ref": "Colossians 3:23", "event": null, "kjv": "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;"}, {"key": "HEB 11 1", "ref": "Hebrews 11:1", "event": null, "kjv": "Now faith is the substance of things hoped for, the evidence of things not seen."}, {"key": "JAS 1 5", "ref": "James 1:5", "event": null, "kjv": "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him."}, {"key": "1PE 5 7", "ref": "1 Peter 5:7", "event": null, "kjv": "Casting all your care upon him; for he careth for you."}, {"key": "1JN 4 19", "ref": "1 John 4:19", "event": null, "kjv": "We love him, because he first loved us."}, {"key": "REV 21 4", "ref": "Revelation 21:4", "event": null, "kjv": "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away."}];
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
    '.votd-modal-actions .votd-btn{border-color:#10243f}',
    '.votd-note{margin-top:10px;font-size:.85rem;color:#5a4632;min-height:1em}'
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

  function makeCard(verse, refLabel, contextLine, verLabel) {
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
    ctx.fillText(verLabel || versionName(), W / 2, y + 88);
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

  function resolveVotd(entry) {
    var live = verseText(entry.key);
    if (live) return { text: live, label: versionName() };
    return { text: entry.kjv, label: 'King James Version' };
  }

  function openCardModal(verse, refLabel, contextLine, verLabel) {
    var old = document.getElementById('votdModal');
    if (old) old.remove();
    var cv = makeCard(verse, refLabel, contextLine, verLabel);
    var modal = document.createElement('div');
    modal.id = 'votdModal';
    modal.className = 'votd-modal';
    modal.innerHTML = '<div class="votd-modal-box">' +
      '<img alt="Verse card">' +
      '<div class="votd-note" role="status"></div>' +
      '<div class="votd-modal-actions">' +
      '<button class="votd-btn" data-act="share">Share</button>' +
      '<button class="votd-btn ghost" data-act="download" style="color:#10243f">Download</button>' +
      '<button class="votd-btn ghost" data-act="close" style="color:#10243f">Close</button>' +
      '</div></div>';
    modal.querySelector('img').src = cv.toDataURL('image/png');
    var cardFile = null;
    if (cv.toBlob) { cv.toBlob(function (b) { if (b) { try { cardFile = new File([b], 'verse-card.png', { type: 'image/png' }); } catch (e) {} } }, 'image/png'); }
    function modalNote(msg) { var n = modal.querySelector('.votd-note'); if (n) n.textContent = msg; }
    function downloadCard() { var a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'verse-card.png'; a.click(); }
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
    modal.querySelector('[data-act="close"]').addEventListener('click', function () { modal.remove(); });
    modal.querySelector('[data-act="download"]').addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = cv.toDataURL('image/png');
      a.download = 'verse-card.png';
      a.click();
    });
    modal.querySelector('[data-act="share"]').addEventListener('click', function () {
      var text = '\u201C' + verse + '\u201D \u2014 ' + refLabel + ' \u00B7 ' + SITE_URL;
      var fellBack = false;
      function fallback() {
        if (fellBack) return; fellBack = true;
        downloadCard();
        modalNote('Sharing is not available in this browser, so the verse card was downloaded instead \u2014 you can attach it to any message or post.');
      }
      function shareFailed(err) { if (!err || err.name !== 'AbortError') fallback(); }
      try {
        if (cardFile && navigator.canShare && navigator.canShare({ files: [cardFile] })) {
          navigator.share({ files: [cardFile], text: text }).catch(shareFailed);
        } else if (navigator.share) {
          navigator.share({ text: text, url: 'https://' + SITE_URL }).catch(shareFailed);
        } else {
          fallback();
        }
      } catch (e) { fallback(); }
    });
    document.body.appendChild(modal);
  }

  function renderVotd() {
    if (document.getElementById('votdCard')) return;
    var root = document.querySelector('.reader-inner');
    if (!root) return;
    var v = todaysVerse();
    var resolved = resolveVotd(v);
    var text = resolved.text;
    if (!text) return;
    var card = document.createElement('section');
    card.id = 'votdCard';
    card.className = 'votd-card';
    var dateStr = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    var html = '<div class="votd-kicker">📖 Verse of the Day · ' + dateStr + '</div>' +
      '<div class="votd-text">“' + text + '”</div>' +
      '<div class="votd-ref">' + v.ref + ' · ' + resolved.label + '</div>' +
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
      openCardModal(text, v.ref, v.event ? 'From Event ' + v.event + ' of the Gospel Harmony' : '', resolved.label);
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
