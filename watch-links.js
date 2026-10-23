/* Watch the story — Christvision Messages film links for Gospel Harmony events.
   Only events with a true story-for-story Christvision video are listed.
   Keyed by the event number shown in the reader ("Event N of 185"). */
(function () {
  'use strict';

  var COMPLETE_FILM = {
    label: 'Watch the complete film — The Story of Jesus Christ, from Birth to Resurrection',
    url: 'https://www.youtube.com/watch?v=kJRUAGQnMqM'
  };

  var LINKS = {
    '9': [
      { label: "Why Joseph Didn't Expose Mary", url: 'https://www.youtube.com/shorts/6bwr36BUPJU' }
    ],
    '10': [
      { label: 'THE BIRTH OF JESUS CHRIST — A Christmas Story of Hope and Redemption', url: 'https://www.youtube.com/watch?v=QywHE30bAtQ' },
      { label: 'Fewer Than Half Believe the Virgin Birth?', url: 'https://www.youtube.com/shorts/wxgoEdirJDY' }
    ],
    '14': [
      { label: 'King or Rival King — The Wise Men and King Herod', url: 'https://www.youtube.com/shorts/Z0EEHXxFiKI' }
    ],
    '17': [
      { label: "What Was Jesus' Childhood Like? The Hidden Years in Nazareth", url: 'https://www.youtube.com/shorts/GfO4RXrNBUE' },
      { label: 'The Untold Truth About Mary Raising Jesus', url: 'https://www.youtube.com/shorts/ru9n0H1u5Xw' }
    ],
    '19': [
      { label: 'Where Was Jesus From Age 12 to 30? The Hidden Years Explained', url: 'https://www.youtube.com/shorts/M5th9Gj_4z0' }
    ],
    '21': [
      { label: 'Why John the Baptist Was Called the New Elijah', url: 'https://www.youtube.com/watch?v=YUikb0XchBw' },
      { label: 'Why John the Baptist Was Called the New Elijah (Short)', url: 'https://www.youtube.com/shorts/NRbPGVIYoFE' }
    ],
    '22': [
      { label: "Why Didn't John the Baptist Perform Any Miracles?", url: 'https://www.youtube.com/shorts/TWnqZT5a4yo' }
    ],
    '24': [
      { label: 'THE RIGHT BAPTISM — Jesus Baptized by John', url: 'https://www.youtube.com/shorts/di-ldYqlQWw' }
    ],
    '25': [
      { label: 'WHY JESUS WAS TEMPTED — 40 Days in the Wilderness', url: 'https://www.youtube.com/watch?v=dS54wLeAXSg' },
      { label: 'Did You Know Satan Quoted Scripture?', url: 'https://www.youtube.com/shorts/IEERJAj1xWI' }
    ],
    '29': [
      { label: "The 6 Water Pots Turned Into Wine — Jesus' First Miracle", url: 'https://www.youtube.com/shorts/SxakI0Q29Ug' }
    ],
    '53': [
      { label: 'WHY JESUS CHOSE THE TWELVE — The Night He Prayed Before Calling Them', url: 'https://www.youtube.com/watch?v=NXXtGWfIeoE' }
    ],
    '56': [
      { label: 'Before He Rose… Jesus Raised 3 People From the Dead', url: 'https://www.youtube.com/shorts/Gv-6KwSMr4M' }
    ],
    '61': [
      { label: 'The Sin God Will NEVER Forgive — Matthew 12 Explained', url: 'https://www.youtube.com/shorts/1X0tSJDmTyo' }
    ],
    '65': [
      { label: 'Did Jesus Calm the Storm?', url: 'https://www.youtube.com/shorts/CueToJ0q9z4' }
    ],
    '66': [
      { label: 'The Madman of Gadara — What Happened to the Demons?', url: 'https://www.youtube.com/shorts/pH4xPhZuwPA' }
    ],
    '67': [
      { label: 'Before He Rose… Jesus Raised 3 People From the Dead', url: 'https://www.youtube.com/shorts/Gv-6KwSMr4M' }
    ],
    '69': [
      { label: 'The One Place Where Jesus Failed to Work Miracles', url: 'https://www.youtube.com/shorts/m__KZpQuihY' }
    ],
    '71': [
      { label: 'Why Did Jesus Leave Immediately After John the Baptist Was Killed?', url: 'https://www.youtube.com/shorts/LVk3LAorKCM' },
      { label: "What Happened to the Girl Who Demanded John the Baptist's Head", url: 'https://www.youtube.com/shorts/7yYOtJSehbA' }
    ],
    '72': [
      { label: "The Hidden Hero Behind Jesus' Biggest Miracle", url: 'https://www.youtube.com/shorts/RO-HmIAQwvA' }
    ],
    '76': [
      { label: 'Did You Know Peter Almost Walked Away from Jesus?', url: 'https://www.youtube.com/shorts/dJZZrrNPin0' }
    ],
    '82': [
      { label: "Why Did Jesus Wait 6 Days After Peter's Confession?", url: 'https://www.youtube.com/shorts/tNMycJDzUmo' }
    ],
    '85': [
      { label: 'They Saw Jesus Change Before Their Eyes — The Transfiguration', url: 'https://www.youtube.com/shorts/HfBy8SWp7cY' }
    ],
    '89': [
      { label: 'Jesus Paid the Temple Tax With a Coin From a Fish\'s Mouth', url: 'https://www.youtube.com/shorts/Kny7v0j3-Lk' }
    ],
    '96': [
      { label: 'Where Did Jesus Learn Without School? John 7:15 Explained', url: 'https://www.youtube.com/shorts/MAW1yv6vjJw' }
    ],
    '97': [
      { label: 'What Did Jesus REALLY Write in the Sand?', url: 'https://www.youtube.com/shorts/QKACaMCVdJw' }
    ],
    '111': [
      { label: "Why Did Jesus Say 'You Are Gods'? John 10:34–36 Explained", url: 'https://www.youtube.com/shorts/ncnOHDcMIM4' }
    ],
    '118': [
      { label: 'Before He Rose… Jesus Raised 3 People From the Dead', url: 'https://www.youtube.com/shorts/Gv-6KwSMr4M' }
    ],
    '120': [
      { label: "The 9 Lepers Who Didn't Return — The One Who Came Back to Thank Jesus", url: 'https://www.youtube.com/shorts/mMwklzMNGVk' }
    ],
    '139': [
      { label: '5 Wise… 5 Foolish — The Parable of the 10 Virgins', url: 'https://www.youtube.com/shorts/bE0STmWmpsE' },
      { label: 'The Essential Oil Every Believer Needs Before Christ Returns', url: 'https://www.youtube.com/shorts/MNPzkn2wx-0' }
    ],
    '152': [
      { label: 'The Night Jesus Prayed 3 Times — Gethsemane', url: 'https://www.youtube.com/shorts/9bpF2wdGUao' },
      { label: 'Do You Know the Hardest Prayer Jesus Ever Prayed?', url: 'https://www.youtube.com/shorts/VJur2QksMog' }
    ],
    '156': [
      { label: "This Servant Girl Changed Peter's Life Forever", url: 'https://www.youtube.com/shorts/eiQG59GfYec' }
    ],
    '163': [
      { label: "They Forced Him to Carry Jesus' Cross — Simon of Cyrene", url: 'https://www.youtube.com/shorts/idrzQn6QpPg' }
    ],
    '164': [
      { label: 'The Suffering and Glory of Jesus Christ', url: 'https://www.youtube.com/shorts/EWbNR11iE00' }
    ],
    '165': [
      { label: 'The Mystery of the Ninth Hour', url: 'https://www.youtube.com/shorts/dOLbYwrfA7A' }
    ],
    '166': [
      { label: '5 Things That Happened When Jesus Died', url: 'https://www.youtube.com/shorts/tUY6hgfHN_c' }
    ],
    '167': [
      { label: 'What Happened to the Roman Soldier Who Pierced Jesus?', url: 'https://www.youtube.com/shorts/dbcRA8k9vek' }
    ],
    '170': [
      { label: "They Found a Marble Circle at Jesus' Tomb!", url: 'https://www.youtube.com/shorts/Os_gTYEaEn4' }
    ],
    '180': [
      { label: 'The Moment Jesus Showed Peter Mercy', url: 'https://www.youtube.com/shorts/54WjwSqRoVg' }
    ]
  };

  var CSS = [
    '.watch-banner{margin:14px 0 22px;padding:12px 14px;border:1px solid #d5aa57;border-radius:10px;background:#10243f;color:#f5ecd7;position:relative;clear:both}',
    '.watch-banner .watch-kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#d5aa57;margin-bottom:8px;font-weight:700}',
    '.watch-banner a.watch-link{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.06);margin-top:6px;font-weight:600;line-height:1.3}',
    '.watch-banner a.watch-link:hover{background:rgba(255,255,255,.14)}',
    '.watch-banner .watch-play{flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:#c0392b;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px}',
    '.watch-banner .watch-channel{font-size:12px;color:#cdbf9f;margin-top:8px}',
    '.watch-film-strip{position:fixed;top:4.5rem;left:0;right:0;z-index:49;display:block;text-align:center;padding:8px 12px;background:#10243f;color:#f5ecd7;text-decoration:none;font-weight:600;font-size:14px;border-bottom:2px solid #d5aa57}',
    '@media (max-width:900px){.watch-film-strip{top:4.25rem}}',
    '.watch-film-strip:hover{background:#1a3357}',
    '.watch-film-strip .watch-play-inline{color:#e74c3c;margin-right:6px}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('watchLinksStyle')) return;
    var s = document.createElement('style');
    s.id = 'watchLinksStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function addFilmStrip() {
    if (document.getElementById('watchFilmStrip')) return;
    var header = document.querySelector('header.topbar') || document.querySelector('header');
    if (!header || !header.parentNode) return;
    var a = document.createElement('a');
    a.id = 'watchFilmStrip';
    a.className = 'watch-film-strip';
    a.href = COMPLETE_FILM.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = '<span class="watch-play-inline">▶</span>' + COMPLETE_FILM.label + ' · Christvision Messages';
    header.parentNode.insertBefore(a, header.nextSibling);
  }

  function currentEventNumber() {
    var el = document.getElementById('eventNumber');
    if (!el) return null;
    var m = /Event\s+(\S+)\s+of/i.exec(el.textContent || '');
    return m ? m[1] : null;
  }

  function renderBanner() {
    var num = currentEventNumber();
    var old = document.getElementById('watchBanner');
    var links = num ? LINKS[num] : null;
    if (!links || !links.length) {
      if (old) old.remove();
      return;
    }
    /* The reader's .word-help and .swipe-hint use negative top margins that tuck
       them under the event summary — inserting the banner before them lets that
       pull drag them over the banner. Anchor AFTER the hint instead. */
    var anchor = document.querySelector('.swipe-hint') ||
      document.querySelector('.word-help') ||
      document.getElementById('eventSummary');
    if (!anchor || !anchor.parentNode) return;
    var banner = old || document.createElement('div');
    banner.id = 'watchBanner';
    banner.className = 'watch-banner';
    var html = '<div class="watch-kicker">▶ Watch the story</div>';
    links.forEach(function (l) {
      html += '<a class="watch-link" href="' + l.url + '" target="_blank" rel="noopener">' +
        '<span class="watch-play">▶</span><span>' + l.label + '</span></a>';
    });
    html += '<div class="watch-channel">A Christvision Messages film on YouTube</div>';
    banner.innerHTML = html;
    anchor.parentNode.insertBefore(banner, anchor.nextSibling);
  }

  function init() {
    addStyle();
    addFilmStrip();
    renderBanner();
    var target = document.getElementById('eventNumber');
    if (target && window.MutationObserver) {
      var obs = new MutationObserver(function () { renderBanner(); });
      obs.observe(target, { childList: true, characterData: true, subtree: true });
    }
    window.addEventListener('hashchange', function () { setTimeout(renderBanner, 60); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
