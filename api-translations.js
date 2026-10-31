/* NKJV / NIV runtime text loader — API.Bible (American Bible Society).

   The NKJV and NIV texts are copyrighted and are NOT bundled with this
   site. When the reader selects NKJV or NIV in the translation picker,
   translations.js leaves the bundled KJV text in place (its dictionary
   swap has no NKJV/NIV entry, so it is a no-op for them); this script
   then replaces the text of each rendered verse with the selected
   version's text, fetched ONE chapter at a time from API.Bible and
   cached on-device for 13 days (the ABS licence requires cached text
   to be cleared within 14 days). In-verse glossary word buttons are
   keyed to the KJV wording, so they are dropped in NKJV/NIV mode only;
   the verse number, Context and actions controls, and any footnote
   button are kept. Verses a chapter does not contain (numbering
   differences) keep their KJV text. If a chapter cannot be loaded, its
   verses keep the KJV text, the chapter is not retried this session,
   and one small notice is shown by the translation picker. */
(() => {
  'use strict';
  const API_KEY = 'vcj7MvRSMnanUS3y4R_wI';
  const BIBLES = { NKJV: '63097d2a0a2f7db3-01', NIV: '78a9f6124f344018-01' };
  const ATTRIBUTION = {
    NKJV: 'Scripture taken from the New King James Version®. Copyright © 1982 by Thomas Nelson. Used by permission. All rights reserved.',
    NIV: 'Scripture quotations taken from The Holy Bible, New International Version® NIV®. Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™ Used by permission. All rights reserved worldwide.'
  };
  /* Site book codes (verse-names.js / OT_BOOKS / NT_BOOKS) that differ
     from API.Bible book codes. Every other site code is identical to
     the API.Bible code and is passed through unchanged. */
  const BOOK_FIX = { SOS: 'SNG', EZE: 'EZK', JOE: 'JOL', NAH: 'NAM', MAR: 'MRK', JOH: 'JHN', JAM: 'JAS', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN', JDE: 'JUD' };
  const code = window.BibleTranslation && window.BibleTranslation.current;
  if (!code || !Object.prototype.hasOwnProperty.call(BIBLES, code)) return;
  const bibleId = BIBLES[code];
  const TTL_MS = 13 * 24 * 60 * 60 * 1000; // 13 days; ABS licence: clear cache within 14 days
  const CACHE_PREFIX = 'gh-apibible-' + code + '-' + bibleId + '-';
  const VERSE_SELECTOR = '.scripture-verse[data-scripture-key], #searchChapter p[data-scripture-key]';
  const chapters = new Map(); // "JOH 3" -> { state: 'loading'|'done'|'failed', verses: object|null }
  const queue = [];
  let draining = false;
  let noticeShown = false;
  let scanQueued = false;

  const apiBook = (siteCode) => BOOK_FIX[siteCode] || siteCode;
  const apiChapterId = (siteCode, chapter) => apiBook(siteCode) + '.' + chapter;

  /* ---------- chapter cache (localStorage, 13-day TTL) ---------- */
  function readCache(siteCode, chapter) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + apiChapterId(siteCode, chapter));
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || typeof entry.t !== 'number' || !entry.verses || Date.now() - entry.t > TTL_MS) {
        localStorage.removeItem(CACHE_PREFIX + apiChapterId(siteCode, chapter));
        return null;
      }
      return entry.verses;
    } catch { return null; }
  }
  function writeCache(siteCode, chapter, verses) {
    try { localStorage.setItem(CACHE_PREFIX + apiChapterId(siteCode, chapter), JSON.stringify({ t: Date.now(), verses })); } catch {}
  }

  /* ---------- API.Bible chapter JSON -> { "JHN.3.16": "text", ... } ----------
     The JSON content tree marks verse boundaries with attrs.verseId —
     on verse nodes wrapping their text items, or on the text items
     themselves. Walk the tree recursively, tracking the current verse,
     and gather each verse's text fragments in order. */
  function parseChapter(json) {
    const verses = {};
    const content = json && json.data && json.data.content;
    if (!Array.isArray(content)) return verses;
    const collect = (node, current) => {
      if (node == null) return;
      if (Array.isArray(node)) { for (const child of node) collect(child, current); return; }
      if (typeof node !== 'object') return;
      let verse = current;
      const attrs = node.attrs || {};
      if (typeof attrs.verseId === 'string' && /^\S+\.\d+\.\d+$/.test(attrs.verseId)) verse = attrs.verseId;
      else if (typeof attrs.sid === 'string' && /^\S+\.\d+\.\d+$/.test(attrs.sid)) verse = attrs.sid;
      if (node.type === 'text' && typeof node.text === 'string' && verse) {
        verses[verse] = (verses[verse] || '') + node.text;
      }
      if (Array.isArray(node.items)) for (const child of node.items) collect(child, verse);
    };
    collect(content, null);
    for (const id of Object.keys(verses)) verses[id] = verses[id].replace(/\s+/g, ' ').trim();
    return verses;
  }

  async function fetchChapter(siteCode, chapter) {
    const url = 'https://api.scripture.api.bible.com/v1/bibles/' + bibleId + '/chapters/' + apiChapterId(siteCode, chapter) +
      '?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false&include-verse-spans=false';
    const res = await fetch(url, { headers: { 'api-key': API_KEY } });
    if (!res.ok) throw new Error('API.Bible HTTP ' + res.status);
    const verses = parseChapter(await res.json());
    if (!Object.keys(verses).length) throw new Error('API.Bible chapter had no verse text');
    return verses;
  }

  /* ---------- DOM swapping ---------- */
  function contentRoot() {
    return document.querySelector('.reader-inner') || document.querySelector('.search-page') || document.querySelector('main');
  }
  function ensureAttribution() {
    const root = contentRoot();
    if (!root || root.querySelector('.api-attribution')) return;
    if (!document.querySelector('[data-api-version]')) return; // only once NKJV/NIV text is actually on the page
    const p = document.createElement('p');
    p.className = 'api-attribution';
    p.textContent = ATTRIBUTION[code];
    root.appendChild(p);
  }
  function swapVerse(el, text) {
    if (el.dataset.apiVersion === code) return;
    const number = el.querySelector(':scope > .verse-number') || el.querySelector(':scope > sup');
    const context = el.querySelector(':scope > .verse-context-button');
    const actions = el.querySelector(':scope > .verse-actions');
    const footnote = el.querySelector(':scope > .footnote-open');
    while (el.firstChild) el.removeChild(el.firstChild);
    if (number) el.appendChild(number);
    el.appendChild(document.createTextNode(' ' + text + ' '));
    if (context) el.appendChild(context);
    if (actions) el.appendChild(actions);
    if (footnote) el.appendChild(footnote);
    el.dataset.apiVersion = code;
    el.setAttribute('data-share-text', text);
  }
  function applyChapter(key) {
    const entry = chapters.get(key);
    if (!entry || entry.state !== 'done') return;
    const parts = key.split(' ');
    const prefix = apiBook(parts[0]) + '.' + parts[1] + '.';
    for (const el of document.querySelectorAll(VERSE_SELECTOR)) {
      if (el.dataset.apiVersion === code) continue;
      const k = el.getAttribute('data-scripture-key');
      if (!k) continue;
      const p = k.split(' ');
      if (p.length !== 3 || p[0] !== parts[0] || p[1] !== parts[1]) continue;
      const text = entry.verses[prefix + p[2]];
      if (text) swapVerse(el, text); // verses the API chapter lacks keep their KJV text
    }
    ensureAttribution();
  }
  function showNotice() {
    if (noticeShown) return;
    noticeShown = true;
    const picker = document.querySelector('.translation-picker');
    if (!picker) return;
    const note = document.createElement('small');
    note.className = 'api-translation-notice';
    note.textContent = "Couldn't load " + code + ' right now — showing KJV.';
    picker.appendChild(note);
  }

  /* ---------- chapter loading queue (sequential: one chapter per call) ---------- */
  async function drain() {
    if (draining) return;
    draining = true;
    while (queue.length) {
      const key = queue.shift();
      const parts = key.split(' ');
      try {
        const verses = await fetchChapter(parts[0], parts[1]);
        chapters.set(key, { state: 'done', verses });
        writeCache(parts[0], parts[1], verses);
        applyChapter(key);
      } catch {
        chapters.set(key, { state: 'failed', verses: null }); // no retry loops this session
        showNotice();
      }
    }
    draining = false;
  }
  function requestChapter(siteCode, chapter) {
    const key = siteCode + ' ' + chapter;
    if (chapters.has(key)) return;
    const cached = readCache(siteCode, chapter);
    if (cached) {
      chapters.set(key, { state: 'done', verses: cached });
      applyChapter(key);
      return;
    }
    chapters.set(key, { state: 'loading', verses: null });
    queue.push(key);
    drain();
  }

  /* ---------- scanning: initial pass + DOM changes ---------- */
  function scan() {
    scanQueued = false;
    const needed = new Set();
    for (const el of document.querySelectorAll(VERSE_SELECTOR)) {
      if (el.dataset.apiVersion === code) continue;
      const k = el.getAttribute('data-scripture-key');
      if (!k) continue;
      const p = k.split(' ');
      if (p.length !== 3) continue;
      needed.add(p[0] + ' ' + p[1]);
    }
    for (const key of needed) {
      const entry = chapters.get(key);
      if (!entry) { const p = key.split(' '); requestChapter(p[0], p[1]); }
      else if (entry.state === 'done') applyChapter(key);
    }
    ensureAttribution();
  }
  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;
    setTimeout(scan, 120);
  }
  function init() {
    scan();
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.BibleApiTranslations = { code, parseChapter, BOOK_FIX };
})();
