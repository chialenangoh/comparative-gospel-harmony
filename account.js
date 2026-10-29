/* Accounts for the Gospel Harmony — optional sign-up / sign-in so a
   reader's journey progress and day streak follow them across devices.
   Backend: Supabase Auth + one row per user in public.harmony_progress,
   protected by row-level security (a user can only ever touch their own
   row). The anon key below is Supabase's public client key — safe to
   expose precisely because RLS enforces ownership on the server.
   Everything on the site works without an account; local progress is
   merged into the account on first sign-in, never replaced by it. */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://jgbqghmclugnfklzahpu.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFnaG1jbHVnbmZrbHphaHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDM2MDIsImV4cCI6MjA5NTIxOTYwMn0.aFafq6oqVk_1KgflJubG26pDcjSx0ug1O6ARi322b9Q';
  var KEYS = { journey: 'gh-journey-v1', advent: 'gh-advent-v1' };
  var sb = null;
  var user = null;
  var lastHash = '';
  var syncTimer = null;
  var justSignedIn = false;

  var CSS = [
    '.acct-bar{margin:0 0 14px;padding:10px 14px;border:1px solid #b9c8d7;border-radius:10px;background:#fff;display:flex;gap:10px;align-items:center;flex-wrap:wrap;clear:both;font-size:.92rem;color:#33475e}',
    '.acct-bar .grow{flex:1 1 12rem}',
    '.acct-btn{padding:7px 13px;border-radius:8px;border:1px solid #10243f;background:#10243f;color:#fff;font-weight:700;font-size:.86rem;cursor:pointer}',
    '.acct-btn.gold{background:#d5aa57;border-color:#d5aa57;color:#10243f}',
    '.acct-btn.ghost{background:transparent;color:#10243f}',
    '.acct-avatar{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #d5aa57;flex:none;cursor:pointer}',
    '.acct-avatar-empty{background:#eef2f7;font-size:16px;padding:0;line-height:1}',
    '.acct-avwrap{position:relative;display:inline-flex;flex:none}',
    '.acct-avmenu{position:absolute;top:38px;left:0;z-index:60;background:#fff;border:1px solid rgba(16,36,63,.25);border-radius:10px;box-shadow:0 10px 30px rgba(16,36,63,.25);padding:6px;display:flex;flex-direction:column;gap:4px;min-width:160px}',
    '.acct-avmenu[hidden]{display:none}',
    '.acct-avmenu .acct-btn{text-align:left}',
    '#acctDialog,#resetDialog{border:none;border-radius:14px;padding:0;max-width:24rem;width:calc(100% - 32px);box-shadow:0 18px 50px rgba(16,36,63,.35)}',
    '#acctDialog::backdrop,#resetDialog::backdrop{background:rgba(16,36,63,.55)}',
    '.acct-form{padding:20px 20px 16px}',
    '.acct-form h3{margin:0 0 4px;font:700 1.2rem Georgia,serif;color:#10243f}',
    '.acct-form p.sub{margin:0 0 12px;font-size:.88rem;color:#4e5a6e}',
    '.acct-form label{display:block;font-size:.82rem;font-weight:700;color:#33475e;margin:10px 0 4px}',
    '.acct-form input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #b9c8d7;border-radius:8px;font-size:1rem}',
    '.acct-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}',
    '.acct-status{font-size:.87rem;margin-top:11px;min-height:1.2em;color:#33475e}',
    '.acct-status.err{color:#b03a2e}',
    '.acct-link{background:none;border:none;color:#10243f;text-decoration:underline;cursor:pointer;font-size:.86rem;padding:0}'
  ].join('\n');

  /* ---------- local progress ---------- */
  function readLocal() {
    var out = {};
    Object.keys(KEYS).forEach(function (k) {
      try { out[k] = JSON.parse(localStorage.getItem(KEYS[k]) || 'null'); } catch (e) { out[k] = null; }
    });
    return out;
  }
  function writeLocal(data) {
    Object.keys(KEYS).forEach(function (k) {
      if (data[k]) { try { localStorage.setItem(KEYS[k], JSON.stringify(data[k])); } catch (e) {} }
    });
  }
  function mergeObj(a, b) { var o = {}, k; for (k in (a || {})) o[k] = a[k]; for (k in (b || {})) o[k] = b[k]; return o; }
  function mergeProgress(local, cloud) {
    local = local || {}; cloud = cloud || {};
    var out = {};
    var lj = local.journey, cj = cloud.journey;
    if (lj || cj) {
      out.journey = {
        start: (lj && cj) ? (String(lj.start || '9999') < String(cj.start || '9999') ? lj.start : cj.start) : (lj ? lj.start : cj.start),
        done: mergeObj(cj && cj.done, lj && lj.done),
        days: mergeObj(cj && cj.days, lj && lj.days)
      };
    }
    var la = local.advent, ca = cloud.advent;
    if (la || ca) out.advent = { done: mergeObj(ca && ca.done, la && la.done) };
    return out;
  }
  function hash(data) { try { return JSON.stringify(data); } catch (e) { return ''; } }

  /* ---------- cloud sync ---------- */
  function pullMergePush() {
    if (!sb || !user) return Promise.resolve();
    return sb.from('harmony_progress').select('data').eq('user_id', user.id).maybeSingle()
      .then(function (res) {
        var cloud = (res && res.data && res.data.data) || {};
        var local = readLocal();
        var merged = mergeProgress(local, cloud);
        var changedLocal = hash(merged) !== hash(local);
        if (changedLocal) writeLocal(merged);
        lastHash = hash(merged);
        if (hash(merged) !== hash(cloud)) {
          return sb.from('harmony_progress').upsert({ user_id: user.id, data: merged, updated_at: new Date().toISOString() })
            .then(function () {}, function () {});
        }
        if (changedLocal && justSignedIn && (document.getElementById('journeyList') || document.getElementById('adventList'))) {
          justSignedIn = false;
          location.reload();
        }
      }, function () {});
  }
  function pushIfChanged() {
    if (!sb || !user) return;
    var local = readLocal();
    if (hash(local) === lastHash) return;
    lastHash = hash(local);
    sb.from('harmony_progress').upsert({ user_id: user.id, data: local, updated_at: new Date().toISOString() })
      .then(function () {}, function () {});
  }
  function startSync() {
    stopSync();
    syncTimer = setInterval(function () { pushIfChanged(); }, 5000);
    document.addEventListener('visibilitychange', onVis);
  }
  function stopSync() {
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
    document.removeEventListener('visibilitychange', onVis);
  }
  function onVis() { if (!document.hidden) pullMergePush(); }

  /* ---------- UI ---------- */
  function renderBar() {
    var bar = document.getElementById('acctBar');
    if (!bar) return;
    bar.innerHTML = '';
    var span = document.createElement('span');
    span.className = 'grow';
    if (user) {
      var avUrl = user.user_metadata && user.user_metadata.avatar_url;
      var wrap = document.createElement('span');
      wrap.className = 'acct-avwrap';
      var av = document.createElement('img');
      av.className = 'acct-avatar'; av.alt = 'Your profile photo — tap for photo options'; av.width = 30; av.height = 30;
      av.title = 'Profile photo — tap for options';
      if (avUrl) { av.src = avUrl; av.addEventListener('error', function () { av.style.display = 'none'; avBtn.style.display = ''; }); }
      else { av.style.display = 'none'; }
      var avBtn = document.createElement('button');
      avBtn.type = 'button'; avBtn.className = 'acct-avatar acct-avatar-empty'; avBtn.textContent = '👤';
      avBtn.title = 'Profile photo — tap for options';
      if (avUrl) avBtn.style.display = 'none';
      var menu = document.createElement('div');
      menu.className = 'acct-avmenu'; menu.hidden = true;
      var photo = document.createElement('button');
      photo.type = 'button'; photo.className = 'acct-btn ghost'; photo.textContent = avUrl ? '📷 Change photo' : '📷 Add photo';
      var file = document.createElement('input');
      file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
      file.addEventListener('change', function () { if (file.files && file.files[0]) { menu.hidden = true; uploadAvatar(file.files[0]); } });
      photo.addEventListener('click', function () { file.click(); });
      menu.appendChild(photo); menu.appendChild(file);
      if (avUrl) {
        var rm = document.createElement('button');
        rm.type = 'button'; rm.className = 'acct-btn ghost'; rm.textContent = 'Remove photo';
        rm.addEventListener('click', function () { menu.hidden = true; removeAvatar(); });
        menu.appendChild(rm);
      }
      function toggleMenu() { menu.hidden = !menu.hidden; }
      av.addEventListener('click', toggleMenu);
      avBtn.addEventListener('click', toggleMenu);
      document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) menu.hidden = true; });
      wrap.appendChild(av); wrap.appendChild(avBtn); wrap.appendChild(menu);
      span.textContent = 'Signed in as ' + user.email + ' — your streak and progress sync across devices.';
      bar.appendChild(wrap); bar.appendChild(span);
      var out = document.createElement('button');
      out.type = 'button'; out.className = 'acct-btn ghost'; out.textContent = 'Sign out';
      out.addEventListener('click', function () { sb.auth.signOut(); });
      bar.appendChild(out);
    } else {
      span.innerHTML = '👤 <strong>Save your streak.</strong> Create a free account and your journey progress follows you to any device. Optional — everything works without one.';
      var inB = document.createElement('button');
      inB.type = 'button'; inB.className = 'acct-btn'; inB.textContent = 'Sign in';
      inB.addEventListener('click', function () { openDialog(); });
      var upB = document.createElement('button');
      upB.type = 'button'; upB.className = 'acct-btn gold'; upB.textContent = 'Create account';
      upB.addEventListener('click', function () { openDialog(); });
      bar.appendChild(span); bar.appendChild(inB); bar.appendChild(upB);
    }
  }

  /* ---------- Profile photo ---------- */
  function uploadAvatar(fileObj) {
    if (!user || !sb) return;
    setStatus('Preparing your photo…');
    var url = URL.createObjectURL(fileObj);
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      var size = 256, c = document.createElement('canvas');
      c.width = size; c.height = size;
      var ctx = c.getContext('2d');
      var side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      c.toBlob(function (blob) {
        if (!blob) { setStatus('That photo could not be prepared — try another image.', true); return; }
        var path = user.id + '/avatar.jpg';
        sb.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
          .then(function (res) {
            if (res.error) throw res.error;
            var pub = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl + '?t=' + Date.now();
            return sb.auth.updateUser({ data: { avatar_url: pub } });
          })
          .then(function (res) {
            if (res && res.error) throw res.error;
            if (res && res.data && res.data.user) user = res.data.user;
            setStatus('Profile photo updated.');
            renderBar();
          })
          .catch(function () { setStatus('Photo upload failed — check your connection and try again.', true); });
      }, 'image/jpeg', 0.85);
    };
    img.onerror = function () { URL.revokeObjectURL(url); setStatus('That file is not an image — choose a photo.', true); };
    img.src = url;
  }
  function removeAvatar() {
    if (!user || !sb) return;
    sb.storage.from('avatars').remove([user.id + '/avatar.jpg'])
      .then(function () { return sb.auth.updateUser({ data: { avatar_url: null } }); })
      .then(function (res) {
        if (res && res.data && res.data.user) user = res.data.user;
        setStatus('Profile photo removed.');
        renderBar();
      })
      .catch(function () { setStatus('Could not remove the photo — try again.', true); });
  }

  function setStatus(msg, isErr) {
    var el = document.getElementById('acctStatus');
    if (el) { el.textContent = msg || ''; el.className = 'acct-status' + (isErr ? ' err' : ''); }
  }

  function openDialog() {
    var d = document.getElementById('acctDialog');
    if (d && d.showModal) { setStatus(''); d.showModal(); }
  }

  function buildUI() {
    var style = document.createElement('style');
    style.id = 'acctStyle';
    style.textContent = CSS;
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'acctBar';
    bar.className = 'acct-bar';
    var mount = document.getElementById('acctMount');
    var reader = document.querySelector('.reader-inner');
    if (mount) mount.appendChild(bar);
    else if (reader) reader.insertBefore(bar, reader.firstElementChild);
    else {
      var main = document.querySelector('main');
      if (main) main.insertBefore(bar, main.firstElementChild);
      else document.body.insertBefore(bar, document.body.firstChild);
    }

    var d = document.createElement('dialog');
    d.id = 'acctDialog';
    d.innerHTML =
      '<form class="acct-form" method="dialog">' +
      '<h3>Your Gospel Harmony account</h3>' +
      '<p class="sub">Free. Your password is stored securely by our sign-in provider — never on this site — and your progress is visible only to you.</p>' +
      '<label for="acctEmail">Email</label>' +
      '<input id="acctEmail" type="email" autocomplete="email" required>' +
      '<label for="acctPass">Password</label>' +
      '<input id="acctPass" type="password" autocomplete="current-password">' +
      '<div class="acct-row">' +
      '<button type="button" class="acct-btn" id="acctSignIn">Sign in</button>' +
      '<button type="button" class="acct-btn gold" id="acctSignUp">Create account</button>' +
      '<button type="button" class="acct-btn ghost" id="acctClose">Close</button>' +
      '</div>' +
      '<div class="acct-row">' +
      '<button type="button" class="acct-link" id="acctMagic">Email me a sign-in link instead</button>' +
      '<span aria-hidden="true">·</span>' +
      '<button type="button" class="acct-link" id="acctForgot">Forgot password?</button>' +
      '</div>' +
      '<div id="acctStatus" class="acct-status" role="status"></div>' +
      '</form>';
    document.body.appendChild(d);

    var rd = document.createElement('dialog');
    rd.id = 'resetDialog';
    rd.innerHTML =
      '<form class="acct-form" method="dialog">' +
      '<h3>Set a new password</h3>' +
      '<p class="sub">You followed a password-reset link. Choose a new password for your Gospel Harmony account.</p>' +
      '<label for="resetPass1">New password</label>' +
      '<input id="resetPass1" type="password" autocomplete="new-password">' +
      '<label for="resetPass2">Type it again</label>' +
      '<input id="resetPass2" type="password" autocomplete="new-password">' +
      '<div class="acct-row">' +
      '<button type="button" class="acct-btn gold" id="resetSave">Set new password</button>' +
      '<button type="button" class="acct-btn ghost" id="resetClose">Cancel</button>' +
      '</div>' +
      '<div id="resetStatus" class="acct-status" role="status"></div>' +
      '</form>';
    document.body.appendChild(rd);
    document.getElementById('resetClose').addEventListener('click', function () { rd.close(); });
    document.getElementById('resetSave').addEventListener('click', function () {
      var st = document.getElementById('resetStatus');
      var p1 = document.getElementById('resetPass1').value;
      var p2 = document.getElementById('resetPass2').value;
      var say = function (m, err) { if (st) { st.textContent = m; st.className = 'acct-status' + (err ? ' err' : ''); } };
      if (!p1 || p1.length < 6) { say('Password must be at least 6 characters.', true); return; }
      if (p1 !== p2) { say('The two passwords do not match.', true); return; }
      say('Saving…');
      sb.auth.updateUser({ password: p1 }).then(function (res) {
        if (res.error) { say(res.error.message, true); return; }
        say('Password updated — you are signed in.');
        try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
        setTimeout(function () { rd.close(); }, 900);
      });
    });

    var email = function () { return document.getElementById('acctEmail').value.trim(); };
    var pass = function () { return document.getElementById('acctPass').value; };
    var redirect = window.location.origin + window.location.pathname;

    document.getElementById('acctClose').addEventListener('click', function () { d.close(); });
    document.getElementById('acctSignIn').addEventListener('click', function () {
      if (!email() || !pass()) { setStatus('Enter your email and password.', true); return; }
      setStatus('Signing in…');
      sb.auth.signInWithPassword({ email: email(), password: pass() }).then(function (res) {
        if (res.error) setStatus(res.error.message, true);
        else { setStatus('Welcome back!'); setTimeout(function () { d.close(); }, 600); }
      });
    });
    document.getElementById('acctSignUp').addEventListener('click', function () {
      if (!email() || !pass()) { setStatus('Enter an email and choose a password.', true); return; }
      if (pass().length < 6) { setStatus('Password must be at least 6 characters.', true); return; }
      setStatus('Creating your account…');
      sb.auth.signUp({ email: email(), password: pass(), options: { emailRedirectTo: redirect } }).then(function (res) {
        if (res.error) setStatus(res.error.message, true);
        else if (res.data && res.data.session) { setStatus('Account created — you are signed in!'); setTimeout(function () { d.close(); }, 700); }
        else setStatus('Account created! Please check your email to confirm it, then sign in.');
      });
    });
    document.getElementById('acctMagic').addEventListener('click', function () {
      if (!email()) { setStatus('Enter your email first.', true); return; }
      setStatus('Sending your sign-in link…');
      sb.auth.signInWithOtp({ email: email(), options: { emailRedirectTo: redirect } }).then(function (res) {
        if (res.error) setStatus(res.error.message, true);
        else setStatus('Check your email — your sign-in link is on its way.');
      });
    });
    document.getElementById('acctForgot').addEventListener('click', function () {
      if (!email()) { setStatus('Enter your email first.', true); return; }
      sb.auth.resetPasswordForEmail(email(), { redirectTo: redirect }).then(function (res) {
        if (res.error) setStatus(res.error.message, true);
        else setStatus('Password reset email sent — check your inbox.');
      });
    });
    renderBar();
  }

  function openResetDialog() {
    var rd = document.getElementById('resetDialog');
    if (rd && rd.showModal && !rd.open) { try { rd.showModal(); } catch (e) {} }
  }

  /* ---------- boot ---------- */
  function init() {
    if (!window.supabase || !window.supabase.createClient) return; // CDN unavailable: site unaffected
    // The reader rewrites location.hash to the current event on load, which
    // would destroy an auth link's tokens before the client can read them.
    // The pages stash any auth fragment in <head> before that happens;
    // restore it now so sign-in / recovery links are honoured.
    try {
      var st = sessionStorage.getItem('gh-auth-hash');
      if (st) {
        sessionStorage.removeItem('gh-auth-hash');
        history.replaceState(null, '', window.location.pathname + window.location.search + st);
      }
    } catch (e) {}
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    buildUI();
    function refreshUser() {
      // The stored session's user is a snapshot from sign-in time: if the
      // profile photo (or any metadata) changed on another device since,
      // fetch the fresh user so this device shows it too.
      sb.auth.getUser().then(function (res) {
        var fresh = res && res.data && res.data.user;
        if (fresh && user && fresh.id === user.id) {
          var before = JSON.stringify(user.user_metadata || {});
          user = fresh;
          if (JSON.stringify(user.user_metadata || {}) !== before) renderBar();
        }
      }).catch(function () {});
    }
    sb.auth.getSession().then(function (res) {
      var session = res && res.data && res.data.session;
      if (session && session.user) {
        user = session.user;
        renderBar();
        refreshUser();
        pullMergePush().then(startSync);
      }
    });
    sb.auth.onAuthStateChange(function (event, session) {
      if (event === 'PASSWORD_RECOVERY') openResetDialog();
      if (session && session.user) {
        var isNew = !user || user.id !== session.user.id;
        user = session.user;
        if (event === 'SIGNED_IN') justSignedIn = true;
        renderBar();
        refreshUser();
        if (isNew) pullMergePush().then(startSync);
      } else {
        user = null;
        stopSync();
        renderBar();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
