/* My Notes for the Gospel Harmony — private verse notes, YouVersion-style.
   Attach a note to any Scripture reference and keep them all in one
   notebook. Notes live on this device (localStorage) and, for signed-in
   readers, sync privately through the account (study_records, kind
   "notes") the same way bookmarks and prayers do. Notes are never posted
   to the community feed. Open notes.html?ref=John+3:16 to start a note
   with the reference already filled in. */
(function () {
  'use strict';

  var KEY = 'gh-notes-v1';
  var root = document.getElementById('notesRoot');
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
  var filterText = '';

  function cloudPush() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      try { GHSync.save('notes:list', 'notes', state).catch(function () {}); } catch (e) {}
    }, 700);
  }

  function cloudPull() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    GHSync.load('notes:list').then(function (rec) {
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
    return 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  function fmtDate(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function visible() {
    var items = Object.keys(state.items)
      .map(function (k) { var it = state.items[k]; it.id = k; return it; })
      .filter(function (it) { return !it.gone; });
    if (filterText) {
      var f = filterText.toLowerCase();
      items = items.filter(function (it) {
        return (it.ref || '').toLowerCase().indexOf(f) !== -1 ||
               (it.text || '').toLowerCase().indexOf(f) !== -1;
      });
    }
    return items.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  }

  function render() {
    var items = visible();
    var total = Object.keys(state.items).filter(function (k) { return !state.items[k].gone; }).length;
    var prefill = '';
    try {
      var q = new URLSearchParams(location.search).get('ref');
      if (q) prefill = q;
    } catch (e) {}

    function card(it) {
      return '<div class="nt-card">' +
        '<div class="nt-ref">' + esc(it.ref || 'Note') + '</div>' +
        '<p class="nt-text" id="txt-' + it.id + '">' + esc(it.text) + '</p>' +
        '<div class="nt-meta">' + esc(fmtDate(it.created)) +
          (it.t && it.created && it.t > it.created + 60000 ? ' · edited ' + esc(fmtDate(it.t)) : '') + '</div>' +
        '<div class="nt-actions">' +
          '<button type="button" class="nt-btn ghost" data-edit="' + it.id + '">Edit</button>' +
          '<button type="button" class="nt-btn ghost" data-del="' + it.id + '">Delete</button>' +
        '</div></div>';
    }

    root.innerHTML =
      '<div class="nt-card nt-add">' +
        '<h3>Write a note</h3>' +
        '<label class="nt-label" for="ntRef">Scripture reference</label>' +
        '<input class="nt-input" id="ntRef" type="text" maxlength="60" placeholder="e.g. John 3:16, or Event 42 — The Good Samaritan" value="' + esc(prefill) + '">' +
        '<label class="nt-label" for="ntText">Your note</label>' +
        '<textarea class="nt-input" id="ntText" rows="4" maxlength="2000" placeholder="What does this passage teach? What is the Lord saying to you?"></textarea>' +
        '<p class="nt-error" id="ntError" hidden></p>' +
        '<button type="button" class="nt-btn" id="ntAdd">Save note</button>' +
        '<p class="nt-note">' + (window.GHSync && GHSync.signedIn()
          ? 'Your notes sync privately to your account — only you can see them.'
          : 'Your notes are kept privately on this device. Sign in (account bar, home page) to carry them across devices.') + '</p>' +
      '</div>' +
      (total > 3
        ? '<div class="nt-searchrow"><input class="nt-input" id="ntFilter" type="search" placeholder="Search your notes…" value="' + esc(filterText) + '"></div>'
        : '') +
      '<h2 class="nt-h">My notes (' + total + ')' + (filterText ? ' — showing ' + items.length : '') + '</h2>' +
      (items.length ? items.map(card).join('')
        : '<p class="nt-note">' + (filterText
            ? 'No notes match your search.'
            : 'No notes yet. When a passage speaks to you, write down what you see — “Thy word have I hid in mine heart.” (Psalm 119:11)') + '</p>');

    document.getElementById('ntAdd').addEventListener('click', function () {
      var ref = document.getElementById('ntRef').value.trim();
      var text = document.getElementById('ntText').value.trim();
      var err = document.getElementById('ntError');
      if (!text) { err.textContent = 'Write the note first.'; err.hidden = false; return; }
      var id = newId();
      state.items[id] = { ref: ref, text: text, created: Date.now(), t: Date.now() };
      saveLocal();
      cloudPush();
      render();
    });

    var filter = document.getElementById('ntFilter');
    if (filter) {
      filter.addEventListener('input', function () {
        filterText = filter.value;
        render();
        var f2 = document.getElementById('ntFilter');
        if (f2) { f2.focus(); f2.setSelectionRange(f2.value.length, f2.value.length); }
      });
    }

    root.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-edit');
        var it = state.items[id];
        var p = document.getElementById('txt-' + id);
        if (!it || !p) return;
        var ta = document.createElement('textarea');
        ta.className = 'nt-input';
        ta.rows = 4;
        ta.maxLength = 2000;
        ta.value = it.text;
        p.replaceWith(ta);
        ta.focus();
        b.textContent = 'Save';
        b.setAttribute('data-save', id);
        b.removeAttribute('data-edit');
        b.addEventListener('click', function () {
          var v = ta.value.trim();
          if (v) { it.text = v; it.t = Date.now(); saveLocal(); cloudPush(); }
          render();
        }, { once: true });
      });
    });
    root.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var it = state.items[b.getAttribute('data-del')];
        if (!it) return;
        if (!window.confirm('Delete this note?')) return;
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
