(() => {
  'use strict';
  /* Verse-tools support that remains after the verse popup dialog was
     removed (2026-10-31): rendering of previously saved whole-verse
     highlights (localStorage bible-study-highlights-v1) and the standalone
     "Share displayed passage / Share this chapter" button. The dialog,
     its color palette, verse Context panel and per-verse share are gone;
     highlighting now happens through highlights.js. */
  const STORAGE_KEY = 'bible-study-highlights-v1';
  const colors = ['yellow', 'green', 'blue', 'pink', 'purple'];
  let highlights = {};
  try { highlights = JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || '{}'); } catch (_) { highlights = {}; }
  let root = null;
  let getTitle = () => document.title.split('|')[0].trim();
  const sharePassageButton = document.getElementById('sharePassage');

  function apply(container = root) {
    if (!container) return;
    container.querySelectorAll?.('[data-scripture-key]').forEach((el) => {
      const color = highlights[el.dataset.scriptureKey];
      colors.forEach((name) => el.classList.remove(`highlight-${name}`));
      if (color) el.classList.add(`highlight-${color}`);
    });
  }
  function label(key) {
    const parts = key.split(' ');
    const names = window.GOSPEL_BOOK_NAMES || {};
    return `${names[parts[0]] || parts[0]} ${parts[1]}:${parts[2]}`;
  }
  async function share(title, text) {
    const payload = `${title} (${window.BibleTranslation?.current || 'KJV'})\n\n${text}\n\nShared from Comparative Gospel Harmony`;
    try {
      if (navigator.share) { await navigator.share({ title, text: payload }); return; }
      await navigator.clipboard.writeText(payload);
    } catch (_) { /* share sheet dismissed or sharing unavailable */ }
  }
  function passageText() {
    const seen = new Set();
    return [...(root.querySelectorAll?.('[data-scripture-key]') || [])].map((el) => {
      const key = el.dataset.scriptureKey;
      const text = el.dataset.shareText || '';
      const unique = `${key}|${text}`;
      if (!text || seen.has(unique)) return '';
      seen.add(unique);
      return `${label(key)} ${text}`;
    }).filter(Boolean).join('\n');
  }
  function setup(options) {
    root = options.root;
    getTitle = options.getTitle || getTitle;
    apply();
    if (sharePassageButton) sharePassageButton.addEventListener('click', () => share(getTitle(), passageText()));
  }
  window.StudyTools = { setup, apply, close: () => {} };
})();
