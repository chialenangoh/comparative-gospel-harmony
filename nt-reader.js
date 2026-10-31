(() => {
  'use strict';
  const books = window.NT_BOOKS;
  const text = window.NT_VERSE_TEXT;
  const names = window.GOSPEL_BOOK_NAMES;
  const refs = { ...window.GOSPEL_VERSE_REFERENCES, ...window.NT_VERSE_REFERENCES };
  const henry = window.NT_HENRY;
  const calvin = window.NT_CALVIN;
  const glossary = window.GOSPEL_GLOSSARY || {};
  const chapters = books.flatMap((book) => book.chapters.map((count, index) => ({ book, chapter: index + 1, count })));
  const $ = (id) => document.getElementById(id);
  const els = Object.fromEntries(['sidebar', 'scrim', 'menuButton', 'bookSearch', 'bookList', 'reader', 'chapterCount', 'chapterTitle', 'chapterSelect', 'chapterVerses', 'henryCommentary', 'calvinCommentary', 'previousChapter', 'nextChapter', 'verseDialog', 'verseTitle', 'verseText', 'verseBack', 'verseRelated', 'verseRelatedHeading', 'verseMore', 'verseClose', 'wordPanel', 'wordClose', 'wordSearch', 'wordSuggestions', 'wordTitle', 'wordMeaning', 'chapterVisuals', 'ntVisualDialog', 'ntVisualKicker', 'ntVisualTitle', 'ntVisualBody', 'ntVisualCaption', 'ntVisualClose', 'glossaryOpen'].map((id) => [id, $(id)]));
  const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const fmt = (key) => { const [code, chapter, verse] = key.split(' '); return `${names[code] || code} ${chapter}:${verse}`; };
  const chapterId = (item) => `${item.book.code}-${item.chapter}`;
  const currentHash = () => location.hash.slice(1);
  let selected = chapters.findIndex((item) => chapterId(item) === currentHash());
  if (selected < 0) selected = 0;
  let verseOrigin = '', verseCurrent = '', allReferences = false, activeVisuals = [];

  function wordHtml(value) {
    return value.split(/([A-Za-z]+(?:['’][A-Za-z]+)*)/g).map((part, i) => {
      if (i % 2 === 0 || !Object.prototype.hasOwnProperty.call(glossary, part.toLowerCase())) return esc(part);
      return `<button type="button" class="scripture-word" data-word="${esc(part)}" aria-label="Meaning of ${esc(part)}">${esc(part)}</button>`;
    }).join('');
  }

  function renderBooks() {
    const query = els.bookSearch.value.trim().toLowerCase();
    els.bookList.innerHTML = books.filter((b) => b.book.toLowerCase().includes(query)).map((b) => `<button type="button" class="event-link ${chapters[selected].book.code === b.code ? 'active' : ''}" data-book="${esc(b.code)}"><span class="index">${b.chapters.length}</span><span class="label">${esc(b.book)}</span></button>`).join('') || '<div class="empty-list">No matching book.</div>';
  }

  function renderCommentary(activeVerse = 1) {
    const item = chapters[selected];
    const key = `${item.book.code} ${item.chapter}`;
    const entry = henry[key];
    els.henryCommentary.innerHTML = `<div class="nt-author">Matthew Henry <small>Concise Commentary</small></div>` + entry.sections.map((part) => `<details class="nt-section" ${part.from <= activeVerse && activeVerse <= part.to ? 'open' : ''}><summary>${esc(item.book.book)} ${item.chapter}:${esc(part.heading.replace(/^Verses? /, ''))}</summary><p>${esc(part.text)}</p></details>`).join('');
    renderCalvin(activeVerse);
  }

  function renderCalvin(activeVerse) {
    const item = chapters[selected];
    const entry = calvin[`${item.book.code} ${item.chapter}`];
    if (!entry) { els.calvinCommentary.hidden = true; els.calvinCommentary.innerHTML = ''; return; }
    els.calvinCommentary.hidden = false;
    const exact = entry.notes.find((n) => n.verse === activeVerse);
    const nearby = entry.notes.find((n) => n.verse > activeVerse && n.verse <= activeVerse + 3);
    const note = exact || nearby || entry.notes[0];
    els.calvinCommentary.innerHTML = `<div class="nt-author">John Calvin <small>Selected note · ${esc(item.book.book)} ${item.chapter}:${note.verse}</small></div><p>${esc(note.text)}</p>`;
  }

  function closeSidebar() {
    els.sidebar.classList.remove('open'); els.scrim.classList.remove('show'); els.menuButton.setAttribute('aria-expanded', 'false');
  }

  function render({ focus = false } = {}) {
    window.StudyTools.close();
    const item = chapters[selected], { book, chapter, count } = item;
    els.chapterTitle.textContent = `${book.book} ${chapter}`;
    els.chapterCount.textContent = `${book.chapters.length} chapters · Chapter ${chapter}`;
    els.chapterSelect.innerHTML = book.chapters.map((_, i) => `<option value="${i + 1}" ${i + 1 === chapter ? 'selected' : ''}>Chapter ${i + 1}</option>`).join('');
    els.chapterVerses.innerHTML = Array.from({ length: count }, (_, i) => {
      const key = `${book.code} ${chapter} ${i + 1}`;
      return `<p class="nt-verse scripture-verse" id="verse-${i + 1}" data-scripture-key="${esc(key)}" data-share-text="${esc(text[key])}"><button type="button" class="verse-number verse-link" data-verse-ref="${esc(key)}" aria-label="Cross-references for ${esc(fmt(key))}">${i + 1}</button> ${wordHtml(text[key])} ${window.VERSE_CONTEXT?.[key] ? `<button type="button" class="verse-context-button" data-context-action="${esc(key)}" aria-label="Context for ${esc(fmt(key))}">Context</button>` : ''}<button type="button" class="verse-actions" data-verse-action="${esc(key)}" aria-label="Highlight or share ${esc(fmt(key))}">•••</button></p>`;
    }).join('');
    window.StudyTools.apply(els.chapterVerses);
    activeVisuals=window.NT_STUDY_VISUALS.entries(`${book.code} ${chapter}`);
    els.chapterVisuals.hidden=!activeVisuals.length;
    els.chapterVisuals.innerHTML=activeVisuals.length?'<div class="visual-label">Explore this passage</div><div class="visual-cards">'+window.NT_STUDY_VISUALS.cards(activeVisuals)+'</div>':'';
    renderCommentary(); renderBooks();
    els.previousChapter.disabled = selected === 0;
    els.nextChapter.disabled = selected === chapters.length - 1;
    document.title = `${book.book} ${chapter} | New Testament Study`;
    if (currentHash() !== chapterId(item)) history.replaceState(null, '', `#${chapterId(item)}`);
    if (els.verseDialog.open) els.verseDialog.close(); if (els.ntVisualDialog.open) els.ntVisualDialog.close();
    els.wordPanel.hidden = true; closeSidebar();
    if (focus) { window.scrollTo({ top: 0, behavior: 'smooth' }); els.reader.focus({ preventScroll: true }); }
  }

  function go(index) { if (index < 0 || index >= chapters.length) return; selected = index; render({ focus: true }); }

  function showVerse(key, keepOrigin = false) {
    if (!Object.prototype.hasOwnProperty.call(text, key)) return;
    if (!keepOrigin) { verseOrigin = key; allReferences = false; }
    verseCurrent = key;
    els.verseTitle.textContent = fmt(key);
    els.verseText.textContent = text[key];
    els.verseBack.innerHTML = key === verseOrigin ? '' : `<button type="button" class="verse-back-link" data-open-verse="${esc(verseOrigin)}">← Back to ${esc(fmt(verseOrigin))}</button>`;
    const links = refs[key] || [];
    els.verseRelatedHeading.hidden = links.length === 0;
    els.verseRelated.innerHTML = links.slice(0, allReferences ? links.length : 16).map((ref) => `<button type="button" class="verse-result" data-open-verse="${esc(ref)}"><strong>${esc(fmt(ref))}</strong><span>${esc(text[ref] || '')}</span></button>`).join('');
    els.verseMore.hidden = allReferences || links.length <= 16;
    els.verseMore.textContent = `Show all ${links.length} references`;
    if (!els.verseDialog.open) els.verseDialog.showModal();
  }

  function suggestions(query) {
    const term = query.trim().toLowerCase();
    els.wordSuggestions.innerHTML = Object.keys(glossary).filter((word) => !term || word.includes(term)).slice(0, 12).map((word) => `<button type="button" data-glossary-word="${esc(word)}">${esc(word)}</button>`).join('') || '<span>No matching glossary entries.</span>';
  }
  function showWord(word) {
    els.wordTitle.textContent = word || 'Word meanings';
    els.wordMeaning.textContent = glossary[word.toLowerCase()] || (word ? 'No entry yet. Try another word.' : 'Search above or choose a word below.');
    els.wordSearch.value = word; suggestions(word); els.wordPanel.hidden = false;
  }

  els.chapterVisuals.addEventListener('click',(event)=>{const b=event.target.closest('[data-nt-visual]');if(b)window.NT_STUDY_VISUALS.show(activeVisuals[Number(b.dataset.ntVisual)],{dialog:els.ntVisualDialog,title:els.ntVisualTitle,kicker:els.ntVisualKicker,body:els.ntVisualBody,caption:els.ntVisualCaption});});
  els.ntVisualClose.addEventListener('click',()=>els.ntVisualDialog.close());
  els.ntVisualDialog.addEventListener('click',(event)=>{if(event.target===els.ntVisualDialog)els.ntVisualDialog.close();});
  els.bookSearch.addEventListener('input', renderBooks);
  els.bookList.addEventListener('click', (event) => { const b = event.target.closest('[data-book]'); if (b) go(chapters.findIndex((x) => x.book.code === b.dataset.book)); });
  els.chapterSelect.addEventListener('change', (event) => go(chapters.findIndex((x) => x.book.code === chapters[selected].book.code && x.chapter === Number(event.target.value))));
  els.previousChapter.addEventListener('click', () => go(selected - 1));
  els.nextChapter.addEventListener('click', () => go(selected + 1));
  window.enableStudySwipe(els.reader, {
    previous: () => go(selected - 1), next: () => go(selected + 1),
    blocked: () => els.verseDialog.open || els.ntVisualDialog.open || !els.wordPanel.hidden || els.sidebar.classList.contains('open'),
  });
  els.menuButton.addEventListener('click', () => { const open = !els.sidebar.classList.contains('open'); els.sidebar.classList.toggle('open', open); els.scrim.classList.toggle('show', open); els.menuButton.setAttribute('aria-expanded', String(open)); });
  els.scrim.addEventListener('click', closeSidebar);
  els.verseClose.addEventListener('click', () => els.verseDialog.close());
  els.verseMore.addEventListener('click', () => { allReferences = true; showVerse(verseCurrent, true); });
  els.verseDialog.addEventListener('click', (event) => { if (event.target === els.verseDialog) { els.verseDialog.close(); return; } const b = event.target.closest('[data-open-verse]'); if (b) { allReferences = false; showVerse(b.dataset.openVerse, true); } });
  els.glossaryOpen.addEventListener('click', () => { showWord(''); els.wordSearch.focus(); });
  els.wordClose.addEventListener('click', () => { els.wordPanel.hidden = true; });
  els.wordSearch.addEventListener('input', (event) => { const term = event.target.value.trim().toLowerCase(); els.wordTitle.textContent = term || 'Word meanings'; els.wordMeaning.textContent = glossary[term] || (term ? 'Select a suggested word below.' : 'Search above or choose a word below.'); suggestions(term); });
  els.wordSuggestions.addEventListener('click', (event) => { const b = event.target.closest('[data-glossary-word]'); if (b) showWord(b.dataset.glossaryWord); });
  document.addEventListener('click', (event) => {
    const verse = event.target.closest('[data-verse-ref]');
    if (verse) { showVerse(verse.dataset.verseRef); const n = Number(verse.dataset.verseRef.split(' ')[2]); renderCalvin(n); return; }
    const word = event.target.closest('[data-word]');
    if (word) showWord(word.dataset.word);
  });
  window.addEventListener('hashchange', () => { const i = chapters.findIndex((item) => chapterId(item) === currentHash()); if (i >= 0) { selected = i; render(); } });
  window.StudyTools.setup({root:els.chapterVerses,getTitle:()=>els.chapterTitle.textContent});
  render();
})();
