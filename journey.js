/* The Life of Christ in 30 Days — a guided journey through the harmony,
   with a gentle day streak. All progress lives in the reader's own browser
   (localStorage) — no account, no server. Missing a day never erases
   progress; the journey simply waits. */
(function () {
  'use strict';

  var DAYS = [{"day": 1, "event": "5", "title": "The Angel’s Announcement", "harmonyTitle": "The Annunciation to the Virgin Mary of the Birth of Jesus", "refs": ["Luke 1:26-38"], "reflection": "Mary said yes before she understood. What is God asking of you today?"}, {"day": 2, "event": "10", "title": "The Birth of Jesus", "harmonyTitle": "The Birth of Jesus", "refs": ["Luke 2:1-7"], "reflection": "He came quietly, in a borrowed space. God still arrives without fanfare.", "film": {"label": "THE BIRTH OF JESUS CHRIST — A Christmas Story of Hope and Redemption", "url": "https://www.youtube.com/watch?v=QywHE30bAtQ"}}, {"day": 3, "event": "14", "title": "The Wise Men Worship", "harmonyTitle": "Magi Visit the New-born King of the Jews", "refs": ["Matthew 2:1-12"], "reflection": "They travelled far on a sign. What are you seeking Him for?"}, {"day": 4, "event": "18", "title": "The Boy in the Temple", "harmonyTitle": "The Visit of the Boy Jesus to Jerusalem When Twelve Years Old", "refs": ["Luke 2:41-50"], "reflection": "Even Jesus grew in wisdom. Who are you sitting with to learn?"}, {"day": 5, "event": "24", "title": "Baptized in the Jordan", "harmonyTitle": "Jesus Baptized by John in the Jordan", "refs": ["Matthew 3:13-17", "Mark 1:9-11", "Luke 3:21-23"], "reflection": "Before any miracle, heaven called Him beloved. That order matters."}, {"day": 6, "event": "25", "title": "Tempted in the Wilderness", "harmonyTitle": "The Three Temptations of Jesus", "refs": ["Matthew 4:1-11", "Mark 1:12-13", "Luke 4:1-13"], "reflection": "Every temptation was answered with Scripture. What verse is yours?", "film": {"label": "WHY JESUS WAS TEMPTED — 40 Days in the Wilderness", "url": "https://www.youtube.com/watch?v=dS54wLeAXSg"}}, {"day": 7, "event": "29", "title": "Water into Wine", "harmonyTitle": "Jesus Works His First Miracle", "refs": ["John 2:1-11"], "reflection": "His first miracle met an ordinary embarrassment. Bring Him yours.", "film": {"label": "The 6 Water Pots Turned Into Wine — Jesus' First Miracle", "url": "https://www.youtube.com/shorts/SxakI0Q29Ug"}}, {"day": 8, "event": "32", "title": "Nicodemus Comes at Night", "harmonyTitle": "The Interview of Nicodemus with Jesus", "refs": ["John 2:23-25; 3:1-21"], "reflection": "He came with questions in the dark and left with a promise."}, {"day": 9, "event": "35", "title": "The Woman at the Well", "harmonyTitle": "Jesus in Samaria.", "refs": ["John 4:5-42"], "reflection": "He crossed a boundary to offer living water to one forgotten person."}, {"day": 10, "event": "41", "title": "Fishers of Men", "harmonyTitle": "Jesus Finds Four Fishers of Men in Four Fishermen", "refs": ["Matthew 4:18-22", "Mark 1:16-20", "Luke 5:1-11"], "reflection": "They left their nets at once. What net is He asking you to set down?"}, {"day": 11, "event": "54", "title": "The Sermon on the Mount", "harmonyTitle": "The Sermon on the Mount. Privileges and Requirements of the Messianic Reign. Christ's Standard of Righteousness", "refs": ["Matthew 5:1-48; 6:1-34; 7:1-29; 8:1", "Luke 6:17-49"], "reflection": "Pick one beatitude today, and live inside it."}, {"day": 12, "event": "65", "title": "Peace in the Storm", "harmonyTitle": "In Crossing the Lake, Jesus Stills the Tempest", "refs": ["Matthew 8:18; 8:23-27", "Mark 4:35-41", "Luke 8:22-25"], "reflection": "He slept in the storm, then stilled it. Both are invitations to trust."}, {"day": 13, "event": "72", "title": "Five Thousand Fed", "harmonyTitle": "The First Retirement. the Twelve Return, and Jesus Retires with Them Beyond the Lake to Rest. Feeding of the Five Thousand", "refs": ["Matthew 14:13-21", "Mark 6:30-44", "Luke 9:10-17", "John 6:1-13"], "reflection": "A small lunch in His hands fed a multitude. What small thing will you hand over?", "film": {"label": "The Hidden Hero Behind Jesus' Biggest Miracle", "url": "https://www.youtube.com/shorts/RO-HmIAQwvA"}}, {"day": 14, "event": "85", "title": "The Transfiguration", "harmonyTitle": "The Transfiguration of Jesus on a Mountain (probably Hermon) Near Cæsarea Philippi", "refs": ["Matthew 17:1-8", "Mark 9:2-8", "Luke 9:28-36"], "reflection": "For one moment they saw His glory plainly. “Listen to Him,” the Father said.", "film": {"label": "They Saw Jesus Change Before Their Eyes — The Transfiguration", "url": "https://www.youtube.com/shorts/HfBy8SWp7cY"}}, {"day": 15, "event": "103", "title": "The Good Samaritan", "harmonyTitle": "Jesus Answers a Lawyer's Question as to Eternal Life, Giving the Parable of the Good Samaritan", "refs": ["Luke 10:25-37"], "reflection": "Mercy crossed the road. Who is your neighbour today?"}, {"day": 16, "event": "116", "title": "The Prodigal Comes Home", "harmonyTitle": "The Pharisees and the Scribes Murmur Against Jesus for Receiving Sinners. He Defends Himself by Three Great Parables (the Lost Sheep, the Lost Coin, the Lost Son)", "refs": ["Luke 15:1-32"], "reflection": "The father ran. Heaven still celebrates one who turns home."}, {"day": 17, "event": "118", "title": "Lazarus, Come Forth", "harmonyTitle": "Jesus Raises Lazarus from the Dead", "refs": ["John 11:1-44"], "reflection": "Jesus wept — then called a dead man out. He still does both.", "film": {"label": "Before He Rose… Jesus Raised 3 People From the Dead", "url": "https://www.youtube.com/shorts/Gv-6KwSMr4M"}}, {"day": 18, "event": "127", "title": "Zacchaeus in the Tree", "harmonyTitle": "Jesus Visits Zacchæus, and Speaks the Parable of the Pounds, and Sets Out for Jerusalem", "refs": ["Luke 19:1-28"], "reflection": "Salvation came to his house because he climbed to see. Get a better view today."}, {"day": 19, "event": "128B", "title": "The Triumphal Entry", "harmonyTitle": "His Triumphal Entry into Jerusalem as the Messiah", "refs": ["Matthew 21:1-11; 21:14-17", "Mark 11:1-11", "Luke 19:29-44", "John 12:12-19"], "reflection": "Hosanna was shouted by people who misunderstood Him — and He received it anyway."}, {"day": 20, "event": "141", "title": "Mary’s Costly Worship", "harmonyTitle": "At the Feast in the House of Simon the Leper Mary of Bethany Anoints Jesus for His Burial", "refs": ["Matthew 26:6-13", "Mark 14:3-9", "John 12:2-8"], "reflection": "She poured out her best. What is your alabaster box?"}, {"day": 21, "event": "148", "title": "The Last Supper", "harmonyTitle": "Jesus Institutes the Memorial of Eating Bread and Drinking Wine", "refs": ["Matthew 26:26-29", "Mark 14:22-25", "Luke 22:17-20"], "reflection": "Bread broken, cup shared: remember Him at the table."}, {"day": 22, "event": "149", "title": "Words in the Upper Room", "harmonyTitle": "The Farewell Discourse to His Disciples in the Upper Room", "refs": ["John 14:1-31"], "reflection": "On His last night He promised peace, and a Helper. Receive both."}, {"day": 23, "event": "152", "title": "Agony in Gethsemane", "harmonyTitle": "Going Forth to Gethsemane, Jesus Suffers Long in Agony", "refs": ["Matthew 26:30; 26:36-46", "Mark 14:26; 14:32-42", "Luke 22:39-46", "John 18:1"], "reflection": "He prayed honestly and surrendered fully. You can do both too.", "film": {"label": "The Night Jesus Prayed 3 Times — Gethsemane", "url": "https://www.youtube.com/shorts/9bpF2wdGUao"}}, {"day": 24, "event": "153", "title": "Betrayed and Arrested", "harmonyTitle": "Jesus Is Betrayed, Arrested and Forsaken", "refs": ["Matthew 26:47-56", "Mark 14:43-52", "Luke 22:47-53", "John 18:2-12"], "reflection": "He was forsaken by friends — never by the Father."}, {"day": 25, "event": "156", "title": "Peter Weeps", "harmonyTitle": "Peter Thrice Denies His Lord", "refs": ["Matthew 26:58; 26:69-75", "Mark 14:54; 14:66-72", "Luke 22:54-62", "John 18:15-18; 18:25-27"], "reflection": "Failure was not Peter’s end. It need not be yours.", "film": {"label": "This Servant Girl Changed Peter's Life Forever", "url": "https://www.youtube.com/shorts/eiQG59GfYec"}}, {"day": 26, "event": "161", "title": "Before Pilate", "harmonyTitle": "Jesus the Second Time Before Pilate", "refs": ["Matthew 27:15-26", "Mark 15:6-15", "Luke 23:13-25", "John 18:39-40; 19:1-16"], "reflection": "The innocent stood silent before power. Truth does not need to shout."}, {"day": 27, "event": "164", "title": "On the Cross", "harmonyTitle": "The First Three Hours on the Cross", "refs": ["Matthew 27:35-44", "Mark 15:24-32", "Luke 23:33-43", "John 19:18-27"], "reflection": "From the cross He forgave, He provided, He finished. Sit here a while."}, {"day": 28, "event": "167", "title": "Laid in the Tomb", "harmonyTitle": "The Burial of the Body of Jesus in the Tomb of Joseph of Arimathea After Proof of His Death", "refs": ["Matthew 27:57-60", "Mark 15:42-46", "Luke 23:50-54", "John 19:31-42"], "reflection": "A friend gave his tomb. Even the waiting had a witness."}, {"day": 29, "event": "176", "title": "The Road to Emmaus", "harmonyTitle": "The Appearance to Two Disciples (cleopas and Another) on the Way to Emmaus", "refs": ["Mark 16:12-13", "Luke 24:13-32"], "reflection": "He walked unrecognized beside sorrow — until the bread was broken."}, {"day": 30, "event": "184", "title": "The Ascension", "harmonyTitle": "The Last Appearance and the Ascension", "refs": ["Mark 16:19-20", "Luke 24:50-53"], "reflection": "He ascended blessing them, and promised to return. The story is not over."}];
  var KEY = 'gh-journey-v1';
  var SITE = 'comparative-gospel-harmony.onrender.com';

  var CSS = [
    '.journey-pill{margin:0 0 18px;padding:14px 16px;border:1px solid #b9c8d7;border-radius:12px;background:#fff;position:relative;clear:both}',
    '.journey-pill .jp-kicker{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:#7a5c14;font-weight:700;margin-bottom:6px}',
    '.journey-pill .jp-title{font:700 1.06rem/1.35 Georgia,serif;color:#10243f}',
    '.journey-pill .jp-sub{font-size:.9rem;color:#4e5a6e;margin-top:4px}',
    '.journey-pill .jp-actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}',
    '.jp-btn{display:inline-block;padding:8px 14px;border-radius:8px;border:1px solid #10243f;background:#10243f;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;text-decoration:none}',
    '.jp-btn.gold{background:#d5aa57;border-color:#d5aa57;color:#10243f}',
    '.jp-btn.ghost{background:transparent;color:#10243f}',
    '.jp-btn[disabled]{opacity:.55;cursor:default}',
    '.journey-daybar{margin:0 0 14px;padding:12px 14px;border:1px dashed #7a5c14;border-radius:10px;background:#fdf6dd;clear:both;font-size:.94rem;color:#4e3f10}',
    '.journey-daybar .jp-btn{margin-left:10px}',
    '.journey-wrap{max-width:56rem;margin:0 auto;padding:104px 16px 48px}',
    '.journey-stats{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 20px}',
    '.journey-stat{flex:1 1 9rem;border:1px solid #b9c8d7;border-radius:10px;background:#fff;padding:12px 14px;text-align:center}',
    '.journey-stat .n{font:700 1.5rem Georgia,serif;color:#10243f}',
    '.journey-stat .l{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:#4e5a6e}',
    '.journey-day{display:flex;gap:14px;border:1px solid #d7e0ea;border-radius:12px;background:#fff;padding:14px 16px;margin:0 0 12px}',
    '.journey-day.today{border-color:#d5aa57;box-shadow:0 0 0 2px rgba(213,170,87,.35)}',
    '.journey-day.done{opacity:.82}',
    '.journey-num{flex:0 0 3rem;text-align:center}',
    '.journey-num .d{font:700 1.3rem Georgia,serif;color:#10243f}',
    '.journey-num .w{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:#7a5c14}',
    '.journey-body{flex:1 1 auto;min-width:0}',
    '.journey-body h3{margin:0 0 2px;font:700 1.05rem/1.3 Georgia,serif;color:#10243f}',
    '.journey-refs{font-size:.84rem;color:#4e5a6e}',
    '.journey-refl{font:italic .95rem/1.5 Georgia,serif;color:#33475e;margin-top:6px}',
    '.journey-links{margin-top:9px;display:flex;gap:8px;flex-wrap:wrap}',
    '.journey-links a,.journey-links button{font-size:.84rem;font-weight:700;color:#10243f;text-decoration:none;border:1px solid #b9c8d7;background:#f4f7fb;border-radius:7px;padding:6px 10px;cursor:pointer}',
    '.journey-check{flex:0 0 auto;align-self:flex-start}',
    '.journey-check button{width:2.4rem;height:2.4rem;border-radius:50%;border:2px solid #b9c8d7;background:#fff;font-size:1.1rem;cursor:pointer;color:#fff}',
    '.journey-day.done .journey-check button{background:#2e7d46;border-color:#2e7d46}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('journeyStyle')) return;
    var s = document.createElement('style');
    s.id = 'journeyStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function todayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { start: null, done: {}, days: {} };
  }

  function save(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
    cloudPush(st);
  }

  /* ---------- account sync (via gh-sync.js; silent when signed out) ---------- */
  var pushTimer = null;
  function cloudPush(st) {
    if (!window.GHSync || !GHSync.signedIn()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      try { GHSync.save('journey:progress', 'journey', { start: st.start, done: st.done, days: st.days }).catch(function () {}); } catch (e) {}
    }, 600);
  }

  function cloudPull() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    GHSync.load('journey:progress').then(function (rec) {
      if (!rec || !rec.value) { cloudPush(load()); return; }
      var c = rec.value, st = load(), changed = false;
      Object.keys(c.done || {}).forEach(function (k) { if (!st.done[k]) { st.done[k] = true; changed = true; } });
      Object.keys(c.days || {}).forEach(function (k) { if (!st.days[k]) { st.days[k] = true; changed = true; } });
      if (c.start && (!st.start || c.start < st.start)) { st.start = c.start; changed = true; }
      if (changed) {
        try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
        if (document.getElementById('journeyList')) renderJourneyPage();
        else {
          var pill = document.getElementById('journeyPill');
          if (pill) { pill.remove(); renderPill(); }
          renderDayBar();
        }
      }
      cloudPush(st);
    }).catch(function () {});
  }

  function streakOf(st) {
    var count = 0;
    var d = new Date();
    if (!st.days[todayStr(d)]) d.setDate(d.getDate() - 1);
    while (st.days[todayStr(d)]) { count++; d.setDate(d.getDate() - 1); }
    return count;
  }

  function doneCount(st) {
    return Object.keys(st.done).length;
  }

  function currentDay(st) {
    if (!st.start) return 1;
    var start = new Date(st.start + 'T12:00:00');
    var now = new Date();
    var diff = Math.floor((now - start) / 86400000) + 1;
    return Math.min(30, Math.max(1, diff));
  }

  function dayByEvent(num) {
    for (var i = 0; i < DAYS.length; i++) if (String(DAYS[i].event) === String(num)) return DAYS[i];
    return null;
  }

  function toggleDay(dayNum) {
    var st = load();
    if (st.done[dayNum]) {
      delete st.done[dayNum];
    } else {
      st.done[dayNum] = true;
      st.days[todayStr()] = true;
      if (!st.start) st.start = todayStr();
    }
    save(st);
    return st;
  }

  /* ---------- journey.html: full list ---------- */
  function renderJourneyPage() {
    var list = document.getElementById('journeyList');
    if (!list) return;
    var st = load();
    var cur = currentDay(st);
    var streak = streakOf(st);
    var stats = document.getElementById('journeyStats');
    if (stats) {
      stats.innerHTML =
        '<div class="journey-stat"><div class="n">🔥 ' + streak + '</div><div class="l">Day streak</div></div>' +
        '<div class="journey-stat"><div class="n">' + doneCount(st) + ' / 30</div><div class="l">Days completed</div></div>' +
        '<div class="journey-stat"><div class="n">Day ' + cur + '</div><div class="l">' + (st.start ? 'Today\u2019s reading' : 'Not started yet') + '</div></div>';
    }
    var startBtn = document.getElementById('journeyStart');
    if (startBtn) {
      startBtn.textContent = st.start ? '↺ Restart the journey' : '▶ Start the journey today';
      startBtn.onclick = function () {
        var s2 = load();
        s2.start = todayStr();
        save(s2);
        renderJourneyPage();
      };
    }
    list.innerHTML = '';
    DAYS.forEach(function (d) {
      var done = !!st.done[d.day];
      var row = document.createElement('article');
      row.className = 'journey-day' + (done ? ' done' : '') + (st.start && d.day === cur && !done ? ' today' : '');
      var links = '<a href="index.html#event-' + d.event + '">📖 Read — Event ' + d.event + '</a>' +
        '<a href="audio/event-' + d.event + '.mp3">🔊 Listen</a>';
      if (d.film) links += '<a href="' + d.film.url + '" target="_blank" rel="noopener">▶ Watch the story</a>';
      row.innerHTML =
        '<div class="journey-num"><div class="d">' + d.day + '</div><div class="w">Day</div></div>' +
        '<div class="journey-body"><h3>' + d.title + '</h3>' +
        '<div class="journey-refs">' + d.refs.join(' · ') + '</div>' +
        '<p class="journey-refl">' + d.reflection + '</p>' +
        '<div class="journey-links">' + links + '</div></div>' +
        '<div class="journey-check"><button type="button" aria-label="Mark day ' + d.day + ' complete" title="Mark complete">✓</button></div>';
      row.querySelector('.journey-check button').addEventListener('click', function () {
        toggleDay(d.day);
        renderJourneyPage();
      });
      list.appendChild(row);
    });
  }

  /* ---------- index.html: pill + per-event day bar ---------- */
  function renderPill() {
    if (!document.querySelector('.reader-inner')) return;
    if (document.getElementById('journeyPill')) return;
    var st = load();
    var cur = currentDay(st);
    var d = DAYS[cur - 1];
    var pill = document.createElement('section');
    pill.id = 'journeyPill';
    pill.className = 'journey-pill';
    pill.innerHTML =
      '<div class="jp-kicker">🕊 The Life of Christ in 30 Days</div>' +
      '<div class="jp-title">' + (st.start ? 'Day ' + cur + ': ' + d.title : 'Walk through His life, one event a day') + '</div>' +
      '<div class="jp-sub">🔥 ' + streakOf(st) + '-day streak · ' + doneCount(st) + ' of 30 days completed' +
      (st.start ? '' : ' · Begin whenever you are ready — the journey waits for you.') + '</div>' +
      '<div class="jp-actions"><a class="jp-btn gold" href="journey.html">' + (st.start ? 'Continue the journey' : 'See the journey') + '</a>' +
      (st.start ? '<a class="jp-btn ghost" href="#event-' + d.event + '">Today — Event ' + d.event + '</a>' : '') + '</div>';
    var votd = document.getElementById('votdCard');
    var root = document.querySelector('.reader-inner');
    if (votd && votd.parentNode === root) root.insertBefore(pill, votd.nextSibling);
    else root.insertBefore(pill, root.firstChild);
  }

  function currentEventNumber() {
    var el = document.getElementById('eventNumber');
    if (!el) return null;
    var m = /Event\s+(\S+)\s+of/i.exec(el.textContent || '');
    return m ? m[1] : null;
  }

  function renderDayBar() {
    var num = currentEventNumber();
    var old = document.getElementById('journeyDayBar');
    var d = num ? dayByEvent(num) : null;
    if (!d) { if (old) old.remove(); return; }
    var anchor = document.getElementById('eventVisuals');
    if (!anchor || !anchor.parentNode) return;
    var st = load();
    var done = !!st.done[d.day];
    var bar = old || document.createElement('div');
    bar.id = 'journeyDayBar';
    bar.className = 'journey-daybar';
    bar.innerHTML = '';
    var span = document.createElement('span');
    span.textContent = '🕊 Day ' + d.day + ' of the Life of Christ Journey — ' + d.title + (done ? ' · Completed ✓' : '');
    bar.appendChild(span);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jp-btn' + (done ? ' ghost' : ' gold');
    btn.textContent = done ? 'Undo' : '✓ Mark Day ' + d.day + ' complete';
    btn.addEventListener('click', function () {
      toggleDay(d.day);
      renderDayBar();
      var pill = document.getElementById('journeyPill');
      if (pill) { pill.remove(); renderPill(); }
    });
    bar.appendChild(btn);
    var cardBar = document.getElementById('verseCardBar');
    if (cardBar && cardBar.parentNode === anchor.parentNode) anchor.parentNode.insertBefore(bar, cardBar.nextSibling);
    else anchor.parentNode.insertBefore(bar, anchor);
  }

  function init() {
    addStyle();
    if (document.getElementById('journeyList')) { renderJourneyPage(); cloudPull(); return; }
    renderPill();
    renderDayBar();
    cloudPull();
    var target = document.getElementById('eventNumber');
    if (target && window.MutationObserver) {
      var obs = new MutationObserver(function () { renderDayBar(); });
      obs.observe(target, { childList: true, characterData: true, subtree: true });
    }
    window.addEventListener('hashchange', function () { setTimeout(renderDayBar, 60); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
