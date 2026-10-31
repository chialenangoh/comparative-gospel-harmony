(() => {
  'use strict';
  const STORAGE_KEY = 'bible-study-highlights-v1';
  const colors = ['yellow', 'green', 'blue', 'pink', 'purple'];
  let highlights = {};
  try { highlights = JSON.parse(window.localStorage?.getItem(STORAGE_KEY) || '{}'); } catch (_) { highlights = {}; }
  let activeKey = '';
  let root = null;
  let getTitle = () => document.title.split('|')[0].trim();
  const $ = (id) => document.getElementById(id);
  const els = {
    dialog: $('studyToolsDialog'), title: $('studyToolsTitle'), reference: $('studyToolsReference'),
    palette: $('highlightPalette'), remove: $('removeHighlight'), share: $('shareVerse'), close: $('studyToolsClose'),
    status: $('studyToolsStatus'), sharePassage: $('sharePassage'), context: $('studyVerseContext'),
    contextTitle: $('studyContextTitle'), contextText: $('studyContextText'), contextLinks: $('studyContextLinks'),
  };
  const escape = (value) => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

  function save() {
    try { window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(highlights)); } catch (_) {}
  }
  function verseElements(key) {
    return root?.querySelectorAll ? [...root.querySelectorAll('[data-scripture-key]')].filter((el) => el.dataset.scriptureKey === key) : [];
  }
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
  function verseText(key) {
    const el = verseElements(key)[0];
    return el?.dataset.shareText || window.OT_VERSE_TEXT?.[key] || window.NT_VERSE_TEXT?.[key] || window.GOSPEL_VERSE_TEXT?.[key] || '';
  }
  function setStatus(message) {
    els.status.textContent = message;
    els.status.hidden = false;
  }
  async function share(title, text) {
    const payload = `${title} (${window.BibleTranslation?.current || 'KJV'})\n\n${text}\n\nShared from Comparative Gospel Harmony`;
    try {
      if (navigator.share) { await navigator.share({ title, text: payload }); setStatus('Share sheet opened.'); return; }
      await navigator.clipboard.writeText(payload); setStatus('Copied. Paste it into a message or post.');
    } catch (error) {
      if (error?.name !== 'AbortError') setStatus('Sharing was not available. Please try again.');
    }
  }
  function open(key) {
    activeKey = key;
    els.title.textContent = 'Highlight or share';
    els.reference.textContent = `${label(key)} — ${verseText(key)}`;
    const note = (window.VERSE_CONTEXT || {})[key];
    const [book, chapter, verse] = key.split(' ');
    const neighbors = [Number(verse)-1, Number(verse)+1].filter((n)=>n>0).map((n)=>`${book} ${chapter} ${n}`);
    els.contextTitle.textContent = note?.heading || 'Read around this verse';
    els.contextText.textContent = note?.explanation || 'Read the neighboring verses to see who is speaking, what prompted the words, and how the thought continues.';
    const connections = [...new Set([...(note?.connections || []), ...neighbors])].filter((ref)=>verseText(ref));
    els.contextLinks.innerHTML = connections.map((ref)=>`<button type="button" data-context-verse="${escape(ref)}"><strong>${escape(label(ref))}</strong><span>${escape(verseText(ref))}</span></button>`).join('');
    if (note?.source && /^https?:\/\//i.test(note.source)) els.contextLinks.innerHTML += `<a href="${escape(note.source)}" target="_blank" rel="noopener noreferrer">${escape(note.sourceLabel || 'Historical context source')} ↗</a>`;
    els.context.hidden = false;
    els.status.hidden = true;
    [...(els.palette.querySelectorAll?.('[data-highlight-color]') || [])].forEach((button) => {
      button.setAttribute('aria-pressed', String(highlights[key] === button.dataset.highlightColor));
    });
    els.remove.hidden = !highlights[key];
    if (!els.dialog.open) els.dialog.showModal();
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
    root.addEventListener('click', (event) => {
      const button = event.target.closest('[data-verse-action], [data-context-action]');
      if (button) open(button.dataset.verseAction || button.dataset.contextAction);
    });
    els.contextLinks.addEventListener('click', (event) => {
      const button = event.target.closest('[data-context-verse]');
      if (button) open(button.dataset.contextVerse);
    });
    els.sharePassage.addEventListener('click', () => share(getTitle(), passageText()));
    els.palette.addEventListener('click', (event) => {
      const button = event.target.closest('[data-highlight-color]');
      if (!button || !activeKey) return;
      highlights[activeKey] = button.dataset.highlightColor;
      save(); apply(); open(activeKey); setStatus(`${label(activeKey)} highlighted.`);
    });
    els.remove.addEventListener('click', () => {
      delete highlights[activeKey]; save(); apply(); els.dialog.close();
    });
    els.share.addEventListener('click', () => share(label(activeKey), verseText(activeKey)));
    els.close.addEventListener('click', () => els.dialog.close());
    els.dialog.addEventListener('click', (event) => { if (event.target === els.dialog) els.dialog.close(); });
  }
  window.StudyTools = { setup, apply, close: () => { if (els.dialog.open) els.dialog.close(); } };
})();
