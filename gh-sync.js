/* Shared account sync for the Gospel Harmony (window.GHSync).
   Uses the signed-in session that the account bar already stores on this
   device and talks to the study_records table directly — no second auth
   client, every call time-boxed. Signed-out readers simply get nulls and
   keep working locally. Used by the Journey sync, Bookmarks and the Quiz. */
(function () {
  'use strict';

  var SB_URL = 'https://jgbqghmclugnfklzahpu.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFnaG1jbHVnbmZrbHphaHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NDM2MDIsImV4cCI6MjA5NTIxOTYwMn0.aFafq6oqVk_1KgflJubG26pDcjSx0ug1O6ARi322b9Q';
  var STORE_KEY = 'sb-jgbqghmclugnfklzahpu-auth-token';

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
      signal: signal(7000)
    }).then(function (res) {
      if (!res.ok) throw new Error('sync-' + res.status);
      return method === 'GET' ? res.json() : null;
    });
  }

  window.GHSync = {
    signedIn: function () { return !!session(); },
    user: function () { var s = session(); return s ? s.user : null; },
    load: function (key) {
      return rest('GET', 'study_records?select=record_key,kind,value,updated_at&record_key=eq.' + encodeURIComponent(key))
        .then(function (rows) { return rows && rows[0] ? rows[0] : null; });
    },
    save: function (key, kind, value) {
      var s = session();
      if (!s) return Promise.resolve(false);
      var rec = {
        user_id: s.user.id, record_key: key, kind: kind,
        value: value, updated_at: new Date().toISOString()
      };
      return rest('DELETE', 'study_records?user_id=eq.' + s.user.id + '&record_key=eq.' + encodeURIComponent(key))
        .then(function () { return rest('POST', 'study_records', rec); })
        .then(function () { return true; });
    }
  };
})();
