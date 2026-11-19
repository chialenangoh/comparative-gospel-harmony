/* Bible in One Year for the Gospel Harmony — read the whole Bible in 365
   days: an Old Testament portion every day, with New Testament and a
   Psalm or Proverb woven through the year (plan-data.js, 1,189 chapters).
   Progress lives on this device (localStorage) and, for signed-in readers,
   syncs through the account (study_records, kind "plan"). Finishing a day
   can be shared to the reader's community stream via gh-activity.js. */
(function () {
  'use strict';

  var KEY = 'gh-plan-v1';
  var DAYS = 365;
  var root = document.getElementById('planRoot');
  if (!root || !window.GH_PLAN_YEAR) return;

  function loadLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.done) return p; }
    } catch (e) {}
    return { start: null, t: 0, done: {} };
  }

  function saveLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = loadLocal();
  var pushTimer = null;
  var openDay = null;

  function cloudPush() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      try { GHSync.save('plan:oneyear', 'plan', state).catch(function () {}); } catch (e) {}
    }, 700);
  }

  function cloudPull() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    GHSync.load('plan:oneyear').then(function (rec) {
      if (!rec || !rec.value || !rec.value.done) { cloudPush(); return; }
      var cloud = rec.value, changed = false;
      Object.keys(cloud.done || {}).forEach(function (k) {
        if (!state.done[k]) { state.done[k] = cloud.done[k]; changed = true; }
      });
      if (cloud.start && (!state.start || (cloud.t || 0) > (state.t || 0))) {
        state.start = cloud.start;
        state.t = cloud.t || 0;
        changed = true;
      }
      if (changed) { saveLocal(); render(); }
      cloudPush();
    }).catch(function () {});
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function parseDay(s) {
    var p = String(s || '').split('-');
    return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
  }

  function fmtDate(d) {
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  function currentDay() {
    if (!state.start) return null;
    var diff = Math.floor((parseDay(todayStr()) - parseDay(state.start)) / 86400000);
    return diff + 1; // may be <1 or >365; callers clamp/interpret
  }

  function doneCount() {
    return Object.keys(state.done).filter(function (k) { return state.done[k]; }).length;
  }

  function readingsHtml(day) {
    return GH_PLAN_YEAR[day - 1].map(function (r) {
      var page = r.w === 'n' ? 'new-testament.html' : 'old-testament.html';
      var label = r.b + ' ' + (r.f === r.t ? r.f : r.f + '–' + r.t);
      return '<a class="pl-read" href="' + page + '#' + r.c + '-' + r.f + '">' + esc(label) + '</a>';
    }).join('');
  }

  function summaryText(day) {
    return GH_PLAN_YEAR[day - 1].map(function (r) {
      return r.b + ' ' + (r.f === r.t ? r.f : r.f + '–' + r.t);
    }).join(' · ');
  }

  function dayCard(day, big) {
    var done = !!state.done[day];
    var date = state.start ? fmtDate(new Date(parseDay(state.start).getTime() + (day - 1) * 86400000)) : '';
    return '<div class="pl-card' + (done ? ' done' : '') + '">' +
      '<div class="pl-dayhead"><strong>Day ' + day + '</strong>' +
      (date ? '<span class="pl-date">' + esc(date) + '</span>' : '') +
      (done ? '<span class="pl-check">✓ Read</span>' : '') + '</div>' +
      '<div class="pl-reads">' + readingsHtml(day) + '</div>' +
      '<button type="button" class="pl-btn' + (done ? ' ghost' : ' gold') + '" data-toggle="' + day + '">' +
      (done ? 'Mark as not read' : '✓ Mark Day ' + day + ' complete') + '</button></div>';
  }

  function render() {
    var count = doneCount();
    var pct = Math.round(count / DAYS * 100);
    var cur = currentDay();
    var html = '';

    html += '<div class="pl-card pl-progress"><div class="pl-prow"><strong>' + count + ' of ' + DAYS + ' days</strong>' +
      '<span class="pl-date">' + pct + '% of the Bible</span></div>' +
      '<div class="pl-bar"><i style="width:' + pct + '%"></i></div>';

    if (!state.start) {
      html += '<p class="pl-note">Start any day — most readers begin today. Every day brings an Old Testament portion, and through the year the New Testament and the Psalms &amp; Proverbs are woven in, until on Day 365 you finish with Malachi, Revelation 22 and Proverbs 31.</p>' +
        '<button type="button" class="pl-btn gold" id="plStart">Start today — Day 1: Genesis 1–2</button></div>';
      root.innerHTML = html + allDaysHtml(cur);
      wire(cur);
      return;
    }

    if (cur > DAYS) {
      html += '<p class="pl-note">🎉 Your year is complete — you have read the whole Bible! Start again whenever you are ready.</p>' +
        '<button type="button" class="pl-btn ghost" id="plRestart">Start a new year</button></div>';
    } else if (cur < 1) {
      html += '<p class="pl-note">Your plan begins on ' + esc(fmtDate(parseDay(state.start))) + '. Day 1 will be waiting for you.</p></div>';
    } else {
      var behind = 0;
      for (var d = 1; d < cur; d++) if (!state.done[d]) behind++;
      html += '<p class="pl-note">Today is <strong>Day ' + cur + '</strong> of your year.' +
        (behind ? ' You have ' + behind + ' earlier day' + (behind === 1 ? '' : 's') + ' still unread — no condemnation: catch up a day at a time, or simply continue from today.' : ' You are right on track — well done.') + '</p></div>';
      html += '<h2 class="pl-h">Today’s reading</h2>' + dayCard(cur, true);
    }

    html += allDaysHtml(cur);
    root.innerHTML = html;
    wire(cur);
  }

  function allDaysHtml(cur) {
    if (!state.start) return '';
    var rows = '';
    for (var d = 1; d <= DAYS; d++) {
      var done = !!state.done[d];
      var isToday = d === cur;
      rows += '<div class="pl-row' + (done ? ' done' : '') + (isToday ? ' today' : '') + '">' +
        '<button type="button" class="pl-rowmain" data-open="' + d + '">' +
        '<span class="pl-rowday">Day ' + d + (isToday ? ' · today' : '') + '</span>' +
        '<span class="pl-rowsum">' + esc(summaryText(d)) + '</span>' +
        '<span class="pl-rowcheck">' + (done ? '✓' : '›') + '</span></button>' +
        (openDay === d ? '<div class="pl-rowopen">' + readingsHtml(d) +
          '<button type="button" class="pl-btn' + (done ? ' ghost' : ' gold') + '" data-toggle="' + d + '">' +
          (done ? 'Mark as not read' : '✓ Mark complete') + '</button></div>' : '') +
        '</div>';
    }
    return '<h2 class="pl-h">All 365 days</h2>' +
      '<div class="pl-card pl-set"><label class="pl-label" for="plStartDate">Plan start date</label>' +
      '<div class="pl-setrow"><input class="pl-input" id="plStartDate" type="date" value="' + esc(state.start || '') + '">' +
      '<button type="button" class="pl-btn ghost" id="plSetStart">Save</button>' +
      '<button type="button" class="pl-btn ghost" id="plRestart2">Restart plan</button></div>' +
      '<p class="pl-note">Changing the start date moves which day is “today”. Restart clears all progress.</p></div>' +
      '<div class="pl-list">' + rows + '</div>';
  }

  function wire(cur) {
    var startBtn = document.getElementById('plStart');
    if (startBtn) startBtn.addEventListener('click', function () {
      state.start = todayStr();
      state.t = Date.now();
      saveLocal(); cloudPush(); render();
    });
    ['plRestart', 'plRestart2'].forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () {
        if (!window.confirm('Restart the Bible in One Year plan? Your reading progress will be cleared.')) return;
        state = { start: todayStr(), t: Date.now(), done: {} };
        saveLocal(); cloudPush(); render();
      });
    });
    var setBtn = document.getElementById('plSetStart');
    if (setBtn) setBtn.addEventListener('click', function () {
      var v = document.getElementById('plStartDate').value;
      if (!v) return;
      state.start = v;
      state.t = Date.now();
      saveLocal(); cloudPush(); render();
    });
    root.querySelectorAll('[data-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var day = +b.getAttribute('data-toggle');
        if (state.done[day]) {
          delete state.done[day];
        } else {
          state.done[day] = Date.now();
          if (window.GHActivity) GHActivity.post('plan', null, { day: day, plan: 'Bible in One Year' });
        }
        state.t = Date.now();
        saveLocal(); cloudPush(); render();
      });
    });
    root.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        var day = +b.getAttribute('data-open');
        openDay = openDay === day ? null : day;
        render();
        if (openDay) {
          var el = root.querySelector('[data-open="' + day + '"]');
          if (el) el.scrollIntoView({ block: 'center' });
        }
      });
    });
  }

  render();
  cloudPull();
})();
