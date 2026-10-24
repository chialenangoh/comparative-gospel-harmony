/* My Library for the Gospel Harmony reader: a tools row (bookmarks, quiz,
   films, journey, listen, advent), per-event bookmarks with a list modal,
   and account sync of the bookmarks through gh-sync.js (study_records,
   kind "bookmarks"). Signed-out readers keep bookmarks on this device. */
(function () {
  'use strict';

  var KEY = 'gh-bookmarks-v1';

  var CSS = [
    '.lib-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px;clear:both}',
    '.lib-tools a,.lib-tools button{display:inline-block;padding:7px 12px;border-radius:999px;border:1px solid #b9c8d7;background:#fff;color:#10243f;font-weight:700;font-size:.85rem;text-decoration:none;cursor:pointer}',
    '.lib-tools a:hover,.lib-tools button:hover{background:#eef2f7}',
    '.lib-bookmark-btn{margin:0 0 14px;padding:9px 16px;border-radius:9px;border:1px solid #d5aa57;background:#fdf6dd;color:#4e3f10;font-weight:700;font-size:.92rem;cursor:pointer;clear:both;display:inline-block}',
    '.lib-bookmark-btn.on{background:#d5aa57;color:#10243f}',
    '.lib-modal{position:fixed;inset:0;background:rgba(6,14,26,.82);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:22px 14px;overflow:auto}',
    '.lib-modal-box{background:#fff;border-radius:12px;padding:18px;max-width:520px;width:100%}',
    '.lib-modal-box h3{font:700 1.2rem Georgia,serif;color:#10243f;margin:0 0 6px}',
    '.lib-row{display:flex;gap:10px;align-items:center;border-bottom:1px solid #e4eaf1;padding:10px 2px}',
    '.lib-row a{flex:1;color:#10243f;font-weight:600;text-decoration:none;line-height:1.35}',
    '.lib-row a small{display:block;color:#7a5c14;font-weight:700}',
    '.lib-row button{border:1px solid #b9c8d7;background:#fff;border-radius:8px;padding:5px 10px;cursor:pointer;font-weight:700;color:#8a2f24}',
    '.lib-close{margin-top:14px;padding:9px 16px;border-radius:9px;border:1px solid #10243f;background:#10243f;color:#fff;font-weight:700;cursor:pointer}',
    '.lib-note{font-size:.88rem;color:#5a6b7d;line-height:1.5}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('libStyle')) return;
    var s = document.createElement('style');
    s.id = 'libStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.items) return p; }
    } catch (e) {}
    return { items: {} };
  }

  function saveLocal(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
  }

  var state = loadLocal();
  var pushTimer = null;

  function cloudPush() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () {
      try { GHSync.save('bookmarks:list', 'bookmarks', state).catch(function () {}); } catch (e) {}
    }, 700);
  }

  function activeCount() {
    return Object.keys(state.items).filter(function (k) { return state.items[k].on; }).length;
  }

  function currentEventNumber() {
    var el = document.getElementById('eventNumber');
    if (!el) return null;
    var m = /Event\s+(\S+)\s+of/i.exec(el.textContent || '');
    return m ? m[1] : null;
  }

  function eventTitle() {
    var el = document.getElementById('eventTitle') || document.getElementById('chapterTitle');
    return el ? (el.textContent || '').trim() : '';
  }

  function renderTools() {
    var root = document.querySelector('.reader-inner');
    if (!root || document.getElementById('libTools')) return;
    var row = document.createElement('div');
    row.id = 'libTools';
    row.className = 'lib-tools';
    row.innerHTML =
      '<button type="button" id="libOpen">🔖 Bookmarks (<span id="libCount">' + activeCount() + '</span>)</button>' +
      '<a href="quiz.html">🧠 Life of Christ Quiz</a>' +
      '<a href="films.html">🎬 Films</a>' +
      '<a href="journey.html">🕊 30-Day Journey</a>' +
      '<a href="listen.html">🎧 Listen</a>' +
      '<a href="advent.html">🕯 Advent</a>';
    var votd = document.getElementById('votdCard');
    if (votd && votd.parentNode === root) root.insertBefore(row, votd.nextSibling);
    else root.insertBefore(row, root.firstChild);
    row.querySelector('#libOpen').addEventListener('click', openModal);
  }

  function refreshCount() {
    var c = document.getElementById('libCount');
    if (c) c.textContent = activeCount();
  }

  function renderBookmarkBtn() {
    var num = currentEventNumber();
    var old = document.getElementById('libBookmarkBtn');
    if (!num) { if (old) old.remove(); return; }
    var anchor = document.getElementById('shareBar') ||
      document.getElementById('verseCardBar') ||
      document.getElementById('watchBanner') ||
      document.getElementById('eventSummary');
    if (!anchor || !anchor.parentNode) return;
    var btn = old || document.createElement('button');
    btn.id = 'libBookmarkBtn';
    btn.type = 'button';
    var on = !!(state.items[num] && state.items[num].on);
    btn.className = 'lib-bookmark-btn' + (on ? ' on' : '');
    btn.textContent = on ? '🔖 Bookmarked — tap to remove' : '🔖 Bookmark this event';
    if (!old) {
      btn.addEventListener('click', function () {
        var n = currentEventNumber();
        if (!n) return;
        var it = state.items[n] || { t: 0, on: 0, title: '' };
        it.on = it.on ? 0 : 1;
        it.t = Date.now();
        if (it.on) it.title = eventTitle();
        state.items[n] = it;
        saveLocal(state);
        cloudPush();
        renderBookmarkBtn();
        refreshCount();
      });
      anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    } else if (btn.previousSibling !== anchor) {
      anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    }
  }

  function openModal() {
    var old = document.getElementById('libModal');
    if (old) old.remove();
    var modal = document.createElement('div');
    modal.id = 'libModal';
    modal.className = 'lib-modal';
    var nums = Object.keys(state.items).filter(function (k) { return state.items[k].on; });
    nums.sort(function (a, b) {
      var na = parseFloat(a), nb = parseFloat(b);
      return na - nb || String(a).localeCompare(String(b));
    });
    var rows = nums.map(function (n) {
      var it = state.items[n];
      return '<div class="lib-row"><a href="#event-' + n + '" data-goto="' + n + '"><small>Event ' + n + '</small>' +
        (it.title ? escapeHtml(it.title) : 'Event ' + n) + '</a>' +
        '<button type="button" data-remove="' + n + '">Remove</button></div>';
    }).join('');
    modal.innerHTML = '<div class="lib-modal-box"><h3>🔖 My Bookmarks</h3>' +
      (rows || '<p class="lib-note">No bookmarks yet. Open any event and tap “Bookmark this event” — it will wait for you here' +
        (window.GHSync && GHSync.signedIn() ? ', on every device where you sign in.' : ' on this device. Sign in to carry them across devices.') + '</p>') +
      '<button type="button" class="lib-close">Close</button></div>';
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
    modal.querySelector('.lib-close').addEventListener('click', function () { modal.remove(); });
    modal.querySelectorAll('[data-remove]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = b.getAttribute('data-remove');
        if (state.items[n]) { state.items[n].on = 0; state.items[n].t = Date.now(); }
        saveLocal(state);
        cloudPush();
        refreshCount();
        renderBookmarkBtn();
        openModal();
      });
    });
    modal.querySelectorAll('[data-goto]').forEach(function (a) {
      a.addEventListener('click', function () { modal.remove(); });
    });
    document.body.appendChild(modal);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cloudPull() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    GHSync.load('bookmarks:list').then(function (rec) {
      if (!rec || !rec.value || !rec.value.items) { cloudPush(); return; }
      var cloud = rec.value.items, changed = false;
      Object.keys(cloud).forEach(function (k) {
        var c = cloud[k], l = state.items[k];
        if (!l || (c.t || 0) > (l.t || 0)) { state.items[k] = c; changed = true; }
      });
      if (changed) {
        saveLocal(state);
        refreshCount();
        renderBookmarkBtn();
      }
      cloudPush();
    }).catch(function () {});
  }

  function init() {
    addStyle();
    renderTools();
    renderBookmarkBtn();
    cloudPull();
    var target = document.getElementById('eventNumber');
    if (target && window.MutationObserver) {
      var obs = new MutationObserver(function () { setTimeout(renderBookmarkBtn, 40); });
      obs.observe(target, { childList: true, characterData: true, subtree: true });
    }
    window.addEventListener('hashchange', function () { setTimeout(renderBookmarkBtn, 70); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
