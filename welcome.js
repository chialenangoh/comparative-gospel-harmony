/* Welcome bar for the Gospel Harmony — greets every reader on the event
   pages and shows their performance level, computed from their real
   on-device (and account-synced) activity:
     - journey days completed (gh-journey-v1)      10 points each
     - best Life of Christ quiz score (gh-quiz-best-v1)  percent = points
     - Study & grow journal entries (gh-study-local-v1)   5 points each, cap 50
     - reading days on the journey (gh-journey-v1 days)   2 points each, cap 60
   Levels: Newcomer 0 · Seeker 1-59 · Disciple 60-149 · Faithful Student
   150-249 · Scripture Scholar 250-349 · Harmony Master 350+.
   The bar renders for every visitor, signed in or not; signing in only
   personalises the greeting and keeps progress synced across devices. */
(function () {
  'use strict';

  var SB_STORE_KEY = 'sb-jgbqghmclugnfklzahpu-auth-token';
  var JOURNEY_KEY = 'gh-journey-v1';
  var QUIZ_KEY = 'gh-quiz-best-v1';
  var STUDY_KEY = 'gh-study-local-v1';
  var JOURNEY_TOTAL = 30;

  var LEVELS = [
    { min: 350, name: 'Harmony Master', icon: '👑' },
    { min: 250, name: 'Scripture Scholar', icon: '🎓' },
    { min: 150, name: 'Faithful Student', icon: '🕯️' },
    { min: 60, name: 'Disciple', icon: '📖' },
    { min: 1, name: 'Seeker', icon: '🔍' },
    { min: 0, name: 'Newcomer', icon: '🌱' }
  ];

  var CSS = [
    '.welcome-bar{margin:0 0 14px;padding:12px 14px;border:1px solid #b9c8d7;border-left:5px solid #d5aa57;border-radius:10px;background:#fff;clear:both;color:#33475e;position:relative}',
    '.welcome-bar h2{margin:0 26px 2px 0;font:700 1.08rem Georgia,serif;color:#10243f}',
    '.welcome-level{font-size:.95rem;margin:2px 0}',
    '.welcome-level strong{color:#10243f}',
    '.welcome-level .lvl{color:#8a6d2f;font-weight:700}',
    '.welcome-stats{font-size:.86rem;color:#4e5a6e;margin:2px 0}',
    '.welcome-next{font-size:.84rem;color:#4e5a6e;margin:2px 0 0}',
    '.welcome-actions{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap}',
    '.welcome-actions a{padding:6px 12px;border-radius:8px;border:1px solid #10243f;background:#10243f;color:#fff;font-weight:700;font-size:.84rem;text-decoration:none}',
    '.welcome-actions a.gold{background:#d5aa57;border-color:#d5aa57;color:#10243f}',
    '.welcome-close{position:absolute;top:6px;right:8px;background:none;border:none;font-size:1.15rem;line-height:1;color:#4e5a6e;cursor:pointer;padding:4px}'
  ].join('\n');

  function parse(key) {
    try { var v = JSON.parse(localStorage.getItem(key) || 'null'); return v; } catch (e) { return null; }
  }

  function readSession() {
    try {
      var raw = localStorage.getItem(SB_STORE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var sess = parsed && parsed.currentSession ? parsed.currentSession : parsed;
      if (!sess || !sess.user) return null;
      if (sess.expires_at && sess.expires_at * 1000 < Date.now() - 30000) return null;
      return sess.user;
    } catch (e) { return null; }
  }

  function firstName(user) {
    if (!user) return null;
    var md = user.user_metadata || {};
    var n = md.full_name || md.name || md.display_name || '';
    if (!n && user.email) n = user.email.split('@')[0].replace(/[._-]+/g, ' ');
    n = String(n || '').trim();
    if (!n) return null;
    return n.charAt(0).toUpperCase() + n.slice(1);
  }

  function stats() {
    var j = parse(JOURNEY_KEY) || {};
    var done = j.done ? Object.keys(j.done).length : 0;
    var days = j.days ? Object.keys(j.days).length : 0;
    var q = parse(QUIZ_KEY);
    var quiz = (q && typeof q.score === 'number' && q.total) ? q : null;
    var study = parse(STUDY_KEY);
    var entries = Array.isArray(study) ? study.filter(function (r) { return r && r.kind === 'journal'; }).length : 0;
    var points = done * 10
      + (quiz ? Math.round(quiz.score / quiz.total * 100) : 0)
      + Math.min(entries * 5, 50)
      + Math.min(days * 2, 60);
    return { done: done, days: days, quiz: quiz, entries: entries, points: points };
  }

  function levelFor(points) {
    for (var i = 0; i < LEVELS.length; i++) if (points >= LEVELS[i].min) return { cur: LEVELS[i], next: LEVELS[i - 1] || null };
    return { cur: LEVELS[LEVELS.length - 1], next: null };
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render() {
    var host = document.querySelector('.reader-inner');
    if (!host) return;
    var bar = document.getElementById('welcomeBar');
    if (sessionStorage.getItem('gh-welcome-dismissed')) { if (bar) bar.remove(); return; }
    if (!bar) {
      if (!document.getElementById('welcomeCss')) {
        var st = document.createElement('style');
        st.id = 'welcomeCss';
        st.textContent = CSS;
        document.head.appendChild(st);
      }
      bar = document.createElement('section');
      bar.id = 'welcomeBar';
      bar.className = 'welcome-bar';
      bar.setAttribute('aria-label', 'Welcome and your performance level');
      host.insertBefore(bar, host.firstChild);
    }
    var user = readSession();
    var name = firstName(user);
    var s = stats();
    var lv = levelFor(s.points);
    var greet = user
      ? 'Welcome back, ' + esc(name || 'friend') + '! 👋'
      : 'Welcome, friend! 👋';
    var html = '<button type="button" class="welcome-close" id="welcomeClose" aria-label="Hide welcome message">×</button>'
      + '<h2>' + greet + '</h2>'
      + '<p class="welcome-level">Your performance level: <span class="lvl">' + lv.cur.icon + ' ' + lv.cur.name + '</span>'
      + ' · <strong>' + s.points + ' harmony points</strong></p>';
    var bits = [];
    bits.push('Journey: ' + s.done + ' of ' + JOURNEY_TOTAL + ' days');
    if (s.quiz) bits.push('Quiz best: ' + s.quiz.score + ' of ' + s.quiz.total + ' 🏆');
    if (s.entries) bits.push('Study entries: ' + s.entries);
    if (s.days) bits.push('Reading days: ' + s.days);
    html += '<p class="welcome-stats">' + bits.join(' · ') + '</p>';
    if (s.points === 0) {
      html += '<p class="welcome-next">Start the 30-day journey or take the Life of Christ quiz to earn your first level.'
        + (user ? '' : ' Sign in (free) and your progress follows you across devices.') + '</p>';
    } else if (lv.next) {
      html += '<p class="welcome-next">Next level: ' + lv.next.icon + ' ' + lv.next.name + ' — ' + (lv.next.min - s.points) + ' points to go. Keep walking through His story!</p>';
    } else {
      html += '<p class="welcome-next">You have reached the highest level — well done! Keep sharing His story. 🙏</p>';
    }
    html += '<div class="welcome-actions">'
      + (s.done < JOURNEY_TOTAL ? '<a class="gold" href="journey.html">Continue your journey →</a>' : '')
      + '<a href="quiz.html">Take the Life of Christ quiz</a>'
      + '</div>';
    bar.innerHTML = html;
    var close = document.getElementById('welcomeClose');
    if (close) close.addEventListener('click', function () {
      try { sessionStorage.setItem('gh-welcome-dismissed', '1'); } catch (e) {}
      bar.remove();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
  /* Journey progress can merge in from the account a moment after load. */
  setTimeout(render, 2500);
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key === JOURNEY_KEY || e.key === QUIZ_KEY || e.key === STUDY_KEY) render();
  });
})();
