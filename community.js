/* Community for the Gospel Harmony — a YouVersion-style friends feed.
   Readers create a small public profile (display name + username), follow
   other readers, and see a stream of what the people they follow bookmark
   and highlight, plus verses and reflections posted in the composer.
   Every card can receive an "Amen" and comments. Activity posting from
   bookmarks/highlights goes through gh-activity.js and respects the
   reader's sharing switch. All data lives in the community tables
   (profiles, follows, activities, amens, comments) guarded by row-level
   security: a reader only ever receives their own activity and the
   activity of people they follow. */
(function () {
  'use strict';

  var A = window.GHActivity;
  var root = document.getElementById('commRoot');
  if (!A || !root) return;

  var me = null;          // my auth user id
  var myProfile = null;   // my profiles row
  var profilesById = {};  // user_id -> profile (cache)
  var followingIds = [];  // user_ids I follow
  var feedItems = [];     // activities currently rendered
  var amenMine = {};      // activity_id -> true when I said Amen
  var amenCount = {};     // activity_id -> count
  var commentCount = {};  // activity_id -> count
  var openThreads = {};   // activity_id -> true when comments are open

  /* ------------------------------------------------ helpers */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function timeAgo(iso) {
    var t = Date.parse(iso || '');
    if (!t) return '';
    var s = Math.max(1, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60);
    if (m < 60) return m + (m === 1 ? ' min ago' : ' mins ago');
    var h = Math.floor(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    var d = Math.floor(h / 24);
    if (d < 30) return d + (d === 1 ? ' day ago' : ' days ago');
    return new Date(t).toLocaleDateString();
  }

  function initials(name) {
    var parts = String(name || '?').trim().split(/\s+/);
    var a = (parts[0] || '?').charAt(0);
    var b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (a + b).toUpperCase();
  }

  function profileOf(id) {
    return profilesById[id] || { display_name: 'A reader', username: '' };
  }

  function fetchProfiles(ids) {
    var missing = ids.filter(function (id) { return id && !profilesById[id]; });
    if (!missing.length) return Promise.resolve();
    return A.rest('GET', 'profiles?select=user_id,username,display_name&user_id=in.(' + missing.join(',') + ')')
      .then(function (rows) {
        (rows || []).forEach(function (p) { profilesById[p.user_id] = p; });
      })
      .catch(function () {});
  }

  /* ------------------------------------------------ states */

  function renderSignedOut() {
    root.innerHTML =
      '<div class="comm-card"><h3>Sign in to join the community</h3>' +
      '<p class="comm-note">The community is for signed-in readers: follow friends, see what they are bookmarking and highlighting in the Word, say Amen and encourage one another.</p>' +
      '<p class="comm-note">Use the account bar on this page to sign in or create your free account — then this page becomes your feed. Everything else in the Harmony keeps working without an account, as always.</p></div>';
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (A.session()) { clearInterval(iv); init(); }
      if (tries > 40) clearInterval(iv);
    }, 3000);
  }

  function renderProfileSetup() {
    root.innerHTML =
      '<div class="comm-card"><h3>Create your community profile</h3>' +
      '<p class="comm-note">This is how other readers will see you in the feed. Your email is never shown.</p>' +
      '<label class="comm-label" for="cpName">Your name</label>' +
      '<input class="comm-input" id="cpName" type="text" maxlength="60" placeholder="e.g. Mary Johnson" autocomplete="name">' +
      '<label class="comm-label" for="cpUser">Username</label>' +
      '<input class="comm-input" id="cpUser" type="text" maxlength="20" placeholder="e.g. mary_j" autocomplete="off">' +
      '<p class="comm-note">3–20 characters: small letters, numbers and underscores.</p>' +
      '<p class="comm-error" id="cpError" hidden></p>' +
      '<button type="button" class="comm-btn" id="cpSave">Join the community</button></div>';
    document.getElementById('cpSave').addEventListener('click', function () {
      var name = document.getElementById('cpName').value.trim();
      var user = document.getElementById('cpUser').value.trim().toLowerCase();
      var err = document.getElementById('cpError');
      function fail(msg) { err.textContent = msg; err.hidden = false; }
      if (name.length < 2) return fail('Please enter your name.');
      if (!/^[a-z0-9_]{3,20}$/.test(user)) return fail('Username needs 3–20 characters: small letters, numbers, underscores.');
      err.hidden = true;
      A.rest('POST', 'profiles', { user_id: me, username: user, display_name: name })
        .then(function () { return A.myProfile(true); })
        .then(function (p) {
          myProfile = p;
          if (p) profilesById[p.user_id] = p;
          renderMain();
        })
        .catch(function (e) {
          if (e && e.status === 409) fail('That username is taken — please choose another.');
          else fail('Something went wrong saving your profile. Please try again.');
        });
    });
  }

  /* ------------------------------------------------ main UI */

  function renderMain() {
    root.innerHTML =
      '<div class="comm-card comm-composer">' +
        '<div class="comm-me">' + avatarHtml(myProfile) +
          '<div><strong>' + esc(myProfile.display_name) + '</strong> <span class="comm-user">@' + esc(myProfile.username) + '</span></div>' +
          '<label class="comm-share"><input type="checkbox" id="shareToggle"' + (A.sharingOn() ? ' checked' : '') + '> Share my bookmarks &amp; highlights</label>' +
        '</div>' +
        '<label class="comm-label" for="compRef">Share a verse or a thought</label>' +
        '<input class="comm-input" id="compRef" type="text" maxlength="40" placeholder="Reference (optional) — e.g. John 3:16">' +
        '<textarea class="comm-input" id="compText" rows="3" maxlength="600" placeholder="What is the Lord showing you in the Word today?"></textarea>' +
        '<p class="comm-error" id="compError" hidden></p>' +
        '<button type="button" class="comm-btn gold" id="compPost">Post to my followers</button>' +
      '</div>' +
      '<div class="comm-card">' +
        '<h3>Find people to follow</h3>' +
        '<div class="comm-searchrow"><input class="comm-input" id="findQ" type="search" placeholder="Search by name or username…" maxlength="40">' +
        '<button type="button" class="comm-btn" id="findBtn">Search</button></div>' +
        '<div id="findResults"></div>' +
        '<div id="followingBox"></div>' +
      '</div>' +
      '<h2 class="comm-feedtitle">Your feed</h2>' +
      '<div id="feedBox"><p class="comm-note">Loading your feed…</p></div>';

    document.getElementById('shareToggle').addEventListener('change', function (e) {
      A.setSharing(!!e.target.checked);
    });
    document.getElementById('compPost').addEventListener('click', postComposer);
    document.getElementById('findBtn').addEventListener('click', runSearch);
    document.getElementById('findQ').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
    });
    renderFollowing();
    loadFeed();
  }

  function avatarHtml(p) {
    return '<span class="comm-avatar" aria-hidden="true">' + esc(initials(p && p.display_name)) + '</span>';
  }

  function postComposer() {
    var ref = document.getElementById('compRef').value.trim();
    var text = document.getElementById('compText').value.trim();
    var err = document.getElementById('compError');
    if (!text && !ref) { err.textContent = 'Write a thought, or at least a verse reference, first.'; err.hidden = false; return; }
    err.hidden = true;
    A.post('share', ref || null, { text: text }).then(function (ok) {
      if (!ok) { err.textContent = 'That did not post — check your connection and try again.'; err.hidden = false; return; }
      document.getElementById('compRef').value = '';
      document.getElementById('compText').value = '';
      loadFeed();
    });
  }

  /* ------------------------------------------------ people */

  function renderFollowing() {
    var box = document.getElementById('followingBox');
    if (!box) return;
    if (!followingIds.length) {
      box.innerHTML = '<p class="comm-note">You are not following anyone yet. Search above and follow a fellow reader — their bookmarks, highlights and posts will appear in your feed.</p>';
      return;
    }
    fetchProfiles(followingIds).then(function () {
      box.innerHTML = '<h4 class="comm-sub">Following (' + followingIds.length + ')</h4>' + followingIds.map(function (id) {
        var p = profileOf(id);
        return '<div class="comm-person">' + avatarHtml(p) +
          '<div class="comm-person-main"><strong>' + esc(p.display_name) + '</strong> <span class="comm-user">@' + esc(p.username) + '</span></div>' +
          '<button type="button" class="comm-btn ghost" data-unfollow="' + id + '">Unfollow</button></div>';
      }).join('');
      wireFollowButtons(box);
    });
  }

  function runSearch() {
    var q = document.getElementById('findQ').value.trim();
    var box = document.getElementById('findResults');
    if (q.length < 2) { box.innerHTML = '<p class="comm-note">Type at least 2 letters to search.</p>'; return; }
    box.innerHTML = '<p class="comm-note">Searching…</p>';
    var like = encodeURIComponent('%' + q + '%');
    Promise.all([
      A.rest('GET', 'profiles?select=user_id,username,display_name&username=ilike.' + like + '&limit=20').catch(function () { return []; }),
      A.rest('GET', 'profiles?select=user_id,username,display_name&display_name=ilike.' + like + '&limit=20').catch(function () { return []; })
    ]).then(function (res) {
      var seen = {}, rows = [];
      (res[0] || []).concat(res[1] || []).forEach(function (p) {
        if (p.user_id === me || seen[p.user_id]) return;
        seen[p.user_id] = 1;
        profilesById[p.user_id] = p;
        rows.push(p);
      });
      if (!rows.length) { box.innerHTML = '<p class="comm-note">No readers matched “' + esc(q) + '” yet. Invite a friend to create their account and profile, then search again.</p>'; return; }
      box.innerHTML = rows.map(function (p) {
        var on = followingIds.indexOf(p.user_id) !== -1;
        return '<div class="comm-person">' + avatarHtml(p) +
          '<div class="comm-person-main"><strong>' + esc(p.display_name) + '</strong> <span class="comm-user">@' + esc(p.username) + '</span></div>' +
          (on
            ? '<button type="button" class="comm-btn ghost" data-unfollow="' + p.user_id + '">Following ✓</button>'
            : '<button type="button" class="comm-btn" data-follow="' + p.user_id + '">Follow</button>') +
          '</div>';
      }).join('');
      wireFollowButtons(box);
    });
  }

  function wireFollowButtons(scope) {
    scope.querySelectorAll('[data-follow]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-follow');
        b.disabled = true;
        A.rest('POST', 'follows', { follower_id: me, followee_id: id }).then(function () {
          if (followingIds.indexOf(id) === -1) followingIds.push(id);
          renderFollowing();
          runSearchRefresh();
          loadFeed();
        }).catch(function () { b.disabled = false; });
      });
    });
    scope.querySelectorAll('[data-unfollow]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-unfollow');
        b.disabled = true;
        A.rest('DELETE', 'follows?follower_id=eq.' + me + '&followee_id=eq.' + id).then(function () {
          followingIds = followingIds.filter(function (x) { return x !== id; });
          renderFollowing();
          runSearchRefresh();
          loadFeed();
        }).catch(function () { b.disabled = false; });
      });
    });
  }

  function runSearchRefresh() {
    var q = document.getElementById('findQ');
    if (q && q.value.trim().length >= 2) runSearch();
  }

  /* ------------------------------------------------ feed */

  function activityText(it) {
    var p = it.payload || {};
    if (it.type === 'bookmark') {
      var n = p.event || (it.ref || '').replace('Event ', '');
      var label = 'Event ' + esc(n) + (p.title ? ' — ' + esc(p.title) : '');
      return 'bookmarked <a href="index.html#event-' + esc(n) + '">' + label + '</a>';
    }
    if (it.type === 'highlight') {
      return 'highlighted <span class="comm-quote">“' + esc(p.text || '') + '”</span>';
    }
    if (it.type === 'plan') {
      return 'completed <strong>Day ' + esc(p.day || '') + '</strong> of the ' + esc(p.plan || 'reading plan');
    }
    if (it.type === 'share') {
      var out = '';
      if (it.ref) out += '<strong class="comm-ref">' + esc(it.ref) + '</strong> ';
      if (p.text) out += esc(p.text);
      return out || 'shared a post';
    }
    return esc(p.text || it.type);
  }

  function loadFeed() {
    var box = document.getElementById('feedBox');
    if (!box) return;
    var filter = followingIds.length
      ? 'or=(user_id.eq.' + me + ',user_id.in.(' + followingIds.join(',') + '))'
      : 'user_id=eq.' + me;
    A.rest('GET', 'activities?select=id,user_id,type,ref,payload,created_at&' + filter + '&order=created_at.desc&limit=60')
      .then(function (rows) {
        feedItems = rows || [];
        var authorIds = feedItems.map(function (i) { return i.user_id; });
        var actIds = feedItems.map(function (i) { return i.id; });
        var jobs = [fetchProfiles(authorIds)];
        if (actIds.length) {
          jobs.push(A.rest('GET', 'amens?select=activity_id,user_id&activity_id=in.(' + actIds.join(',') + ')')
            .then(function (rs) {
              amenCount = {}; amenMine = {};
              (rs || []).forEach(function (r) {
                amenCount[r.activity_id] = (amenCount[r.activity_id] || 0) + 1;
                if (r.user_id === me) amenMine[r.activity_id] = true;
              });
            }).catch(function () {}));
          jobs.push(A.rest('GET', 'comments?select=activity_id&activity_id=in.(' + actIds.join(',') + ')')
            .then(function (rs) {
              commentCount = {};
              (rs || []).forEach(function (r) { commentCount[r.activity_id] = (commentCount[r.activity_id] || 0) + 1; });
            }).catch(function () {}));
        }
        return Promise.all(jobs);
      })
      .then(renderFeed)
      .catch(function () {
        box.innerHTML = '<p class="comm-note">Your feed could not be loaded just now. Please reload the page.</p>';
      });
  }

  function renderFeed() {
    var box = document.getElementById('feedBox');
    if (!box) return;
    if (!feedItems.length) {
      box.innerHTML = '<div class="comm-card"><p class="comm-note">Nothing here yet. Post a verse above, or bookmark an event in the Gospels reader — it will appear here and in your followers’ feeds.</p></div>';
      return;
    }
    box.innerHTML = feedItems.map(function (it) {
      var p = profileOf(it.user_id);
      var mine = it.user_id === me;
      return '<article class="comm-card comm-post" data-post="' + it.id + '">' +
        '<div class="comm-posthead">' + avatarHtml(p) +
          '<div class="comm-person-main"><strong>' + esc(p.display_name) + '</strong> <span class="comm-user">@' + esc(p.username) + '</span>' +
          '<div class="comm-time">' + esc(timeAgo(it.created_at)) + '</div></div>' +
          (mine ? '<button type="button" class="comm-del" data-del="' + it.id + '" aria-label="Delete this post">✕</button>' : '') +
        '</div>' +
        '<p class="comm-body">' + activityText(it) + '</p>' +
        '<div class="comm-actions">' +
          '<button type="button" class="comm-amen' + (amenMine[it.id] ? ' on' : '') + '" data-amen="' + it.id + '">🙏 Amen' + (amenCount[it.id] ? ' · ' + amenCount[it.id] : '') + '</button>' +
          '<button type="button" class="comm-cbtn" data-comments="' + it.id + '">💬 Comments' + (commentCount[it.id] ? ' · ' + commentCount[it.id] : '') + '</button>' +
        '</div>' +
        '<div class="comm-thread" id="thread-' + it.id + '" hidden></div>' +
      '</article>';
    }).join('');

    box.querySelectorAll('[data-amen]').forEach(function (b) {
      b.addEventListener('click', function () { toggleAmen(b.getAttribute('data-amen'), b); });
    });
    box.querySelectorAll('[data-comments]').forEach(function (b) {
      b.addEventListener('click', function () { toggleThread(b.getAttribute('data-comments')); });
    });
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-del');
        if (!window.confirm('Delete this post from your stream?')) return;
        A.rest('DELETE', 'activities?id=eq.' + id).then(function () {
          feedItems = feedItems.filter(function (x) { return x.id !== id; });
          renderFeed();
        }).catch(function () {});
      });
    });
    Object.keys(openThreads).forEach(function (id) {
      if (openThreads[id]) { openThreads[id] = false; toggleThread(id); }
    });
  }

  function toggleAmen(id, btn) {
    var on = !!amenMine[id];
    btn.disabled = true;
    var call = on
      ? A.rest('DELETE', 'amens?activity_id=eq.' + id + '&user_id=eq.' + me)
      : A.rest('POST', 'amens', { activity_id: id, user_id: me });
    call.then(function () {
      amenMine[id] = !on;
      amenCount[id] = Math.max(0, (amenCount[id] || 0) + (on ? -1 : 1));
      renderFeed();
    }).catch(function () { btn.disabled = false; });
  }

  function toggleThread(id) {
    var el = document.getElementById('thread-' + id);
    if (!el) return;
    if (!el.hidden) { el.hidden = true; openThreads[id] = false; return; }
    el.hidden = false;
    openThreads[id] = true;
    el.innerHTML = '<p class="comm-note">Loading comments…</p>';
    A.rest('GET', 'comments?select=id,user_id,body,created_at&activity_id=eq.' + id + '&order=created_at.asc')
      .then(function (rows) {
        return fetchProfiles((rows || []).map(function (r) { return r.user_id; })).then(function () { return rows || []; });
      })
      .then(function (rows) {
        var list = rows.map(function (c) {
          var p = profileOf(c.user_id);
          return '<div class="comm-comment">' + avatarHtml(p) +
            '<div><strong>' + esc(p.display_name) + '</strong> <span class="comm-time">' + esc(timeAgo(c.created_at)) + '</span>' +
            '<div>' + esc(c.body) + '</div></div></div>';
        }).join('');
        el.innerHTML = (list || '<p class="comm-note">No comments yet — be the first to encourage.</p>') +
          '<div class="comm-addcomment"><input class="comm-input" id="ci-' + id + '" type="text" maxlength="300" placeholder="Write an encouraging comment…">' +
          '<button type="button" class="comm-btn" data-send="' + id + '">Post</button></div>';
        var send = el.querySelector('[data-send]');
        send.addEventListener('click', function () {
          var input = document.getElementById('ci-' + id);
          var body = input.value.trim();
          if (!body) return;
          send.disabled = true;
          A.rest('POST', 'comments', { activity_id: id, user_id: me, body: body }).then(function () {
            commentCount[id] = (commentCount[id] || 0) + 1;
            openThreads[id] = true;
            renderFeed();
          }).catch(function () { send.disabled = false; });
        });
      })
      .catch(function () { el.innerHTML = '<p class="comm-note">Comments could not be loaded.</p>'; });
  }

  /* ------------------------------------------------ init */

  function init() {
    var s = A.session();
    if (!s) { renderSignedOut(); return; }
    me = s.user.id;
    A.myProfile(true).then(function (p) {
      myProfile = p;
      if (!p) { renderProfileSetup(); return; }
      profilesById[p.user_id] = p;
      return A.rest('GET', 'follows?select=followee_id&follower_id=eq.' + me)
        .then(function (rows) {
          followingIds = (rows || []).map(function (r) { return r.followee_id; });
          renderMain();
        })
        .catch(function () { renderMain(); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
