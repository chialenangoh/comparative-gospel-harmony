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
  /* ---------- "Everything you've done" — activity tabs in the streak
     sheet (owner request 2026-11-20): All · Highlights · Notes · Plans ·
     Badges, each pill opening the reader's own items. All data is read
     from the same on-device stores the features themselves use. */
  function lsJSON(key, dflt) {
    try { var v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? dflt : v; }
    catch (e) { return dflt; }
  }
  function escH(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var HL_HEX = { gold: '#e3c57e', green: '#6ec478', blue: '#6ea8ff', pink: '#ff8db6', purple: '#a78bfa', orange: '#ff9f43', teal: '#2dc4b7', red: '#ff6b6b' };
  function pageLabel(p) {
    var f = String(p || '').split('?')[0].split('/').pop() || 'index.html';
    var map = { 'index.html': 'Life of Jesus', 'old-testament.html': 'Old Testament', 'new-testament.html': 'New Testament', 'acts-harmony.html': 'Acts', 'bible.html': 'Bible Books', 'journey.html': '30-Day Journey', 'plan.html': 'Bible in One Year', 'listen.html': 'Listen', 'quiz.html': 'Life of Christ Quiz', 'search.html': 'Search', 'community.html': 'Community', 'prayer.html': 'Prayer List', 'notes.html': 'My Notes', 'advent.html': 'Advent' };
    return map[f] || f.replace(/\.html$/, '');
  }
  function myHighlights() {
    var all = lsJSON('gh-highlights-v1', {}), out = [];
    Object.keys(all || {}).forEach(function (page) {
      (all[page] || []).forEach(function (r) {
        if (r && r.text) out.push({
          id: r.id || '', text: r.text, color: r.color || 'gold', page: page,
          ref: r.ref || '', ver: r.ver || '', t: r.t || 0, rk1: r.rk1 || '', rk2: r.rk2 || ''
        });
      });
    });
    out.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    return out;
  }
  function fmtAgo(t) {
    if (!t) return '';
    var s = Math.floor((Date.now() - t) / 1000);
    if (s < 3600) return 'now';
    if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 7 * 86400) return Math.floor(s / 86400) + 'd';
    if (s < 30 * 86400) return Math.floor(s / 604800) + 'w';
    if (s < 365 * 86400) return Math.floor(s / 2592000) + 'mo';
    return Math.floor(s / 31536000) + 'y';
  }
  function hlFavs() { return lsJSON('gh-hl-favs-v1', {}); }
  function pageHref(p) { return p && p.charAt(0) === '/' ? p : '/' + (p || ''); }
  function updateHlRecord(page, id, patch) {
    var all = lsJSON('gh-highlights-v1', {});
    var list = all[page] || [];
    var idx = -1;
    list.forEach(function (r, i) { if (r && r.id === id) idx = i; });
    if (idx < 0) return false;
    if (patch === null) list.splice(idx, 1);
    else for (var k in patch) list[idx][k] = patch[k];
    if (list.length) all[page] = list; else delete all[page];
    try { localStorage.setItem('gh-highlights-v1', JSON.stringify(all)); } catch (e) {}
    return true;
  }
  /* YouVersion-style highlight card (owner request 2026-11-20): header
     with the reader's photo, the verse in large serif with a color bar,
     like / comment / ••• actions, and the full action menu — Read,
     Share, Pray, Create Image, Compare Versions, Copy, Edit, Delete. */
  function hlCard(h, favs) {
    var hex = HL_HEX[h.color] || HL_HEX.gold;
    /* Owner (2026-11-20): never headline a card with the section name
       ("You highlighted New Testament") — the Bible verse itself is the
       headline. Only a real reference may complete the sentence. */
    var title = h.ref ? escH(h.ref) + (h.ver ? ' ' + escH(h.ver) : '') : '';
    var who = h.ref ? 'You highlighted <b>' + title + '</b>' : 'You highlighted';
    var fav = h.id && favs[h.id];
    return '<div class="gh-hl-card" data-page="' + escH(h.page) + '" data-id="' + escH(h.id) + '">' +
      '<div class="gh-hl-head">' +
        '<span class="gh-hl-avatar">👤</span>' +
        '<span class="gh-hl-who">' + who + '</span>' +
        '<span class="gh-hl-when">' + (h.t ? fmtAgo(h.t) : '') + '</span>' +
        '<span class="gh-act-dot" style="background:' + hex + '"></span>' +
      '</div>' +
      '<div class="gh-hl-body" style="border-left-color:' + hex + '">' +
        '<p class="gh-hl-text">' + escH(h.text) + '</p>' +
        (title ? '<div class="gh-hl-ref">' + title + '</div>' : '') +
      '</div>' +
      '<div class="gh-hl-foot">' +
        '<button class="gh-hl-icobtn' + (fav ? ' faved' : '') + '" type="button" data-hl-fav aria-label="Love this highlight">' + (fav ? '❤️' : '🤍') + '</button>' +
        '<a class="gh-hl-icobtn" href="community.html" aria-label="See it in Community">💬</a>' +
        '<button class="gh-hl-icobtn gh-hl-dots" type="button" data-hl-menu aria-label="Highlight actions">•••</button>' +
      '</div>' +
      '<div class="gh-hl-menu" hidden>' +
        '<button type="button" data-hl-act="read">📖 Read</button>' +
        '<button type="button" data-hl-act="share">📤 Share</button>' +
        '<button type="button" data-hl-act="pray">🙏 Pray</button>' +
        '<button type="button" data-hl-act="image">🖼️ Create Image</button>' +
        '<button type="button" data-hl-act="compare">🔍 Compare Versions</button>' +
        '<button type="button" data-hl-act="copy">📋 Copy</button>' +
        '<button type="button" data-hl-act="edit">🖍️ Edit</button>' +
        '<button type="button" data-hl-act="delete" class="danger">🗑️ Delete</button>' +
      '</div>' +
      '<div class="gh-hl-edit" hidden>' +
        '<span class="gh-hl-edit-label">Change color:</span>' +
        Object.keys(HL_HEX).map(function (c) {
          return '<button type="button" class="gh-hl-swatch' + (c === h.color ? ' sel' : '') + '" data-hl-color="' + c + '" style="background:' + HL_HEX[c] + '" aria-label="Highlight ' + c + '"></button>';
        }).join('') +
      '</div>' +
      '<div class="gh-hl-cmp" hidden></div>' +
    '</div>';
  }
  function myNotes() {
    var st = lsJSON('gh-notes-v1', { items: {} }), out = [];
    Object.keys((st && st.items) || {}).forEach(function (k) {
      var it = st.items[k];
      if (it && !it.gone) out.push({ ref: it.ref || '', text: it.text || '', t: it.created || it.t || 0 });
    });
    out.sort(function (a, b) { return b.t - a.t; });
    return out;
  }
  function myPlan() {
    var st = lsJSON('gh-plan-v1', { done: {} });
    var days = Object.keys((st && st.done) || {}).filter(function (k) { return st.done[k]; })
      .map(function (k) { return parseInt(k, 10); }).filter(function (n) { return !isNaN(n); })
      .sort(function (a, b) { return b - a; });
    return { count: days.length, days: days, start: (st && st.start) || null };
  }
  function myBadges(d) {
    var B = [];
    function add(ico, name, desc, have, need) {
      B.push({ ico: ico, name: name, desc: desc, have: have, need: need, earned: have >= need });
    }
    add('🌱', 'First Steps', 'Mark your first day in the Word', d.journeyTotal, 1);
    add('⚡', '3-Day Streak', 'Three days in a row', d.best, 3);
    add('🔥', '7-Day Streak', 'A full week, day after day', d.best, 7);
    add('🌟', '30-Day Streak', 'A month of daily Bible habit', d.best, 30);
    add('👑', '100-Day Streak', 'One hundred days in a row', d.best, 100);
    add('📆', '50 Days in the Word', 'Fifty days on the journey', d.journeyTotal, 50);
    add('💯', '100 Days in the Word', 'One hundred days in the Word', d.journeyTotal, 100);
    add('🖍️', 'First Highlight', 'Highlight your first verse', d.hl, 1);
    add('🎨', '10 Highlights', 'Ten verses highlighted', d.hl, 10);
    add('🌈', '25 Highlights', 'Twenty-five verses highlighted', d.hl, 25);
    add('📝', 'First Note', 'Write your first verse note', d.notes, 1);
    add('📚', '10 Notes', 'Ten notes in your notebook', d.notes, 10);
    add('📖', 'Plan Starter', 'Finish day one of Bible in One Year', d.plan, 1);
    add('🗓️', '30 Plan Days', 'Thirty days of the reading plan', d.plan, 30);
    add('🏃', '100 Plan Days', 'One hundred days of the reading plan', d.plan, 100);
    add('🏆', 'Through the Bible', 'Finish all 365 days of the plan', d.plan, 365);
    return B;
  }
  function fmtDate(t) {
    if (!t) return '';
    var d = new Date(t);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function hlRow(h) {
    var href = escH(h.page.charAt(0) === '/' ? h.page : '/' + h.page);
    return '<a class="gh-act-row" href="' + href + '">' +
      '<span class="gh-act-dot" style="background:' + (HL_HEX[h.color] || HL_HEX.gold) + '"></span>' +
      '<span class="gh-act-main"><span class="gh-act-text">“' + escH(h.text) + '”</span>' +
      '<span class="gh-act-meta">' + (h.ref ? escH(h.ref) + (h.ver ? ' ' + escH(h.ver) : '') + ' · ' : '') + escH(h.color) + ' highlight</span></span></a>';
  }
  function noteRow(n) {
    return '<a class="gh-act-row" href="notes.html">' +
      '<span class="gh-act-ico">📝</span>' +
      '<span class="gh-act-main"><span class="gh-act-text"><b>' + escH(n.ref) + '</b>' +
      (n.text ? ' — ' + escH(n.text) : '') + '</span>' +
      (n.t ? '<span class="gh-act-meta">' + fmtDate(n.t) + '</span>' : '') + '</span></a>';
  }
  function badgeCell(b) {
    return '<div class="gh-badge' + (b.earned ? '' : ' locked') + '">' +
      '<div class="gh-badge-img">' + b.ico + (b.earned ? '<span class="gh-badge-tick">✓</span>' : '') + '</div>' +
      '<div class="gh-badge-name">' + escH(b.name) + '</div>' +
      '<div class="gh-badge-sub">' + (b.earned ? 'Earned' : escH(b.desc) + ' · ' + Math.min(b.have, b.need) + '/' + b.need) + '</div></div>';
  }
  function activityData() {
    var hl = myHighlights(), nt = myNotes(), pl = myPlan();
    var days = journeyDays();
    var total = Object.keys(days).filter(function (k) { return days[k]; }).length;
    var s = streakStats();
    var badges = myBadges({ journeyTotal: total, best: s.best, hl: hl.length, notes: nt.length, plan: pl.count });
    return { hl: hl, nt: nt, pl: pl, journeyTotal: total, badges: badges };
  }
  function renderActivity(tab, d) {
    if (tab === 'highlights') {
      if (!d.hl.length) return '<p class="gh-act-empty">No highlights yet. Tap any verse while you read and pick a color — it will wait for you here.</p>';
      var favs = hlFavs();
      return d.hl.map(function (h) { return hlCard(h, favs); }).join('');
    }
    if (tab === 'notes') {
      if (!d.nt.length) return '<p class="gh-act-empty">No notes yet. Open <b>My Notes</b> from the More tab and write what a verse says to you.</p>' +
        '<a class="gh-sheet-link" href="notes.html">Open My Notes →</a>';
      return d.nt.map(noteRow).join('') + '<a class="gh-sheet-link" href="notes.html">Open My Notes →</a>';
    }
    if (tab === 'plans') {
      var pct = Math.round(d.pl.count / 365 * 100);
      var chips = d.pl.days.slice(0, 14).map(function (n) { return '<span class="gh-day-chip">Day ' + n + ' ✓</span>'; }).join('');
      return '<div class="gh-plan-head"><b>Bible in One Year</b><span>' + d.pl.count + ' of 365 days · ' + pct + '%</span></div>' +
        '<div class="gh-plan-bar"><div class="gh-plan-fill" style="width:' + Math.max(pct, d.pl.count ? 2 : 0) + '%"></div></div>' +
        (d.pl.start ? '<p class="gh-act-meta">Started ' + fmtDate(d.pl.start) + '</p>' : '') +
        (chips ? '<div class="gh-day-chips">' + chips + '</div>' : '<p class="gh-act-empty">No plan days finished yet — today is a good day to begin.</p>') +
        '<a class="gh-sheet-link" href="plan.html">Open Bible in One Year →</a>' +
        '<div class="gh-plan-head" style="margin-top:16px"><b>30-Day Journey</b><span>' + d.journeyTotal + ' days marked</span></div>' +
        '<a class="gh-sheet-link" href="journey.html">Open the 30-Day Journey →</a>';
    }
    if (tab === 'badges') {
      var earned = d.badges.filter(function (b) { return b.earned; }).length;
      return '<p class="gh-act-count">' + earned + ' of ' + d.badges.length + ' badges earned</p>' +
        '<div class="gh-badges">' + d.badges.map(badgeCell).join('') + '</div>';
    }
    // All — an overview: counts, earned badges, then the latest of everything
    var earnedBadges = d.badges.filter(function (b) { return b.earned; });
    var html = '<p class="gh-act-count">' + d.hl.length + ' highlights · ' + d.nt.length + ' notes · ' +
      d.pl.count + ' plan days · ' + earnedBadges.length + ' badges</p>';
    if (earnedBadges.length) {
      html += '<div class="gh-badges-row">' + earnedBadges.map(function (b) {
        return '<div class="gh-badge mini"><div class="gh-badge-img">' + b.ico + '</div><div class="gh-badge-name">' + escH(b.name) + '</div></div>';
      }).join('') + '</div>';
    }
    var latest = d.nt.slice(0, 3).map(noteRow).join('') + d.hl.slice(0, 4).map(hlRow).join('');
    html += latest || '<p class="gh-act-empty">Nothing here yet — read a passage, highlight a verse, write a note, and your journey will fill this page.</p>';
    return html;
  }

  /* ---------- highlight card actions ---------- */
  function flashBtn(btn, msg) {
    if (!btn) return;
    var old = btn.innerHTML;
    btn.innerHTML = msg;
    setTimeout(function () { btn.innerHTML = old; }, 1600);
  }
  function copyText(txt, btn) {
    var done = function () { flashBtn(btn, '✓ Copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done).catch(function () { legacyCopy(txt); done(); });
    } else { legacyCopy(txt); done(); }
  }
  function legacyCopy(txt) {
    try {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    } catch (e) {}
  }
  function hlShareText(h) {
    var ref = h.ref ? h.ref + (h.ver ? ' ' + h.ver : '') : '';
    return '“' + h.text + '”' + (ref ? ' — ' + ref : '') + ' · via Gospel Harmony';
  }
  function addToPrayerList(h) {
    var st = lsJSON('gh-prayers-v1', { items: {} });
    if (!st.items) st.items = {};
    var id = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
    st.items[id] = {
      title: h.ref || 'Highlighted verse', person: '',
      details: h.text, created: Date.now(), answered: null, t: Date.now()
    };
    try { localStorage.setItem('gh-prayers-v1', JSON.stringify(st)); } catch (e) {}
  }
  function verseImageBlob(h, cb) {
    try {
      var W = 1080, H = 1350, cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var ctx = cv.getContext('2d');
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#17335e'); g.addColorStop(1, '#0b1a30');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#d5aa57'; ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, W - 72, H - 72);
      var ref = h.ref ? h.ref + (h.ver ? ' ' + h.ver : '') : '';
      var size = 56, lines = [];
      (function fit() {
        ctx.font = '600 ' + size + 'px Georgia, "Times New Roman", serif';
        var words = ('“' + h.text + '”').split(/\s+/), line = '';
        lines = [];
        words.forEach(function (w) {
          var t = line ? line + ' ' + w : w;
          if (ctx.measureText(t).width > W - 210 && line) { lines.push(line); line = w; }
          else line = t;
        });
        if (line) lines.push(line);
        if (lines.length * (size * 1.35) > H - 460 && size > 30) { size -= 4; fit(); }
      })();
      var lh = size * 1.35, total = lines.length * lh;
      var y = (H - total) / 2 - 30;
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
      lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y + i * lh); });
      ctx.fillStyle = '#d5aa57';
      ctx.font = '700 46px Georgia, "Times New Roman", serif';
      ctx.fillText(ref, W / 2, y + total + 78);
      ctx.fillStyle = 'rgba(255,255,255,.72)';
      ctx.font = '600 30px sans-serif';
      ctx.fillText('✦ Gospel Harmony ✦', W / 2, H - 92);
      if (cv.toBlob) cv.toBlob(cb, 'image/png'); else cb(null);
    } catch (e) { cb(null); }
  }
  function fillHlAvatars() {
    if (!window.GHActivity || !GHActivity.session || !GHActivity.session()) return;
    GHActivity.myProfile().then(function (p) {
      if (!p) return;
      Array.prototype.forEach.call(document.querySelectorAll('.gh-hl-avatar'), function (el) {
        if (p.avatar_url) el.innerHTML = '<img src="' + escH(p.avatar_url) + '" alt="">';
        else if (p.display_name) el.textContent = p.display_name.trim().charAt(0).toUpperCase();
      });
    }).catch(function () {});
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
      '<a class="gh-sheet-link gh-streak-go" href="journey.html">Open the 30-Day Journey →</a>' +
      '<div class="gh-act">' +
        '<div class="gh-act-title">Everything you\'ve done</div>' +
        '<div class="gh-pills" role="tablist" aria-label="Your activity">' +
          '<button class="gh-pill active" type="button" data-tab="all">All</button>' +
          '<button class="gh-pill" type="button" data-tab="highlights">🖍️ Highlights</button>' +
          '<button class="gh-pill" type="button" data-tab="notes">🗒️ Notes</button>' +
          '<button class="gh-pill" type="button" data-tab="plans">✅ Plans</button>' +
          '<button class="gh-pill" type="button" data-tab="badges">🏅 Badges</button>' +
        '</div>' +
        '<div class="gh-act-panel"></div>' +
      '</div>'
    );
    var why = document.querySelector('.gh-why-btn');
    if (why) why.addEventListener('click', function () {
      var t = document.querySelector('.gh-why-text');
      if (t) t.hidden = !t.hidden;
    });
    var panel = document.querySelector('.gh-act-panel');
    if (panel) {
      var data = activityData();
      var currentTab = 'all';
      var hlById = {};
      var showTab = function (tab) {
        currentTab = tab;
        data = activityData();
        hlById = {};
        data.hl.forEach(function (h) { if (h.id) hlById[h.id] = h; });
        panel.innerHTML = renderActivity(tab, data);
        Array.prototype.forEach.call(document.querySelectorAll('.gh-pill'), function (p) {
          p.classList.toggle('active', p.getAttribute('data-tab') === tab);
        });
        if (tab === 'highlights') fillHlAvatars();
      };
      showTab('all');
      Array.prototype.forEach.call(document.querySelectorAll('.gh-pill'), function (p) {
        p.addEventListener('click', function () { showTab(p.getAttribute('data-tab')); });
      });
      panel.addEventListener('click', function (e) {
        var card = e.target.closest ? e.target.closest('.gh-hl-card') : null;
        if (!card) return;
        var h = hlById[card.getAttribute('data-id')];
        var menuBtn = e.target.closest('[data-hl-menu]');
        if (menuBtn) {
          var menu = card.querySelector('.gh-hl-menu');
          var wasHidden = menu.hidden;
          Array.prototype.forEach.call(panel.querySelectorAll('.gh-hl-menu'), function (m) { m.hidden = true; });
          menu.hidden = !wasHidden;
          return;
        }
        var favBtn = e.target.closest('[data-hl-fav]');
        if (favBtn && h) {
          var favs = hlFavs();
          if (favs[h.id]) delete favs[h.id]; else favs[h.id] = 1;
          try { localStorage.setItem('gh-hl-favs-v1', JSON.stringify(favs)); } catch (err) {}
          favBtn.classList.toggle('faved', !!favs[h.id]);
          favBtn.innerHTML = favs[h.id] ? '❤️' : '🤍';
          return;
        }
        var sw = e.target.closest('[data-hl-color]');
        if (sw && h) {
          updateHlRecord(h.page, h.id, { color: sw.getAttribute('data-hl-color') });
          showTab(currentTab);
          return;
        }
        var actBtn = e.target.closest('[data-hl-act]');
        if (!actBtn || !h) return;
        var act = actBtn.getAttribute('data-hl-act');
        var menu2 = card.querySelector('.gh-hl-menu');
        if (act === 'read') { location.href = pageHref(h.page); return; }
        if (act === 'share') {
          var payload = { title: 'Gospel Harmony', text: hlShareText(h) };
          if (navigator.share) navigator.share(payload).catch(function () {});
          else copyText(payload.text, actBtn);
          if (menu2) menu2.hidden = true;
          return;
        }
        if (act === 'copy') { copyText(hlShareText(h), actBtn); if (menu2) menu2.hidden = true; return; }
        if (act === 'pray') {
          addToPrayerList(h);
          flashBtn(actBtn, '✓ Added — see Prayer List');
          if (menu2) menu2.hidden = true;
          return;
        }
        if (act === 'edit') {
          var ed = card.querySelector('.gh-hl-edit');
          if (ed) ed.hidden = !ed.hidden;
          if (menu2) menu2.hidden = true;
          return;
        }
        if (act === 'delete') {
          if (!actBtn.getAttribute('data-armed')) {
            actBtn.setAttribute('data-armed', '1');
            actBtn.innerHTML = '🗑️ Tap again to delete';
            setTimeout(function () { actBtn.removeAttribute('data-armed'); actBtn.innerHTML = '🗑️ Delete'; }, 3000);
            return;
          }
          updateHlRecord(h.page, h.id, null);
          showTab(currentTab);
          return;
        }
        if (act === 'image') {
          flashBtn(actBtn, 'Making image…');
          verseImageBlob(h, function (blob) {
            if (!blob) { flashBtn(actBtn, 'Image failed — try again'); return; }
            var file = null;
            try { file = new File([blob], 'gospel-harmony-verse.png', { type: 'image/png' }); } catch (err) {}
            if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
              navigator.share({ files: [file], title: 'Gospel Harmony' }).catch(function () {});
            } else {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'gospel-harmony-verse.png';
              document.body.appendChild(a); a.click();
              setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
            }
            if (menu2) menu2.hidden = true;
          });
          return;
        }
        if (act === 'compare') {
          if (menu2) menu2.hidden = true;
          var box = card.querySelector('.gh-hl-cmp');
          if (!box) return;
          box.hidden = false;
          box.innerHTML = '<p class="gh-act-meta">Loading…</p>';
          var ownVer = h.ver || 'KJV';
          var html = '<div class="gh-cmp-ver"><b>' + escH(ownVer) + '</b><p>' + escH(h.text) + '</p></div>';
          var finish = function (extra) {
            box.innerHTML = html + (extra || '') +
              '<a class="gh-sheet-link" href="' + escH(pageHref(h.page)) + '">Open in the reader for all versions →</a>';
          };
          var api = window.BibleApiTranslations;
          if (h.rk1 && api && api.fetchPassageText && api.code && api.code !== ownVer) {
            var p1 = h.rk1.split(' '), p2 = (h.rk2 || h.rk1).split(' ');
            if (p1[0] === p2[0] && p1[1] === p2[1]) {
              api.fetchPassageText(p1[0], p1[1], parseInt(p1[2], 10), parseInt(p2[2], 10))
                .then(function (txt) {
                  finish(txt ? '<div class="gh-cmp-ver"><b>' + escH(api.code) + '</b><p>' + escH(txt) + '</p></div>' : '');
                })
                .catch(function () { finish(''); });
              return;
            }
          }
          finish('');
          return;
        }
      });
    }
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
