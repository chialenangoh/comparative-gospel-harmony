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
  var blockedIds = [];    // user_ids I have blocked (their content is hidden from me)
  var reportedActs = {};  // activity_id -> true when I reported it (hidden from my feed)
  var isAdmin = false;    // moderators see the moderation queue and hidden posts

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
      '<div id="modBox"></div>' +
      '<div id="blockedBox"></div>' +
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
    renderBlocked();
    if (isAdmin) renderModeration();
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
        var blocked = blockedIds.indexOf(p.user_id) !== -1;
        return '<div class="comm-person">' + avatarHtml(p) +
          '<div class="comm-person-main"><strong>' + esc(p.display_name) + '</strong> <span class="comm-user">@' + esc(p.username) + '</span></div>' +
          (on
            ? '<button type="button" class="comm-btn ghost" data-unfollow="' + p.user_id + '">Following ✓</button>'
            : '<button type="button" class="comm-btn" data-follow="' + p.user_id + '">Follow</button>') +
          (blocked
            ? '<button type="button" class="comm-btn ghost" data-unblock="' + p.user_id + '">Unblock</button>'
            : '<button type="button" class="comm-btn ghost" data-block="' + p.user_id + '">Block</button>') +
          '</div>';
      }).join('');
      wireFollowButtons(box);
      wireBlockButtons(box);
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

  /* ------------------------------------------------ safety: block / report / moderation */

  function wireBlockButtons(scope) {
    scope.querySelectorAll('[data-block]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-block');
        var p = profileOf(id);
        if (!window.confirm('Block ' + (p.display_name || 'this reader') + '? You will no longer see their posts or comments.')) return;
        b.disabled = true;
        A.rest('POST', 'blocks', { blocker_id: me, blocked_id: id }).then(function () {
          if (blockedIds.indexOf(id) === -1) blockedIds.push(id);
          followingIds = followingIds.filter(function (x) { return x !== id; });
          renderFollowing();
          renderBlocked();
          runSearchRefresh();
          loadFeed();
        }).catch(function () { b.disabled = false; });
      });
    });
    scope.querySelectorAll('[data-unblock]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-unblock');
        b.disabled = true;
        A.rest('DELETE', 'blocks?blocker_id=eq.' + me + '&blocked_id=eq.' + id).then(function () {
          blockedIds = blockedIds.filter(function (x) { return x !== id; });
          renderBlocked();
          runSearchRefresh();
          loadFeed();
        }).catch(function () { b.disabled = false; });
      });
    });
  }

  function renderBlocked() {
    var box = document.getElementById('blockedBox');
    if (!box) return;
    if (!blockedIds.length) { box.innerHTML = ''; return; }
    fetchProfiles(blockedIds).then(function () {
      box.innerHTML = '<div class="comm-card"><h3>Blocked readers</h3>' +
        '<p class="comm-note">You do not see posts or comments from readers you block.</p>' +
        blockedIds.map(function (id) {
          var p = profileOf(id);
          return '<div class="comm-person">' + avatarHtml(p) +
            '<div class="comm-person-main"><strong>' + esc(p.display_name) + '</strong> <span class="comm-user">@' + esc(p.username) + '</span></div>' +
            '<button type="button" class="comm-btn ghost" data-unblock="' + id + '">Unblock</button></div>';
        }).join('') + '</div>';
      wireBlockButtons(box);
    });
  }

  function reportActivity(id, btn) {
    if (!window.confirm('Report this post to the moderators? It will be hidden from your feed while it is reviewed.')) return;
    btn.disabled = true;
    A.rest('POST', 'reports', { reporter_id: me, activity_id: id, reason: 'Reported from the community feed' })
      .then(function () {
        reportedActs[id] = true;
        feedItems = feedItems.filter(function (x) { return x.id !== id; });
        renderFeed();
      })
      .catch(function () { btn.disabled = false; });
  }

  function renderModeration() {
    var box = document.getElementById('modBox');
    if (!box) return;
    A.rest('GET', 'reports?select=id,reporter_id,activity_id,comment_id,reason,created_at&status=eq.open&order=created_at.desc&limit=50')
      .then(function (rows) {
        rows = rows || [];
        if (!rows.length) {
          box.innerHTML = '<div class="comm-card"><h3>🛡 Moderation</h3><p class="comm-note">No open reports. Thank you for keeping this community safe.</p></div>';
          return;
        }
        var jobs = rows.map(function (r) {
          if (r.activity_id) {
            return A.rest('GET', 'activities?select=id,user_id,type,ref,payload&id=eq.' + r.activity_id)
              .then(function (a) { r._content = a && a[0] ? activityText(a[0]) : '(post no longer visible)'; r._author = a && a[0] ? a[0].user_id : null; })
              .catch(function () { r._content = '(post no longer visible)'; });
          }
          return A.rest('GET', 'comments?select=id,user_id,body&id=eq.' + r.comment_id)
            .then(function (c) { r._content = c && c[0] ? esc(c[0].body) : '(comment no longer visible)'; r._author = c && c[0] ? c[0].user_id : null; })
            .catch(function () { r._content = '(comment no longer visible)'; });
        });
        return Promise.all(jobs).then(function () {
          return fetchProfiles(rows.map(function (r) { return r._author; }).concat(rows.map(function (r) { return r.reporter_id; })));
        }).then(function () {
          box.innerHTML = '<div class="comm-card"><h3>🛡 Moderation — open reports (' + rows.length + ')</h3>' +
            rows.map(function (r) {
              var author = r._author ? profileOf(r._author) : null;
              var reporter = profileOf(r.reporter_id);
              return '<div class="comm-person"><div class="comm-person-main">' +
                '<strong>' + (author ? esc(author.display_name) + ' <span class="comm-user">@' + esc(author.username) + '</span>' : 'Unknown author') + '</strong>' +
                '<div class="comm-body">' + (r._content || '') + '</div>' +
                '<div class="comm-time">Reported by ' + esc(reporter.display_name) + ' · ' + esc(timeAgo(r.created_at)) + (r.reason ? ' · ' + esc(r.reason) : '') + '</div></div>' +
                '<button type="button" class="comm-btn" data-modremove="' + r.id + '">Remove content</button>' +
                '<button type="button" class="comm-btn ghost" data-moddismiss="' + r.id + '">Dismiss</button></div>';
            }).join('') + '</div>';
          box.querySelectorAll('[data-modremove]').forEach(function (b) {
            b.addEventListener('click', function () {
              var r = rows.filter(function (x) { return x.id === b.getAttribute('data-modremove'); })[0];
              if (!r) return;
              b.disabled = true;
              var hide = r.activity_id
                ? A.rest('PATCH', 'activities?id=eq.' + r.activity_id, { hidden: true })
                : A.rest('PATCH', 'comments?id=eq.' + r.comment_id, { hidden: true });
              hide.then(function () {
                return A.rest('PATCH', 'reports?id=eq.' + r.id, { status: 'actioned' });
              }).then(function () { renderModeration(); loadFeed(); })
                .catch(function () { b.disabled = false; });
            });
          });
          box.querySelectorAll('[data-moddismiss]').forEach(function (b) {
            b.addEventListener('click', function () {
              var rid = b.getAttribute('data-moddismiss');
              b.disabled = true;
              A.rest('PATCH', 'reports?id=eq.' + rid, { status: 'dismissed' })
                .then(function () { renderModeration(); })
                .catch(function () { b.disabled = false; });
            });
          });
        });
      })
      .catch(function () { box.innerHTML = ''; });
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
    A.rest('GET', 'activities?select=id,user_id,type,ref,payload,created_at,hidden&' + filter + '&order=created_at.desc&limit=60')
      .then(function (rows) {
        feedItems = (rows || []).filter(function (it) {
          if (blockedIds.indexOf(it.user_id) !== -1) return false;
          if (reportedActs[it.id]) return false;
          if (it.hidden && !isAdmin) return false;
          return true;
        });
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
        (it.hidden ? '<p class="comm-modtag">Hidden by moderation — only moderators see this post.</p>' : '') +
        '<div class="comm-actions">' +
          '<button type="button" class="comm-amen' + (amenMine[it.id] ? ' on' : '') + '" data-amen="' + it.id + '">🙏 Amen' + (amenCount[it.id] ? ' · ' + amenCount[it.id] : '') + '</button>' +
          '<button type="button" class="comm-cbtn" data-comments="' + it.id + '">💬 Comments' + (commentCount[it.id] ? ' · ' + commentCount[it.id] : '') + '</button>' +
          (mine ? '' :
            '<button type="button" class="comm-cbtn" data-report="' + it.id + '">🚩 Report</button>' +
            '<button type="button" class="comm-cbtn" data-block="' + it.user_id + '">Block</button>') +
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
    box.querySelectorAll('[data-report]').forEach(function (b) {
      b.addEventListener('click', function () { reportActivity(b.getAttribute('data-report'), b); });
    });
    wireBlockButtons(box);
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
    A.rest('GET', 'comments?select=id,user_id,body,created_at,hidden&activity_id=eq.' + id + '&order=created_at.asc')
      .then(function (rows) {
        rows = (rows || []).filter(function (c) {
          if (blockedIds.indexOf(c.user_id) !== -1) return false;
          if (c.hidden && !isAdmin) return false;
          return true;
        });
        return fetchProfiles(rows.map(function (r) { return r.user_id; })).then(function () { return rows; });
      })
      .then(function (rows) {
        var list = rows.map(function (c) {
          var p = profileOf(c.user_id);
          return '<div class="comm-comment">' + avatarHtml(p) +
            '<div><strong>' + esc(p.display_name) + '</strong> <span class="comm-time">' + esc(timeAgo(c.created_at)) + '</span>' +
            (c.hidden ? ' <span class="comm-modtag">Hidden by moderation</span>' : '') +
            '<div>' + esc(c.body) + '</div>' +
            (c.user_id === me ? '' : '<button type="button" class="comm-reportlink" data-creport="' + c.id + '">Report</button>') +
            '</div></div>';
        }).join('');
        el.innerHTML = (list || '<p class="comm-note">No comments yet — be the first to encourage.</p>') +
          '<div class="comm-addcomment"><input class="comm-input" id="ci-' + id + '" type="text" maxlength="300" placeholder="Write an encouraging comment…">' +
          '<button type="button" class="comm-btn" data-send="' + id + '">Post</button></div>';
        el.querySelectorAll('[data-creport]').forEach(function (b) {
          b.addEventListener('click', function () {
            if (!window.confirm('Report this comment to the moderators? It will be hidden from your view while it is reviewed.')) return;
            var cid = b.getAttribute('data-creport');
            b.disabled = true;
            A.rest('POST', 'reports', { reporter_id: me, comment_id: cid, reason: 'Reported from the community comments' })
              .then(function () {
                var row = b.closest('.comm-comment');
                if (row) row.style.display = 'none';
              })
              .catch(function () { b.disabled = false; });
          });
        });
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
      isAdmin = !!p.is_admin;
      var jobs = [
        A.rest('GET', 'follows?select=followee_id&follower_id=eq.' + me)
          .then(function (rows) { followingIds = (rows || []).map(function (r) { return r.followee_id; }); })
          .catch(function () {}),
        A.rest('GET', 'blocks?select=blocked_id&blocker_id=eq.' + me)
          .then(function (rows) { blockedIds = (rows || []).map(function (r) { return r.blocked_id; }); })
          .catch(function () {}),
        A.rest('GET', 'reports?select=activity_id&reporter_id=eq.' + me + '&activity_id=not.is.null')
          .then(function (rows) { (rows || []).forEach(function (r) { reportedActs[r.activity_id] = true; }); })
          .catch(function () {})
      ];
      return Promise.all(jobs).then(renderMain).catch(renderMain);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
