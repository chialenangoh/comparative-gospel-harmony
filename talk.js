/* Talk It Over — gentle per-day reader discussion for the 30-day journey.
   Modelled on YouVersion's Plans-with-Friends discussion: one thread per
   journey day, seeded with the day's reflection question. Reading is open
   to everyone; posting needs a (free) site account; readers can delete
   their own messages and report any message for moderation.
   Data lives in Supabase (gh_talk / gh_talk_reports) with row-level
   security: insert/delete are restricted to the message's own author.  */
(function () {
  'use strict';

  var SB_URL = 'https://jgbqghmclugnfklzahpu.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFnaG1jbHVnbmZrbHphaHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDM2MDIsImV4cCI6MjA5NTIxOTYwMn0.aFafq6oqVk_1KgflJubG26pDcjSx0ug1O6ARi322b9Q';
  var STORE_KEY = 'sb-jgbqghmclugnfklzahpu-auth-token';
  var BLOCK = ['http://', 'https://', 'www.', '.com/', 'bitcoin', 'crypto giveaway', 'make money fast', 'casino'];

  var styled = false;
  function addStyles() {
    if (styled) return;
    styled = true;
    var s = document.createElement('style');
    s.textContent = [
      '.ghtalk{border:1px solid #d7e0ea;border-radius:12px;background:#fff;padding:12px 14px;margin-top:10px}',
      '.ghtalk .gt-prompt{font-family:Georgia,serif;font-style:italic;color:#33475e;background:#fdf6dd;border:1px solid #e7d9ab;border-radius:8px;padding:8px 11px;margin:6px 0 10px}',
      '.ghtalk .gt-msg{border-top:1px solid #eef2f7;padding:8px 0}',
      '.ghtalk .gt-msg:first-of-type{border-top:none}',
      '.ghtalk .gt-name{font-weight:700;color:#10243f;font-size:.9rem}',
      '.ghtalk .gt-when{color:#7a8798;font-size:.78rem;margin-left:6px}',
      '.ghtalk .gt-body{color:#22344c;font-size:.95rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}',
      '.ghtalk .gt-actions button{background:none;border:none;color:#7a8798;font-size:.76rem;text-decoration:underline;cursor:pointer;padding:0;margin-right:10px}',
      '.ghtalk textarea{width:100%;box-sizing:border-box;border:1px solid #b9c8d7;border-radius:9px;padding:9px 11px;font-size:.95rem;min-height:64px;font-family:inherit}',
      '.ghtalk .gt-post{margin-top:7px;background:#10243f;color:#fff;border:1px solid #10243f;border-radius:9px;padding:8px 16px;font-weight:700;cursor:pointer}',
      '.ghtalk .gt-note{font-size:.86rem;color:#4e5a6e}',
      '.ghtalk .gt-empty{color:#4e5a6e;font-size:.93rem}'
    ].join('');
    document.head.appendChild(s);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function session() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var s = parsed && parsed.currentSession ? parsed.currentSession : parsed;
      if (!s || !s.access_token || !s.user || !s.user.id) return null;
      if (s.expires_at && s.expires_at * 1000 < Date.now() - 30000) return null;
      return { token: s.access_token, user: s.user };
    } catch (e) { return null; }
  }
  function displayName(user) {
    var md = (user && user.user_metadata) || {};
    return md.full_name || md.name || (user && user.email ? user.email.split('@')[0] : 'Reader');
  }
  function api(method, path, body, useUser) {
    var s = session();
    var headers = {
      apikey: SB_ANON,
      Authorization: 'Bearer ' + (useUser && s ? s.token : SB_ANON),
      'Content-Type': 'application/json'
    };
    if (method === 'POST' || method === 'PATCH') headers.Prefer = 'return=representation';
    return fetch(SB_URL + '/rest/v1/' + path, {
      method: method, headers: headers,
      body: body ? JSON.stringify(body) : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error('talk-' + res.status);
      return method === 'GET' || headers.Prefer ? res.json().catch(function () { return null; }) : null;
    });
  }
  function when(iso) {
    var d = new Date(iso), diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 90) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 86400 * 7) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function mount(el, day, prompt) {
    addStyles();
    el.classList.add('ghtalk');
    var s = session();
    el.innerHTML =
      '<div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7a5c14;font-weight:700">💬 Talk it over — Day ' + day + '</div>' +
      (prompt ? '<div class="gt-prompt">“' + esc(prompt) + '”</div>' : '') +
      '<div style="margin:2px 0 6px"><button type="button" class="gt-share" style="background:#fff;border:1px solid #10243f;color:#10243f;border-radius:999px;padding:5px 12px;font-size:.83rem;font-weight:700;cursor:pointer">📲 Share this day\u2019s question</button> <span class="gt-share-note" style="font-size:.8rem;color:#4e5a6e"></span></div>' +
      '<div class="gt-list"><p class="gt-note">Loading the conversation…</p></div>' +
      '<div class="gt-compose"></div>' +
      '<p class="gt-note" style="margin-top:9px">Be kind and keep it about the passage. This is a reader conversation, gently moderated — please report anything unkind. <button type="button" class="gt-refresh" style="background:none;border:none;color:#4e5a6e;text-decoration:underline;cursor:pointer;font-size:.85rem;padding:0">Refresh</button></p>';
    var list = el.querySelector('.gt-list');
    var compose = el.querySelector('.gt-compose');
    var shareBtn = el.querySelector('.gt-share');
    if (shareBtn) shareBtn.addEventListener('click', function () {
      var text = '💬 Talk It Over — Day ' + day + ' of The Life of Christ in 30 Days:\n“' + (prompt || '') + '”\n\nRead the day\u2019s passage and join the conversation: https://comparative-gospel-harmony.onrender.com/journey.html';
      var note = el.querySelector('.gt-share-note');
      if (navigator.share) navigator.share({ title: 'Talk It Over — Day ' + day, text: text }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { if (note) note.textContent = 'Copied ✓ — paste it anywhere.'; });
    });

    function msgHtml(m) {
      var mine = s && m.user_id === s.user.id;
      return '<div class="gt-msg" data-id="' + esc(m.id) + '">' +
        '<span class="gt-name">' + esc(m.user_name || 'Reader') + '</span><span class="gt-when">' + esc(when(m.created_at)) + '</span>' +
        '<div class="gt-body">' + esc(m.body) + '</div>' +
        '<div class="gt-actions">' +
        (mine ? '<button type="button" data-del="' + esc(m.id) + '">Delete</button>' : '') +
        '<button type="button" data-rep="' + esc(m.id) + '">Report</button>' +
        '</div></div>';
    }
    function load() {
      return api('GET', 'gh_talk?select=id,day,user_id,user_name,body,created_at&day=eq.' + day + '&order=created_at.asc&limit=200', null, false)
        .then(function (rows) {
          rows = rows || [];
          list.innerHTML = rows.length
            ? rows.map(msgHtml).join('')
            : '<p class="gt-empty">No one has shared yet — yours could be the encouragement someone needs today. Be the first. 🌱</p>';
          wire();
        })
        .catch(function () {
          list.innerHTML = '<p class="gt-note">The conversation could not load just now. Please try Refresh in a moment.</p>';
        });
    }
    function wire() {
      list.querySelectorAll('[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!window.confirm('Delete your message?')) return;
          api('DELETE', 'gh_talk?id=eq.' + b.getAttribute('data-del'), null, true).then(load).catch(function () { window.alert('Could not delete — please try again.'); });
        });
      });
      list.querySelectorAll('[data-rep]').forEach(function (b) {
        b.addEventListener('click', function () {
          api('POST', 'gh_talk_reports', { message_id: b.getAttribute('data-rep') }, false)
            .then(function () { b.textContent = 'Reported ✓ — thank you'; b.disabled = true; })
            .catch(function () { b.textContent = 'Could not report — try again'; });
        });
      });
    }
    function composeHtml() {
      if (!s) {
        compose.innerHTML = '<p class="gt-note" style="margin-top:10px">Reading is open to everyone. To join the conversation, <strong>sign in or create a free account</strong> using the account bar at the top of the page, then come back to this day.</p>';
        return;
      }
      compose.innerHTML =
        '<div style="margin-top:10px"><textarea maxlength="600" placeholder="Share what this day spoke to you, ' + esc(displayName(s.user)) + '…"></textarea>' +
        '<button type="button" class="gt-post">Post to Day ' + day + '</button> <span class="gt-note gt-status"></span></div>';
      var ta = compose.querySelector('textarea');
      var status = compose.querySelector('.gt-status');
      compose.querySelector('.gt-post').addEventListener('click', function () {
        var body = ta.value.trim();
        if (!body) return;
        var low = body.toLowerCase();
        for (var i = 0; i < BLOCK.length; i++) {
          if (low.indexOf(BLOCK[i]) !== -1) {
            status.textContent = 'Links and promotions aren\u2019t posted here — please share in your own words.';
            return;
          }
        }
        status.textContent = 'Posting…';
        api('POST', 'gh_talk', { day: day, user_id: s.user.id, user_name: displayName(s.user), body: body }, true)
          .then(function () { ta.value = ''; status.textContent = ''; load(); })
          .catch(function () { status.textContent = 'Could not post — please try again in a moment.'; });
      });
    }
    el.querySelector('.gt-refresh').addEventListener('click', load);
    composeHtml();
    load();
  }

  window.GHTalk = { mount: mount };
})();
