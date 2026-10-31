/* highlights.js — Comparative Gospel Harmony: personal text highlighting.
 *
 * Select any text on the page and a small toolbar offers highlight colors
 * (gold / green / blue / pink / purple / orange / teal / red). Highlights
 * are <mark class="gh-hl …"> elements, saved per page in localStorage and
 * re-applied on load. A plain tap on a verse (.scripture-verse) selects
 * the whole verse, so the same toolbar can highlight it in one go.
 *
 * Anchoring: for each highlight we store the exact selected text plus up
 * to 32 characters of the text immediately before and after it, and the
 * occurrence index of the text on the page. On load we rebuild a map of
 * the page's text (concatenated text nodes), find every occurrence of the
 * stored text, score each by how well its surroundings match the stored
 * prefix/suffix, and wrap the best match. If nothing matches (the page
 * content changed), the highlight is skipped silently.
 *
 * Everything is wrapped defensively: highlighting must never break a page.
 */
(function () {
  'use strict';

  var STORE_KEY = 'gh-highlights-v1';
  var COLORS = ['gold', 'green', 'blue', 'pink', 'purple', 'orange', 'teal', 'red'];
  var CONTEXT_LEN = 32;
  var TOOLBAR_ID = 'gh-hl-toolbar';
  var SKIP_TAGS = {
    SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1,
    SELECT: 1, OPTION: 1, BUTTON: 0, SVG: 1, IMG: 1, AUDIO: 1, VIDEO: 1
  };

  var toolbarEl = null;
  var current = null;      // toolbar state: {mode:'sel'|'mark', ...}
  var checkTimer = null;
  var hideSuppressUntil = 0;
  var observer = null;

  /* ------------------------------------------------ storage */

  function pageKey() {
    var p = location.pathname || '/';
    if (p === '/') p = '/index.html';
    return p + (location.search || '');
  }

  function loadAll() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {};
    } catch (e) { return {}; }
  }

  function saveAll(all) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch (e) { /* private mode etc. */ }
  }

  function loadPage() {
    var list = loadAll()[pageKey()];
    return Array.isArray(list) ? list : [];
  }

  function savePage(list) {
    var all = loadAll();
    if (list.length) all[pageKey()] = list; else delete all[pageKey()];
    saveAll(all);
  }

  function newId() {
    return 'h' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  /* ------------------------------------------------ text map */

  function closestMark(node) {
    var p = node.parentNode;
    while (p && p !== document.body) {
      if (p.nodeType === 1 && p.tagName === 'MARK' &&
          (' ' + (p.className || '') + ' ').indexOf(' gh-hl ') !== -1) return p;
      p = p.parentNode;
    }
    return null;
  }

  function nodeAccepted(node) {
    if (!node.nodeValue) return false;
    var p = node.parentNode;
    while (p && p !== document.body) {
      if (p.nodeType === 1) {
        if (SKIP_TAGS[p.tagName]) return false;
        if (p.namespaceURI && p.namespaceURI.indexOf('http://www.w3.org/1999/xhtml') === -1) return false;
        if (p.id === TOOLBAR_ID) return false;
      }
      p = p.parentNode;
    }
    return true;
  }

  /* Builds {full, segments:[{node,start,end}], covered:[{start,end,id}]}
     where `full` is the concatenation of all visible text nodes and
     `covered` marks the ranges already inside an existing highlight. */
  function buildMap() {
    var segments = [], covered = [], full = '';
    if (!document.body) return { full: full, segments: segments, covered: covered };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, function (node) {
      return nodeAccepted(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    });
    var n;
    while ((n = walker.nextNode())) {
      var start = full.length;
      full += n.nodeValue;
      segments.push({ node: n, start: start, end: full.length });
      var mark = closestMark(n);
      if (mark) covered.push({ start: start, end: full.length, id: mark.getAttribute('data-gh-id') });
    }
    return { full: full, segments: segments, covered: covered };
  }

  function pointOffset(container, offset, map) {
    var i, seg;
    for (i = 0; i < map.segments.length; i++) {
      seg = map.segments[i];
      if (seg.node === container) {
        return seg.start + Math.min(offset, seg.node.nodeValue.length);
      }
    }
    /* Element container: the point sits between child nodes. Walk the
       segments and count every text node that ends at or before it. */
    try {
      var probe = document.createRange();
      probe.setStart(document.body, 0);
      probe.setEnd(container, offset);
      var total = 0;
      for (i = 0; i < map.segments.length; i++) {
        seg = map.segments[i];
        var nr = document.createRange();
        nr.selectNodeContents(seg.node);
        if (probe.compareBoundaryPoints(Range.END_TO_END, nr) >= 0) total = seg.end;
        else { total = seg.start; break; }
      }
      return total;
    } catch (e) { return null; }
  }

  function offsetsForRange(range, map) {
    var start = pointOffset(range.startContainer, range.startOffset, map);
    var end = pointOffset(range.endContainer, range.endOffset, map);
    if (start == null || end == null || end <= start) return null;
    return { start: start, end: end };
  }

  function findOccurrences(full, text) {
    var out = [], idx = full.indexOf(text);
    while (idx !== -1) { out.push(idx); idx = full.indexOf(text, idx + 1); }
    return out;
  }

  function commonSuffixLen(a, b) {
    var n = 0, max = Math.min(a.length, b.length);
    while (n < max && a.charAt(a.length - 1 - n) === b.charAt(b.length - 1 - n)) n++;
    return n;
  }

  function commonPrefixLen(a, b) {
    var n = 0, max = Math.min(a.length, b.length);
    while (n < max && a.charAt(n) === b.charAt(n)) n++;
    return n;
  }

  function overlapsCovered(map, start, end, exceptId) {
    for (var i = 0; i < map.covered.length; i++) {
      var c = map.covered[i];
      if (c.id !== exceptId && c.start < end && start < c.end) return true;
    }
    return false;
  }

  /* Best anchor offset for a stored record, or -1 if it cannot be found. */
  function findAnchor(rec, map) {
    var cands = findOccurrences(map.full, rec.text);
    if (!cands.length) return -1;
    var best = -1, bestScore = -1;
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (overlapsCovered(map, c, c + rec.text.length, rec.id)) continue;
      var score = 0;
      if (rec.prefix) {
        score += commonSuffixLen(map.full.slice(Math.max(0, c - rec.prefix.length), c), rec.prefix);
      }
      if (rec.suffix) {
        score += commonPrefixLen(map.full.slice(c + rec.text.length, c + rec.text.length + rec.suffix.length), rec.suffix);
      }
      if (i === rec.occ) score += 0.5; /* stored occurrence breaks ties */
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return best;
  }

  /* ------------------------------------------------ wrapping */

  /* Wraps the text at [start,end) of the map in <mark> elements — one per
     text node touched, all sharing the highlight id — so selections that
     span several elements keep the document structure valid. */
  function wrapOffsets(map, start, end, color, id) {
    var targets = [];
    map.segments.forEach(function (seg) {
      var s = Math.max(start, seg.start), e = Math.min(end, seg.end);
      if (s < e) targets.push({ node: seg.node, from: s - seg.start, to: e - seg.start });
    });
    var made = [];
    targets.forEach(function (t) {
      try {
        var node = t.node;
        if (!node.parentNode) return;
        if (t.to < node.nodeValue.length) node.splitText(t.to);
        if (t.from > 0) node = node.splitText(t.from);
        var mark = document.createElement('mark');
        mark.className = 'gh-hl gh-hl-' + color;
        mark.setAttribute('data-gh-id', id);
        node.parentNode.replaceChild(mark, node);
        mark.appendChild(node);
        made.push(mark);
      } catch (e) { /* skip this segment */ }
    });
    return made;
  }

  function marksFor(id) {
    return Array.prototype.slice.call(
      document.querySelectorAll('mark.gh-hl[data-gh-id="' + id + '"]'));
  }

  function unwrapId(id) {
    marksFor(id).forEach(function (mark) {
      try {
        var parent = mark.parentNode;
        if (!parent) return;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        parent.normalize();
      } catch (e) { /* ignore */ }
    });
  }

  function removeRecord(id) {
    unwrapId(id);
    savePage(loadPage().filter(function (r) { return r.id !== id; }));
  }

  function applyStored() {
    try {
      var list = loadPage();
      if (!list.length) return;
      var domIds = {};
      Array.prototype.forEach.call(
        document.querySelectorAll('mark.gh-hl[data-gh-id]'),
        function (m) { domIds[m.getAttribute('data-gh-id')] = 1; });
      var pending = list.filter(function (r) { return !domIds[r.id]; });
      if (!pending.length) return;
      var sel = window.getSelection();
      if (sel && !sel.isCollapsed) return; /* don't disturb an active selection */
      pending.forEach(function (rec) {
        try {
          var map = buildMap();
          var start = findAnchor(rec, map);
          if (start < 0) return; /* content changed — skip silently */
          wrapOffsets(map, start, start + rec.text.length, rec.color, rec.id);
        } catch (e) { /* skip this highlight */ }
      });
    } catch (e) { /* never break the page */ }
  }

  /* ------------------------------------------------ toolbar */

  function buildToolbar() {
    toolbarEl = document.createElement('div');
    toolbarEl.id = TOOLBAR_ID;
    toolbarEl.className = 'gh-hl-toolbar';
    toolbarEl.setAttribute('role', 'toolbar');
    toolbarEl.setAttribute('aria-label', 'Text highlight');
    toolbarEl.hidden = true;

    COLORS.forEach(function (color) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gh-hl-swatch';
      b.setAttribute('data-color', color);
      b.setAttribute('aria-label', 'Highlight ' + color);
      b.title = 'Highlight ' + color;
      var dot = document.createElement('span');
      dot.className = 'gh-hl-dot gh-dot-' + color;
      b.appendChild(dot);
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { onColor(color); });
      toolbarEl.appendChild(b);
    });

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'gh-hl-btn gh-hl-remove';
    removeBtn.id = 'gh-hl-remove';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    removeBtn.addEventListener('click', onRemove);
    toolbarEl.appendChild(removeBtn);

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'gh-hl-btn gh-hl-clear';
    clearBtn.id = 'gh-hl-clear';
    clearBtn.textContent = 'Clear page';
    clearBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); });
    clearBtn.addEventListener('click', onClear);
    toolbarEl.appendChild(clearBtn);

    document.body.appendChild(toolbarEl);
  }

  function rangeRect(range) {
    try {
      var r = range.getBoundingClientRect();
      if (r && (r.width || r.height || r.top || r.left)) return r;
    } catch (e) { /* fall through */ }
    try {
      var el = range.startContainer.nodeType === 1
        ? range.startContainer : range.startContainer.parentNode;
      var r2 = el.getBoundingClientRect();
      if (r2 && (r2.width || r2.height || r2.top || r2.left)) return r2;
    } catch (e) { /* fall through */ }
    return { left: 10, top: 10, bottom: 32, right: 120, width: 110, height: 22 };
  }

  function positionToolbar(rect) {
    var tw = toolbarEl.offsetWidth || 240;
    var th = toolbarEl.offsetHeight || 52;
    var x = rect.left + (rect.width || 0) / 2 - tw / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
    var y = rect.top - th - 10;             /* prefer above the selection */
    if (y < 8) y = rect.bottom + 10;        /* …otherwise below it */
    if (y + th > window.innerHeight - 8) y = Math.max(8, window.innerHeight - th - 8);
    toolbarEl.style.left = x + 'px';
    toolbarEl.style.top = y + 'px';
  }

  function showToolbar(rect, opts) {
    var removeBtn = toolbarEl.querySelector('#gh-hl-remove');
    var clearBtn = toolbarEl.querySelector('#gh-hl-clear');
    removeBtn.hidden = !opts.remove;
    clearBtn.hidden = !(opts.clear && loadPage().length > 0);
    resetClearBtn();
    toolbarEl.hidden = false;
    positionToolbar(rect);
  }

  function hideToolbar() {
    if (toolbarEl) toolbarEl.hidden = true;
    current = null;
    resetClearBtn();
  }

  function resetClearBtn() {
    if (!toolbarEl) return;
    var b = toolbarEl.querySelector('#gh-hl-clear');
    if (b) { b.classList.remove('gh-hl-confirm'); b.textContent = 'Clear page'; b.removeAttribute('data-armed'); }
  }

  function reposition() {
    if (!toolbarEl || toolbarEl.hidden || !current) return;
    try {
      if (current.mode === 'sel' && current.range) positionToolbar(rangeRect(current.range));
      else if (current.mode === 'mark') {
        var marks = marksFor(current.markId);
        if (marks.length) positionToolbar(marks[0].getBoundingClientRect());
      }
    } catch (e) { hideToolbar(); }
  }

  /* ------------------------------------------------ actions */

  function onColor(color) {
    if (!current) return;
    try {
      if (current.mode === 'mark') {
        marksFor(current.markId).forEach(function (m) { m.className = 'gh-hl gh-hl-' + color; });
        var list = loadPage();
        list.forEach(function (r) { if (r.id === current.markId) r.color = color; });
        savePage(list);
      } else if (current.mode === 'sel') {
        var map = buildMap();
        var start = current.offsets.start, end = current.offsets.end;
        /* If the DOM shifted since the toolbar opened, re-anchor by text. */
        if (map.full.slice(start, end) !== current.text) {
          var probe = { id: '', text: current.text, prefix: current.prefix, suffix: current.suffix, occ: current.occ };
          start = findAnchor(probe, map);
          if (start < 0) { hideToolbar(); return; }
          end = start + current.text.length;
        }
        /* A new color over an old highlight replaces the overlapped part. */
        (current.overlapIds || []).forEach(function (id) { removeRecord(id); });
        map = buildMap();
        if (map.full.slice(start, end) !== current.text) {
          start = findAnchor({ id: '', text: current.text, prefix: current.prefix, suffix: current.suffix, occ: current.occ }, map);
          if (start < 0) { hideToolbar(); return; }
          end = start + current.text.length;
        }
        var rec = {
          id: newId(), text: current.text, prefix: current.prefix,
          suffix: current.suffix, occ: current.occ, color: color
        };
        var list2 = loadPage();
        list2.push(rec);
        savePage(list2);
        wrapOffsets(map, start, end, color, rec.id);
        try { window.getSelection().removeAllRanges(); } catch (e) { /* ignore */ }
      }
    } catch (e) { /* never break the page */ }
    hideToolbar();
  }

  function onRemove() {
    if (!current) { hideToolbar(); return; }
    try {
      if (current.mode === 'mark') removeRecord(current.markId);
      else if (current.mode === 'sel') (current.overlapIds || []).forEach(removeRecord);
      try { window.getSelection().removeAllRanges(); } catch (e) { /* ignore */ }
    } catch (e) { /* ignore */ }
    hideToolbar();
  }

  function onClear() {
    var b = toolbarEl.querySelector('#gh-hl-clear');
    if (!b.getAttribute('data-armed')) {
      b.setAttribute('data-armed', '1');
      b.classList.add('gh-hl-confirm');
      b.textContent = 'Tap again to clear';
      setTimeout(resetClearBtn, 3000);
      return;
    }
    try {
      loadPage().slice().forEach(function (r) { unwrapId(r.id); });
      savePage([]);
    } catch (e) { /* ignore */ }
    hideToolbar();
  }

  /* ------------------------------------------------ selection watching */

  function maybeHide() {
    if (Date.now() < hideSuppressUntil) return;
    hideToolbar();
  }

  function scheduleCheck() {
    if (checkTimer) clearTimeout(checkTimer);
    checkTimer = setTimeout(checkSelection, 140);
  }

  function checkSelection() {
    try {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { maybeHide(); applyStored(); return; }
      var range = sel.getRangeAt(0);
      if (!range.toString() || !range.toString().trim()) { maybeHide(); return; }
      var anc = range.commonAncestorContainer;
      var ancEl = anc.nodeType === 1 ? anc : anc.parentNode;
      if (toolbarEl && ancEl && toolbarEl.contains(ancEl)) return;
      if (ancEl && ancEl.closest && ancEl.closest('input, textarea, select')) { maybeHide(); return; }

      var map = buildMap();
      var offs = offsetsForRange(range, map);
      if (!offs) { maybeHide(); return; }
      /* Trim surrounding whitespace so the color hugs the words. */
      while (offs.start < offs.end && /\s/.test(map.full.charAt(offs.start))) offs.start++;
      while (offs.end > offs.start && /\s/.test(map.full.charAt(offs.end - 1))) offs.end--;
      if (offs.end <= offs.start) { maybeHide(); return; }

      var text = map.full.slice(offs.start, offs.end);
      var overlapIds = [];
      map.covered.forEach(function (c) {
        if (c.start < offs.end && offs.start < c.end && overlapIds.indexOf(c.id) === -1) {
          overlapIds.push(c.id);
        }
      });
      var cands = findOccurrences(map.full, text);
      current = {
        mode: 'sel',
        range: range.cloneRange(),
        offsets: offs,
        text: text,
        prefix: map.full.slice(Math.max(0, offs.start - CONTEXT_LEN), offs.start),
        suffix: map.full.slice(offs.end, offs.end + CONTEXT_LEN),
        occ: cands.indexOf(offs.start),
        overlapIds: overlapIds
      };
      showToolbar(rangeRect(range), { remove: overlapIds.length > 0, clear: true });
    } catch (e) { /* ignore — never break the page */ }
  }

  /* ------------------------------------------------ init */

  function init() {
    buildToolbar();

    document.addEventListener('selectionchange', scheduleCheck);
    document.addEventListener('mouseup', scheduleCheck);
    document.addEventListener('touchend', function () {
      setTimeout(scheduleCheck, 40);
    }, { passive: true });

    /* Tapping an existing highlight opens the toolbar for it. */
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || (toolbarEl && toolbarEl.contains(t))) return;
      var mark = (t.closest) ? t.closest('mark.gh-hl') : null;
      if (mark) {
        hideSuppressUntil = Date.now() + 500;
        current = { mode: 'mark', markId: mark.getAttribute('data-gh-id') };
        showToolbar(mark.getBoundingClientRect(), { remove: true, clear: true });
      }
    });

    /* A plain tap on a verse selects the whole verse, so the toolbar
       offers to highlight the full verse at once (manual drag-selection
       is fiddly on touch). Drags keep their normal partial selection,
       and taps on controls inside the verse — glossary word buttons,
       the verse-number cross-reference button, the Context button and
       the ••• actions button — or on an existing highlight keep their
       own behavior. */
    var tapStart = null;
    document.addEventListener('pointerdown', function (e) {
      tapStart = null;
      var t = e.target;
      if (!t || !t.closest) return;
      if (toolbarEl && toolbarEl.contains(t)) return;
      if (t.closest('button, a')) return;
      if (t.closest('mark.gh-hl')) return;
      var verse = t.closest('.scripture-verse');
      if (verse) tapStart = { x: e.clientX, y: e.clientY, verse: verse };
    });
    document.addEventListener('pointerup', function (e) {
      var start = tapStart;
      tapStart = null;
      if (!start) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (dx * dx + dy * dy > 49) return; /* the pointer moved — a drag, not a tap */
      try {
        var sel = window.getSelection();
        if (!sel) return;
        if (!sel.isCollapsed && sel.toString().trim().length > 1) return; /* a real selection wins */
        var range = document.createRange();
        range.selectNodeContents(start.verse);
        /* Leave the verse's trailing Context / ••• control buttons out
           of the selection — they are controls, not verse text. */
        var endNode = start.verse.lastChild;
        while (endNode && endNode.nodeType === 1 &&
               (endNode.classList.contains('verse-actions') ||
                endNode.classList.contains('verse-context-button'))) {
          endNode = endNode.previousSibling;
        }
        if (endNode && endNode !== start.verse.lastChild) range.setEndAfter(endNode);
        sel.removeAllRanges();
        sel.addRange(range);
        scheduleCheck();
      } catch (err) { /* ignore — never break the page */ }
    });

    /* Tapping anywhere else dismisses the toolbar. */
    document.addEventListener('pointerdown', function (e) {
      if (!toolbarEl || toolbarEl.hidden) return;
      if (toolbarEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('mark.gh-hl')) return;
      hideToolbar();
    });

    var reposTimer = null;
    function onViewportChange() {
      if (reposTimer) clearTimeout(reposTimer);
      reposTimer = setTimeout(reposition, 90);
    }
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);

    applyStored();
    window.addEventListener('load', applyStored);

    /* Pages render much of their text with JS (event cards, reader
       chapters, journey days). Watch for DOM changes and re-apply any
       stored highlights that have not landed yet; applyStored() exits
       early when there is nothing pending, so this stays cheap. */
    if (window.MutationObserver && document.body) {
      var mutTimer = null;
      observer = new MutationObserver(function () {
        if (mutTimer) clearTimeout(mutTimer);
        mutTimer = setTimeout(applyStored, 400);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        try { init(); } catch (e) { /* never break the page */ }
      });
    } else {
      init();
    }
  } catch (e) { /* never break the page */ }
})();
