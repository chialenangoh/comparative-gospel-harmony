/* Community activity plumbing for the Gospel Harmony (window.GHActivity).
   Talks to the community tables (profiles, follows, activities, amens,
   comments) in the same Supabase project the accounts already use, with the
   signed-in session the account bar stores on this device. Everything is
   best-effort and silent: signed-out readers, readers without a community
   profile, and readers who turned sharing off simply post nothing. */
(function () {
  'use strict';

  var SB_URL = 'https://jgbqghmclugnfklzahpu.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFnaG1jbHVnbmZrbHphaHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDM2MDIsImV4cCI6MjA5NTIxOTYwMn0.aFafq6oqVk_1KgflJubG26pDcjSx0ug1O6ARi322b9Q';
  var STORE_KEY = 'sb-jgbqghmclugnfklzahpu-auth-token';
  var SHARE_KEY = 'gh-community-share';

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

  function signal(ms) {
    var c = new AbortController();
    setTimeout(function () { try { c.abort(); } catch (e) {} }, ms);
    return c.signal;
  }

  function rest(method, path, body) {
    var s = session();
    if (!s) return Promise.reject(new Error('signed-out'));
    return fetch(SB_URL + '/rest/v1/' + path, {
      method: method,
      headers: {
        apikey: SB_ANON,
        Authorization: 'Bearer ' + s.token,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: signal(9000)
    }).then(function (res) {
      if (!res.ok) {
        var err = new Error('rest-' + res.status);
        err.status = res.status;
        throw err;
      }
      return method === 'GET' ? res.json() : null;
    });
  }

  var profileCache; // undefined = not loaded yet, null = no profile

  function myProfile(force) {
    var s = session();
    if (!s) return Promise.resolve(null);
    if (profileCache !== undefined && !force) return Promise.resolve(profileCache);
    return rest('GET', 'profiles?select=user_id,username,display_name,is_admin&user_id=eq.' + s.user.id)
      .then(function (rows) {
        profileCache = rows && rows[0] ? rows[0] : null;
        return profileCache;
      })
      .catch(function () { return null; });
  }

  function sharingOn() {
    try { return localStorage.getItem(SHARE_KEY) !== 'off'; } catch (e) { return true; }
  }

  function setSharing(on) {
    try { localStorage.setItem(SHARE_KEY, on ? 'on' : 'off'); } catch (e) {}
  }

  /* Post one activity to the reader's own stream. Resolves true when the
     activity was written; false (silently) in every other case. */
  function post(type, ref, payload) {
    var s = session();
    if (!s || !sharingOn()) return Promise.resolve(false);
    return myProfile().then(function (p) {
      if (!p) return false;
      return rest('POST', 'activities', {
        user_id: s.user.id,
        type: type,
        ref: ref || null,
        payload: payload || {}
      }).then(function () { return true; });
    }).catch(function () { return false; });
  }

  window.GHActivity = {
    session: session,
    rest: rest,
    myProfile: myProfile,
    sharingOn: sharingOn,
    setSharing: setSharing,
    post: post
  };
})();
