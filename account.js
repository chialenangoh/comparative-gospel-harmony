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
    '#acctDialog{border:none;border-radius:14px;padding:0;max-width:24rem;width:calc(100% - 32px);box-shadow:0 18px 50px rgba(16,36,63,.35)}',
    '#acctDialog::backdrop{background:rgba(16,36,63,.55)}',
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
      span.textContent = '👤 Signed in as ' + user.email + ' — your streak and progress sync across devices.';
      var out = document.createElement('button');
      out.type = 'button'; out.className = 'acct-btn ghost'; out.textContent = 'Sign out';
      out.addEventListener('click', function () { sb.auth.signOut(); });
      bar.appendChild(span); bar.appendChild(out);
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
    var reader = document.querySelector('.reader-inner');
    if (reader) reader.insertBefore(bar, reader.firstElementChild);
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

  /* ---------- boot ---------- */
  function init() {
    if (!window.supabase || !window.supabase.createClient) return; // CDN unavailable: site unaffected
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    buildUI();
    sb.auth.getSession().then(function (res) {
      var session = res && res.data && res.data.session;
      if (session && session.user) {
        user = session.user;
        renderBar();
        pullMergePush().then(startSync);
      }
    });
    sb.auth.onAuthStateChange(function (event, session) {
      if (session && session.user) {
        var isNew = !user || user.id !== session.user.id;
        user = session.user;
        if (event === 'SIGNED_IN') justSignedIn = true;
        renderBar();
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
