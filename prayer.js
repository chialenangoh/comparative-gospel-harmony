/* My Prayer List for the Gospel Harmony — YouVersion-style prayer cards.
   Keep the things you are praying about in one place, and celebrate when
   the Lord answers. Prayers live on this device (localStorage) and, for
   signed-in readers, sync through the account (study_records, kind
   "prayers") the same way bookmarks do. Marking a prayer answered also
   posts a small celebration to the reader's community stream when they
   have a community profile and sharing is on — the prayer itself stays
   private; only the answered title is shared. */
(function () {
  'use strict';

  var KEY = 'gh-prayers-v1';
  var root = document.getElementById('prayerRoot');
  if (!root) return;

  function loadLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.items) return p; }
    } catch (e) {}
    return { items: {} };
  }

  function saveLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = loadLocal();
  var pushTimer = null;

  function cloudPush() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      try { GHSync.save('prayers:list', 'prayers', state).catch(function () {}); } catch (e) {}
    }, 700);
  }

  function cloudPull() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    GHSync.load('prayers:list').then(function (rec) {
      if (!rec || !rec.value || !rec.value.items) { cloudPush(); return; }
      var cloud = rec.value.items, changed = false;
      Object.keys(cloud).forEach(function (k) {
        var c = cloud[k], l = state.items[k];
        if (!l || (c.t || 0) > (l.t || 0)) { state.items[k] = c; changed = true; }
      });
      Object.keys(state.items).forEach(function (k) {
        if (state.items[k].gone && (Date.now() - (state.items[k].t || 0)) > 90 * 86400000) {
          delete state.items[k]; changed = true;
        }
      });
      if (changed) { saveLocal(); render(); }
      cloudPush();
    }).catch(function () {});
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function newId() {
    return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  function fmtDate(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function visible() {
    return Object.keys(state.items)
      .map(function (k) { var it = state.items[k]; it.id = k; return it; })
      .filter(function (it) { return !it.gone; });
  }

  function render() {
    var items = visible();
    var active = items.filter(function (i) { return !i.answered; })
      .sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
    var answered = items.filter(function (i) { return i.answered; })
      .sort(function (a, b) { return (b.answered || 0) - (a.answered || 0); });

    function card(it) {
      return '<div class="pr-card' + (it.answered ? ' answered' : '') + '">' +
        '<div class="pr-main">' +
          '<strong>' + esc(it.title) + '</strong>' +
          (it.person ? '<div class="pr-person">Praying for: ' + esc(it.person) + '</div>' : '') +
          (it.details ? '<p class="pr-details">' + esc(it.details) + '</p>' : '') +
          '<div class="pr-meta">' + (it.answered
            ? '🙌 Answered on ' + esc(fmtDate(it.answered)) + ' · praying since ' + esc(fmtDate(it.created))
            : 'Praying since ' + esc(fmtDate(it.created))) + '</div>' +
        '</div>' +
        '<div class="pr-actions">' +
          (it.answered
            ? '<button type="button" class="pr-btn ghost" data-restore="' + it.id + '">Still praying</button>'
            : '<button type="button" class="pr-btn gold" data-answer="' + it.id + '">🙌 Answered</button>') +
          '<button type="button" class="pr-btn ghost" data-del="' + it.id + '">Delete</button>' +
        '</div></div>';
    }

    root.innerHTML =
      '<div class="pr-card pr-add">' +
        '<h3>Add a prayer</h3>' +
        '<label class="pr-label" for="prTitle">What are you praying about?</label>' +
        '<input class="pr-input" id="prTitle" type="text" maxlength="120" placeholder="e.g. Healing for my mother">' +
        '<label class="pr-label" for="prPerson">Praying for (optional)</label>' +
        '<input class="pr-input" id="prPerson" type="text" maxlength="60" placeholder="e.g. Mum, my family, my church">' +
        '<label class="pr-label" for="prDetails">Details (optional)</label>' +
        '<textarea class="pr-input" id="prDetails" rows="3" maxlength="600" placeholder="Anything you want to remember as you pray…"></textarea>' +
        '<p class="pr-error" id="prError" hidden></p>' +
        '<button type="button" class="pr-btn" id="prAdd">Add to my prayer list</button>' +
        '<p class="pr-note">' + (window.GHSync && GHSync.signedIn()
          ? 'Your prayers sync privately to your account — only you can see them.'
          : 'Your prayers are kept privately on this device. Sign in (account bar, home page) to carry them across devices.') + '</p>' +
      '</div>' +
      '<h2 class="pr-h">I am praying for… (' + active.length + ')</h2>' +
      (active.length ? active.map(card).join('') : '<p class="pr-note">Nothing here yet. Add the first prayer above — “The effectual fervent prayer of a righteous man availeth much.” (James 5:16)</p>') +
      (answered.length
        ? '<h2 class="pr-h">🙌 Answered prayers (' + answered.length + ')</h2>' + answered.map(card).join('')
        : '');

    document.getElementById('prAdd').addEventListener('click', function () {
      var title = document.getElementById('prTitle').value.trim();
      var err = document.getElementById('prError');
      if (!title) { err.textContent = 'Give the prayer a short title first.'; err.hidden = false; return; }
      var id = newId();
      state.items[id] = {
        title: title,
        person: document.getElementById('prPerson').value.trim(),
        details: document.getElementById('prDetails').value.trim(),
        created: Date.now(),
        answered: null,
        t: Date.now()
      };
      saveLocal();
      cloudPush();
      render();
    });

    root.querySelectorAll('[data-answer]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = state.items[b.getAttribute('data-answer')];
        if (!it) return;
        it.answered = Date.now();
        it.t = Date.now();
        saveLocal();
        cloudPush();
        if (window.GHActivity) GHActivity.post('prayer', null, { text: '🙌 The Lord answered a prayer: “' + String(it.title || '').slice(0, 120) + '”' });
        render();
      });
    });
    root.querySelectorAll('[data-restore]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = state.items[b.getAttribute('data-restore')];
        if (!it) return;
        it.answered = null;
        it.t = Date.now();
        saveLocal();
        cloudPush();
        render();
      });
    });
    root.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = state.items[b.getAttribute('data-del')];
        if (!it) return;
        if (!window.confirm('Remove “' + it.title + '” from your prayer list?')) return;
        it.gone = 1;
        it.t = Date.now();
        saveLocal();
        cloudPush();
        render();
      });
    });
  }

  render();
  cloudPull();
})();
