/* App look — injects the YouVersion-style chrome (phones, <=900px):
   a greeting bar (time-of-day greeting + reader name, day streak and a
   notifications bell) that replaces the classic top menu, a bottom tab
   bar (Home · Bible · Plans · Community · More), and a "More" bottom
   sheet carrying everything the old top menu held. Styled by
   app-look.css. The current page's tab is highlighted from the URL, so
   the same file works on every page that includes it. */
(function () {
  'use strict';

  var TABS = [
    { href: 'index.html',     ico: '🏠', label: 'Home',      match: ['', 'index.html'] },
    { href: 'bible.html',     ico: '📖', label: 'Bible',     match: ['bible.html', 'old-testament.html', 'new-testament.html'] },
    { href: 'plan.html',      ico: '📅', label: 'Plans',     match: ['plan.html', 'journey.html', 'advent.html'] },
    { href: 'community.html', ico: '🤝', label: 'Community', match: ['community.html'] },
    { href: '#more',          ico: '☰',  label: 'More',      match: [] }
  ];

  /* ---------- day streak (same rule as journey.js) ---------- */
  function dayStr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function journeyDays() {
    var st = {};
    try { st = JSON.parse(localStorage.getItem('gh-journey-v1') || '{}') || {}; } catch (e) {}
    return st.days || {};
  }
  function streak() {
    var days = journeyDays(), count = 0, d = new Date();
    if (!days[dayStr(d)]) d.setDate(d.getDate() - 1);
    while (days[dayStr(d)]) { count++; d.setDate(d.getDate() - 1); }
    return count;
  }
  function streakStats() {
    var days = journeyDays();
    var keys = Object.keys(days).filter(function (k) { return days[k]; }).sort();
    var best = 0, run = 0, prev = null;
    keys.forEach(function (k) {
      var t = new Date(k + 'T12:00:00').getTime();
      run = (prev !== null && t - prev === 86400000) ? run + 1 : 1;
      if (run > best) best = run;
      prev = t;
    });
    var year = String(new Date().getFullYear());
    var thisYear = keys.filter(function (k) { return k.indexOf(year) === 0; }).length;
    // consecutive weeks (Sun-Sat) with at least one marked day
    var weeks = 0, sunday = new Date();
    sunday.setHours(12, 0, 0, 0);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    for (var w = 0; w < 60; w++) {
      var hit = false;
      for (var i = 0; i < 7; i++) {
        var dd = new Date(sunday); dd.setDate(sunday.getDate() + i);
        if (days[dayStr(dd)]) { hit = true; break; }
      }
      if (hit) weeks++;
      else if (w > 0) break; // an in-progress current week doesn't break the run
      sunday.setDate(sunday.getDate() - 7);
    }
    // this week's strip
    var start = new Date(); start.setHours(12, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    var todayStr = dayStr(new Date()), week = [];
    for (var j = 0; j < 7; j++) {
      var d2 = new Date(start); d2.setDate(start.getDate() + j);
      week.push({ n: d2.getDate(), done: !!days[dayStr(d2)], today: dayStr(d2) === todayStr });
    }
    return { now: streak(), best: best, thisYear: thisYear, weeks: weeks, week: week };
  }
  function openStreakSheet() {
    var s = streakStats();
    var names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var cells = s.week.map(function (c, i) {
      return '<div class="gh-wk-day">' +
        '<span class="gh-wk-name">' + names[i] + '</span>' +
        '<span class="gh-wk-dot">' + (c.done ? '●' : '') + '</span>' +
        '<span class="gh-wk-num' + (c.today ? ' today' : '') + '">' + c.n + '</span></div>';
    }).join('');
    openSheet(
      '<div class="gh-sheet-title">Streaks help you build your daily Bible habit.</div>' +
      '<div class="gh-streak-cards">' +
        '<div class="gh-streak-card"><div class="gh-streak-label">Journey Streak</div>' +
          '<div class="gh-streak-big">' + s.now + ' ⚡</div>' +
          '<div class="gh-streak-sub">Best: ' + s.best + '</div></div>' +
        '<div class="gh-streak-card"><div class="gh-streak-label">Days This Year</div>' +
          '<div class="gh-streak-big">' + s.thisYear + '</div>' +
          '<div class="gh-streak-sub">days in the Word</div></div>' +
      '</div>' +
      (s.weeks > 1 ? '<p class="gh-streak-weeks">' + s.weeks + ' weeks in a row</p>' : '') +
      '<div class="gh-wk">' + cells + '</div>' +
      '<button class="gh-why-btn" type="button">Why Streaks?</button>' +
      '<p class="gh-why-text" hidden>Each day you complete a day in the 30-Day Journey, your streak grows. Miss a day and the count starts again — small steps, every day, build a lasting habit in God\'s Word.</p>' +
      '<a class="gh-sheet-link gh-streak-go" href="journey.html">Open the 30-Day Journey →</a>'
    );
    var why = document.querySelector('.gh-why-btn');
    if (why) why.addEventListener('click', function () {
      var t = document.querySelector('.gh-why-text');
      if (t) t.hidden = !t.hidden;
    });
  }

  function greetingWord() {
    var h = new Date().getHours();
    return h < 12 ? 'Good Morning' : (h < 18 ? 'Good Afternoon' : 'Good Evening');
  }

  /* ---------- greeting bar ---------- */
  function buildGreeting() {
    if (document.querySelector('.gh-greet')) return;
    var bar = document.createElement('header');
    bar.className = 'gh-greet';
    bar.innerHTML =
      '<div class="gh-greet-hi">' + greetingWord() + '<span class="gh-greet-name"></span></div>' +
      '<div class="gh-greet-acts">' +
        '<a class="gh-greet-search" href="search.html" aria-label="Search Scripture">🔍</a>' +
        '<button class="gh-streak" type="button" title="Your day streak" aria-label="Your day streak — view streak information">⚡ <b>' + streak() + '</b></button>' +
        '<button class="gh-bell" type="button" aria-label="Notifications" aria-expanded="false">🔔</button>' +
      '</div>' +
      '<div class="gh-bell-panel" hidden>' +
        '<div class="gh-bell-title">Notifications</div>' +
        '<p>You are all caught up.</p>' +
        '<a href="community.html">See what is happening in Community →</a>' +
      '</div>';
    document.body.appendChild(bar);

    var streakBtn = bar.querySelector('.gh-streak');
    streakBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openStreakSheet();
    });

    var bell = bar.querySelector('.gh-bell');
    var panel = bar.querySelector('.gh-bell-panel');
    bell.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = panel.hidden;
      panel.hidden = !open;
      bell.setAttribute('aria-expanded', String(open));
    });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () {
      if (!panel.hidden) { panel.hidden = true; bell.setAttribute('aria-expanded', 'false'); }
    });

    fillName(bar.querySelector('.gh-greet-name'));
  }

  function setName(el, name) {
    if (!el || !name) return;
    var first = String(name).trim().split(/\s+/)[0];
    if (first) el.textContent = ', ' + first;
  }

  function fillName(el) {
    var tries = 0;
    (function attempt() {
      tries++;
      if (window.GHActivity) {
        try {
          var s = GHActivity.session();
          if (!s) return; // signed out: greeting without a name
          GHActivity.myProfile().then(function (p) {
            if (p && p.display_name) { setName(el, p.display_name); return; }
            var u = s.user || {};
            var meta = u.user_metadata || {};
            if (meta.full_name || meta.name) setName(el, meta.full_name || meta.name);
            else if (u.email) setName(el, u.email.split('@')[0].replace(/[._-]+/g, ' '));
          }).catch(function () {});
          return;
        } catch (e) {}
      }
      if (tries < 6) setTimeout(attempt, 700);
    })();
  }

  /* ---------- More bottom sheet (everything the top menu held) ---------- */
  var sheet, backdrop;
  function buildSheet() {
    if (document.querySelector('.gh-sheet')) return;
    backdrop = document.createElement('div');
    backdrop.className = 'gh-sheet-backdrop';
    backdrop.hidden = true;
    sheet = document.createElement('div');
    sheet.className = 'gh-sheet';
    sheet.hidden = true;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-label', 'More');
    sheet.innerHTML = '<div class="gh-sheet-grip"></div><div class="gh-sheet-body"></div>';
    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
    backdrop.addEventListener('click', closeSheet);
    sheet.addEventListener('click', function (e) {
      var bk = e.target.closest('[data-act="bookmarks"]');
      if (bk) { e.preventDefault(); closeSheet(); if (window.GHLibrary && window.GHLibrary.open) window.GHLibrary.open(); return; }
      var list = e.target.closest('[data-open-list]');
      if (list) {
        e.preventDefault();
        closeSheet();
        var m = document.getElementById('menuButton');
        if (m) m.click();
        return;
      }
      var tb = e.target.closest('[data-text]');
      if (tb) {
        var real = document.getElementById(tb.getAttribute('data-text'));
        if (real) real.click();
        return;
      }
      if (e.target.closest('a')) closeSheet();
    });
  }
  function moreSheetHtml() {
    return '' +
      '<a href="#" data-open-list>📖 Event list</a>' +
      '<a href="#" data-act="bookmarks">🔖 Bookmarks</a>' +
      '<a href="index.html">🏠 Gospels</a>' +
      '<a href="bible.html">📚 Bible Books</a>' +
      '<a href="old-testament.html">📖 Old Testament</a>' +
      '<a href="new-testament.html">📜 New Testament</a>' +
      '<a href="listen.html">🎧 Listen</a>' +
      '<a href="quiz.html">🧠 Life of Christ Quiz</a>' +
      '<a href="films.html">🎬 Films</a>' +
      '<a href="journey.html">🕊 30-Day Journey</a>' +
      '<a href="advent.html">🕯 Advent</a>' +
      '<a href="community.html">🤝 Community</a>' +
      '<a href="prayer.html">🙏 Prayer List</a>' +
      '<a href="notes.html">📝 My Notes</a>' +
      '<a href="plan.html">📅 Bible in One Year</a>' +
      '<div class="gh-sheet-row"><span>Scripture text size</span><span class="gh-sheet-textbtns">' +
      '<button type="button" data-text="decreaseText" aria-label="Decrease Scripture text size">A−</button>' +
      '<button type="button" data-text="increaseText" aria-label="Increase Scripture text size">A+</button></span></div>' +
      '<a href="community.html">👤 Account &amp; sign in</a>';
  }
  function openSheet(html) {
    buildSheet();
    var body = sheet.querySelector('.gh-sheet-body');
    if (body) body.innerHTML = html || '';
    sheet.hidden = false; backdrop.hidden = false;
  }
  function closeSheet() { if (sheet) sheet.hidden = true; if (backdrop) backdrop.hidden = true; }

  /* ---------- bottom tab bar ---------- */
  function buildTabs() {
    if (document.querySelector('.gh-tabbar')) return;
    var page = (location.pathname.split('/').pop() || '').toLowerCase();
    var nav = document.createElement('nav');
    nav.className = 'gh-tabbar';
    nav.setAttribute('aria-label', 'App');
    nav.innerHTML = TABS.map(function (t) {
      var active = t.match.indexOf(page) !== -1 ? ' class="active"' : '';
      return '<a href="' + t.href + '"' + active + (t.href === '#more' ? ' data-more="1"' : '') + '>' +
        '<span class="gh-tab-ico" aria-hidden="true">' + t.ico + '</span>' +
        '<span class="gh-tab-label">' + t.label + '</span></a>';
    }).join('');
    document.body.appendChild(nav);
    var more = nav.querySelector('[data-more]');
    if (more) more.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSheet(moreSheetHtml());
    });
  }

  function build() { buildGreeting(); buildTabs(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
