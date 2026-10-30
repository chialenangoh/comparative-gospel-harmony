(() => {
  'use strict';

  const data = window.GOSPEL_DATA;
  const visuals = window.GOSPEL_VISUALS;
  const gospels = data.gospels;
  const els = {
    sidebar: document.getElementById('sidebar'),
    scrim: document.getElementById('scrim'),
    menuButton: document.getElementById('menuButton'),
    search: document.getElementById('searchInput'),
    partSelect: document.getElementById('partSelect'),
    coverageFilters: document.getElementById('coverageFilters'),
    resultsMeta: document.getElementById('resultsMeta'),
    eventList: document.getElementById('eventList'),
    reader: document.getElementById('reader'),
    eventPart: document.getElementById('eventPart'),
    eventNumber: document.getElementById('eventNumber'),
    eventTitle: document.getElementById('eventTitle'),
    eventSummary: document.getElementById('eventSummary'),
    coverageBadges: document.getElementById('coverageBadges'),
    viewTabs: document.getElementById('viewTabs'),
    comparisonGrid: document.getElementById('comparisonGrid'),
    crossReferences: document.getElementById('crossReferences'),
    studyCommentary: document.getElementById('studyCommentary'),
    commentaryColumn: document.getElementById('commentaryColumn'),
    supplemental: document.getElementById('supplemental'),
    supplementalContent: document.getElementById('supplementalContent'),
    editorialNotes: document.getElementById('editorialNotes'),
    notesList: document.getElementById('notesList'),
    previous: document.getElementById('previousEvent'),
    next: document.getElementById('nextEvent'),
    previousLabel: document.getElementById('previousLabel'),
    nextLabel: document.getElementById('nextLabel'),
    decreaseText: document.getElementById('decreaseText'),
    increaseText: document.getElementById('increaseText'),
    eventVisuals: document.getElementById('eventVisuals'),
    visualDialog: document.getElementById('visualDialog'),
    visualTitle: document.getElementById('visualTitle'),
    visualKicker: document.getElementById('visualKicker'),
    visualContent: document.getElementById('visualContent'),
    visualCaption: document.getElementById('visualCaption'),
    visualClose: document.getElementById('visualClose'),
    verseDialog: document.getElementById('verseDialog'),
    verseTitle: document.getElementById('verseTitle'),
    verseText: document.getElementById('verseText'),
    verseBack: document.getElementById('verseBack'),
    verseRelated: document.getElementById('verseRelated'),
    verseRelatedHeading: document.getElementById('verseRelatedHeading'),
    verseClose: document.getElementById('verseClose'),
    wordPanel: document.getElementById('wordPanel'),
    wordTitle: document.getElementById('wordTitle'),
    wordMeaning: document.getElementById('wordMeaning'),
    wordClose: document.getElementById('wordClose'),
    wordSearch: document.getElementById('wordSearch'),
    wordSuggestions: document.getElementById('wordSuggestions'),
    glossaryOpen: document.getElementById('glossaryOpen'),
  };

  // Safari and embedded browsers can deny storage access. Reading must still work.
  let savedScriptureSize = 1.05;
  try {
    const saved = Number(localStorage.getItem('scriptureSize'));
    if (Number.isFinite(saved) && saved >= .9 && saved <= 1.35) savedScriptureSize = saved;
  } catch (_) {}
  const state = {
    selectedId: location.hash.slice(1) || data.events[0].id,
    query: '',
    part: 'all',
    coverage: 'all',
    view: 'compare',
    scriptureSize: savedScriptureSize,
  };

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const glossary = window.GOSPEL_GLOSSARY || {};
  const study = window.GOSPEL_STUDY || { notes: {}, related: {} };
  const classicCommentary = window.GOSPEL_CLASSIC_COMMENTARY || {};
  const calvinCommentary = window.GOSPEL_CALVIN_COMMENTARY || {};
  const bookCodes = { Matthew: 'MAT', Mark: 'MAR', Luke: 'LUK', John: 'JOH' };
  const verseReferences = window.GOSPEL_VERSE_REFERENCES || {};
  const verseText = window.GOSPEL_VERSE_TEXT || {};
  const bookNames = window.GOSPEL_BOOK_NAMES || {};
  const formatVerse = (key) => {
    const [book, chapter, verse] = key.split(' ');
    return `${bookNames[book] || book} ${chapter}:${verse}`;
  };
  const scriptureHtml = (text, book, reference) => {
    const start = reference.match(/(\d+):(\d+)/);
    let chapter = start ? Number(start[1]) : 1;
    let previousVerse = start ? Number(start[2]) - 1 : 0;
    const wordify = (piece) => piece.split(/([A-Za-z]+(?:['’][A-Za-z]+)*)/g).map((part, wordIndex) => {
      if (wordIndex % 2 === 0) return escapeHtml(part);
      if (!Object.prototype.hasOwnProperty.call(glossary, part.toLowerCase())) return escapeHtml(part);
      return `<button type="button" class="scripture-word" data-word="${escapeHtml(part)}" aria-label="Meaning of ${escapeHtml(part)}">${escapeHtml(part)}</button>`;
    }).join('');
    const pieces = text.split(/(\b\d{1,3}(?=\s+[A-Z]))/g);
    let output = '', currentKey = '';
    const closeVerse = () => currentKey ? `${window.VERSE_CONTEXT?.[currentKey] ? `<button type="button" class="verse-context-button" data-context-action="${escapeHtml(currentKey)}" aria-label="Context for ${escapeHtml(formatVerse(currentKey))}">Context</button>` : ''}<button type="button" class="verse-actions" data-verse-action="${escapeHtml(currentKey)}" aria-label="Highlight or share ${escapeHtml(formatVerse(currentKey))}">•••</button></span>` : '';
    pieces.forEach((piece, index) => {
      if (index % 2 === 0) { output += wordify(currentKey && window.BibleTranslation?.current !== 'KJV' && window.BibleTranslation ? ' '+(verseText[currentKey] || '')+' ' : piece); return; }
      const number = Number(piece);
      if (number < previousVerse) chapter++;
      previousVerse = number;
      output += closeVerse();
      currentKey = `${bookCodes[book] || ''} ${chapter} ${number}`;
      const numberHtml = verseReferences[currentKey]?.length ? `<button type="button" class="verse-number verse-link" data-verse-ref="${escapeHtml(currentKey)}" aria-label="Cross-references for ${escapeHtml(formatVerse(currentKey))}">${number}</button>` : `<span class="verse-number">${number}</span>`;
      output += `<span class="scripture-verse" data-scripture-key="${escapeHtml(currentKey)}" data-share-text="${escapeHtml(verseText[currentKey] || '')}">${numberHtml}`;
    });
    return output + closeVerse();
  };
  const coverageCount = (event) => gospels.filter((g) => event.accounts[g].recorded).length;
  const hasVisuals = (event) => Boolean(visuals.images[event.id] || visuals.events[event.id]);

  function matchesCoverage(event) {
    const recorded = gospels.filter((g) => event.accounts[g].recorded);
    if (state.coverage === 'all') return true;
    if (state.coverage === 'all-four') return recorded.length === 4;
    if (state.coverage === 'synoptic') return ['Matthew', 'Mark', 'Luke'].every((g) => event.accounts[g].recorded);
    if (state.coverage === 'unique') return recorded.length === 1;
    if (state.coverage === 'visual') return hasVisuals(event);
    return true;
  }

  function filteredEvents() {
    const query = state.query.trim().toLowerCase();
    return data.events.filter((event) => {
      if (state.part !== 'all' && event.part !== state.part) return false;
      if (!matchesCoverage(event)) return false;
      if (!query) return true;
      const haystack = [event.number, event.title, event.part, event.summary]
        .concat(gospels.flatMap((g) => [event.accounts[g].reference, event.accounts[g].text]))
        .join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  function populateParts() {
    [...new Set(data.events.map((event) => event.part).filter(Boolean))].forEach((part) => {
      const option = document.createElement('option');
      option.value = part;
      option.textContent = part.replace(/^Part ([IVXLCDM]+)\s+/, 'Part $1 — ');
      els.partSelect.append(option);
    });
  }

  function renderEventList() {
    const events = filteredEvents();
    els.resultsMeta.textContent = `${events.length} of ${data.eventCount} events`;
    if (!events.length) {
      els.eventList.innerHTML = '<div class="empty-list">No events match this search.</div>';
      return;
    }
    els.eventList.innerHTML = events.map((event) => {
      const dots = gospels.map((g) => `<span class="mini-dot ${event.accounts[g].recorded ? 'on' : ''}" title="${g}"></span>`).join('');
      return `<button class="event-link ${event.id === state.selectedId ? 'active' : ''}" data-id="${event.id}">
        <span class="index">${escapeHtml(event.number)}</span>
        <span class="label">${escapeHtml(event.title)}</span>
        <span class="mini-coverage" aria-hidden="true">${dots}</span>
      </button>`;
    }).join('');
  }

  function cardHtml(account) {
    const missing = !account.recorded;
    return `<article class="gospel-card ${missing ? 'not-recorded' : ''}">
      <header class="card-head">
        <span class="gospel-name">${escapeHtml(account.book)}</span>
        <span class="reference">${escapeHtml(account.reference)}</span>
      </header>
      <div class="card-body"><p class="scripture">${missing ? escapeHtml(account.text) : scriptureHtml(account.text, account.book, account.reference)}</p></div>
    </article>`;
  }

  function renderVisuals(event) {
    const image = visuals.images[event.id];
    const map = visuals.events[event.id];
    els.eventVisuals.hidden = !image && !map;
    if (!image && !map) { els.eventVisuals.innerHTML = ''; return; }
    els.eventVisuals.innerHTML = `<div class="visual-label">Explore this event</div><div class="visual-cards">
      ${image ? `<button class="visual-card" type="button" data-visual="image"><img src="${escapeHtml(image.src)}" alt="" loading="lazy"><span><strong>View illustration</strong><small>${image.kind === 'parable' ? 'Illustration of a parable' : 'Artist’s interpretation'}</small></span></button>` : ''}
      ${map ? `<button class="visual-card visual-map-card" type="button" data-visual="map"><span class="map-symbol" aria-hidden="true">⌖</span><span><strong>View study map</strong><small>${escapeHtml(visuals.places[map[1]].name)}</small></span></button>` : ''}
    </div>`;
  }

  function renderStudy(event) {
    const parallels = gospels.filter((g) => event.accounts[g].recorded).map((g) =>
      `<button type="button" class="reference-link" data-gospel="${g}"><strong>${g} ${escapeHtml(event.accounts[g].reference)}</strong><span>Read this account</span></button>`);
    const additional = event.supplemental.map((item) => `<span class="reference-text">${escapeHtml(item.book)} ${escapeHtml(item.reference)} <small>Supplemental witness below</small></span>`);
    const related = (study.related[event.id] || []).map(([id, description]) => {
      const target = data.events.find((item) => item.id === id);
      return target ? `<button type="button" class="reference-link" data-related="${escapeHtml(id)}"><strong>${escapeHtml(target.title)}</strong><span>${escapeHtml(description)} · Event ${escapeHtml(target.number)}</span></button>` : '';
    });
    els.crossReferences.innerHTML = `<h3>Passages for this event</h3><div class="reference-list">${[...parallels, ...additional].join('') || '<p>No Gospel account; see the supplemental witness below.</p>'}</div>${related.length ? `<h3>Related events</h3><div class="reference-list">${related.join('')}</div>` : ''}`;
    const henry = classicCommentary[event.id];
    const calvin = calvinCommentary[event.id];
    els.commentaryColumn.hidden = !henry && !calvin;
    const excerpt = (value) => {
      const words = value.split(/\s+/).slice(0, 85).join(' ');
      const end = words.lastIndexOf('. ');
      return end > 160 ? words.slice(0, end + 1) : `${words}…`;
    };
    els.studyCommentary.innerHTML = [henry && `<article class="historical-entry"><h3>${escapeHtml(henry.author)}</h3><p class="commentary-source">${escapeHtml(henry.work)} · ${escapeHtml(henry.passage)}</p><p>${escapeHtml(excerpt(henry.text))}</p><details><summary>Read the full selection</summary><p>${escapeHtml(henry.text)}</p></details><a href="${escapeHtml(henry.source)}" target="_blank" rel="noopener noreferrer">View source ↗</a></article>`, calvin && `<article class="historical-entry"><h3>${escapeHtml(calvin.author)}</h3><p class="commentary-source">${escapeHtml(calvin.work)} · ${escapeHtml(calvin.passage)}</p><p>${escapeHtml(calvin.text)}</p><a href="${escapeHtml(calvin.source)}" target="_blank" rel="noopener noreferrer">View source ↗</a></article>`].filter(Boolean).join('') + '<p class="commentary-disclaimer">Historical writers offer interpretations of the passages; their words are separate from the Gospel text.</p>';
  }

  function mapHtml(mapKey, focusKey) {
    const region = visuals.maps[mapKey];
    const [south, north, west, east] = region.bounds;
    const position = (place) => ({
      x: Math.round(75 + (place.lon - west) / (east - west) * 570),
      y: Math.round(55 + (north - place.lat) / (north - south) * 340),
    });
    const marked = [...new Set([...region.labels, focusKey])];
    const water = ['overview', 'galilee', 'north'].includes(mapKey) ? (() => {
      const center = position(visuals.places.lake);
      return `<ellipse cx="${center.x}" cy="${center.y}" rx="${mapKey === 'overview' ? 13 : 37}" ry="${mapKey === 'overview' ? 22 : 75}" fill="#9ac9d9" stroke="#72a9c0" stroke-width="2"/>`;
    })() : '';
    const markers = marked.map((key) => {
      const place = visuals.places[key];
      const { x, y } = position(place);
      const current = key === focusKey;
      const labelX = x > 485 ? x - 10 : x + 10;
      const labelY = key === 'bethlehem' ? y + 18 : key === 'bethany' ? y - 11 : y - 10;
      const anchor = x > 485 ? 'end' : 'start';
      return `<g><circle cx="${x}" cy="${y}" r="${current ? 11 : 6}" fill="${current ? '#c2892f' : '#254e72'}" stroke="#fff" stroke-width="3"/><text x="${labelX}" y="${labelY}" text-anchor="${anchor}" class="map-label ${current ? 'current' : ''}">${escapeHtml(place.name)}</text></g>`;
    }).join('');
    return `<svg class="study-map" viewBox="0 0 720 460" role="img" aria-label="Schematic map of ${escapeHtml(region.title)} highlighting ${escapeHtml(visuals.places[focusKey].name)}">
      <defs><linearGradient id="mapLand" x2="1" y2="1"><stop stop-color="#eef2e6"/><stop offset="1" stop-color="#dbe4d2"/></linearGradient></defs>
      <rect width="720" height="460" rx="14" fill="url(#mapLand)"/>
      <path d="M90 102H630M90 182H630M90 262H630M90 342H630M180 42V415M360 42V415M540 42V415" stroke="#b9c8b6" opacity=".55" stroke-width="1"/>
      ${water}${markers}<text x="35" y="40" class="map-north">N ↑</text><text x="35" y="437" class="map-small">Approximate orientation · no exact event site or route</text>
    </svg>`;
  }

  function openVisual(kind) {
    const event = data.events.find((item) => item.id === state.selectedId);
    const image = visuals.images[event.id];
    const map = visuals.events[event.id];
    if (kind === 'image' && image) {
      els.visualKicker.textContent = `Event ${event.number} · Illustration`;
      els.visualTitle.textContent = image.title;
      els.visualContent.innerHTML = `<img class="visual-large" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}">`;
      els.visualCaption.textContent = image.kind === 'parable' ? 'Illustration of Jesus’ parable; the scene is part of his teaching.' : 'Artist’s interpretation for study; it is not a historical photograph.';
    } else if (kind === 'map' && map) {
      els.visualKicker.textContent = `Event ${event.number} · Study map`;
      els.visualTitle.textContent = visuals.maps[map[0]].title;
      els.visualContent.innerHTML = mapHtml(map[0], map[1]);
      els.visualCaption.innerHTML = `${escapeHtml(map[2])} The map is schematic and does not identify exact archaeological sites or routes. <a href="https://www.churchofjesuschrist.org/study/scriptures/bible-maps/map-11?lang=eng" target="_blank" rel="noopener noreferrer">Historical map reference ↗</a>`;
    } else return;
    els.visualDialog.showModal();
  }

  let originVerse = '';
  function showVerse(key, keepOrigin = false) {
    if (!verseText[key]) return;
    if (!keepOrigin) originVerse = key;
    els.verseTitle.textContent = formatVerse(key);
    els.verseText.textContent = verseText[key];
    els.verseBack.innerHTML = key !== originVerse ? `<button type="button" class="verse-back-link" data-open-verse="${escapeHtml(originVerse)}">← Back to ${escapeHtml(formatVerse(originVerse))}</button>` : '';
    const links = verseReferences[key] || [];
    els.verseRelatedHeading.hidden = links.length === 0;
    els.verseRelated.innerHTML = links.map((ref) => `<button type="button" class="verse-result" data-open-verse="${escapeHtml(ref)}"><strong>${escapeHtml(formatVerse(ref))}</strong><span>${escapeHtml(verseText[ref] || '')}</span></button>`).join('');
    if (!els.verseDialog.open) els.verseDialog.showModal();
  }

  // Land on the event heading itself. The reader's top carries injected
  // bars (welcome, verse of the day, journey pill, film strip), so scrolling
  // to the reader container still opens on homepage furniture — aim at the
  // title, offset for the fixed header.
  const landOnPassages = (behavior) => {
    const y = els.eventTitle.getBoundingClientRect().top + window.scrollY - 132;
    window.scrollTo({ top: Math.max(0, y), behavior: behavior || 'auto' });
  };

  function renderReader({ focus = false } = {}) {
    closeWordPanel();
    window.StudyTools.close();
    if (els.visualDialog.open) els.visualDialog.close();
    if (els.verseDialog.open) els.verseDialog.close();
    let index = data.events.findIndex((event) => event.id === state.selectedId);
    if (index < 0) { index = 0; state.selectedId = data.events[0].id; }
    const event = data.events[index];
    els.eventPart.textContent = event.part.replace(/^Part ([IVXLCDM]+)\s+/, 'Part $1 — ');
    els.eventNumber.textContent = `Event ${event.number} of ${data.eventCount}`;
    els.eventTitle.textContent = event.title;
    els.eventSummary.textContent = event.summary || 'Compare how the four Gospels record this event.';
    renderVisuals(event);
    renderStudy(event);
    els.coverageBadges.innerHTML = gospels.map((g) => `<span class="coverage-badge ${event.accounts[g].recorded ? 'on' : ''}">${g}</span>`).join('');

    [...els.viewTabs.querySelectorAll('.view-tab')].forEach((tab) => {
      const view = tab.dataset.view;
      const unavailable = view !== 'compare' && !event.accounts[view].recorded;
      tab.classList.toggle('active', view === state.view);
      tab.classList.toggle('unavailable', unavailable);
      tab.setAttribute('aria-selected', String(view === state.view));
    });

    if (state.view === 'compare') {
      els.comparisonGrid.classList.remove('single');
      els.comparisonGrid.innerHTML = gospels.map((g) => cardHtml(event.accounts[g])).join('');
    } else {
      els.comparisonGrid.classList.add('single');
      els.comparisonGrid.innerHTML = cardHtml(event.accounts[state.view]);
    }

    if (event.supplemental.length) {
      els.supplemental.hidden = false;
      els.supplementalContent.innerHTML = event.supplemental.map((item) => `<div class="supplemental-entry">
        <strong>${escapeHtml(item.book)} ${escapeHtml(item.reference)}</strong>
        <p class="scripture">${scriptureHtml(item.text, item.book, item.reference)}</p>
      </div>`).join('');
    } else {
      els.supplemental.hidden = true;
    }

    if (event.notes.length) {
      els.editorialNotes.hidden = false;
      els.notesList.innerHTML = event.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('');
    } else {
      els.editorialNotes.hidden = true;
    }
    window.StudyTools.apply(els.comparisonGrid);

    const previous = data.events[index - 1];
    const next = data.events[index + 1];
    els.previous.disabled = !previous;
    els.next.disabled = !next;
    els.previous.dataset.id = previous?.id || '';
    els.next.dataset.id = next?.id || '';
    els.previousLabel.textContent = previous?.title || 'Beginning of the harmony';
    els.nextLabel.textContent = next?.title || 'End of the harmony';
    document.title = `${event.number}. ${event.title} | Comparative Gospel Harmony`;
    if (location.hash.slice(1) !== event.id) history.replaceState(null, '', `#${event.id}`);
    if (focus) {
      landOnPassages('smooth');
      els.reader.focus({ preventScroll: true });
    }
  }

  function chooseEvent(id, { focus = true } = {}) {
    if (!data.events.some((event) => event.id === id)) return;
    state.selectedId = id;
    renderEventList();
    renderReader({ focus });
    closeSidebar();
  }

  function setCoverage(value) {
    state.coverage = value;
    [...els.coverageFilters.querySelectorAll('.filter-chip')].forEach((chip) => chip.classList.toggle('active', chip.dataset.filter === value));
    renderEventList();
  }

  function openSidebar() {
    els.sidebar.classList.add('open');
    els.scrim.classList.add('show');
    els.menuButton.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    els.sidebar.classList.remove('open');
    els.scrim.classList.remove('show');
    els.menuButton.setAttribute('aria-expanded', 'false');
  }

  function applyTextSize() {
    state.scriptureSize = Math.min(1.35, Math.max(.9, state.scriptureSize));
    document.documentElement.style.setProperty('--scripture-size', `${state.scriptureSize}rem`);
    try { localStorage.setItem('scriptureSize', state.scriptureSize.toFixed(2)); } catch (_) {}
  }

  function closeWordPanel() {
    els.wordPanel.hidden = true;
  }

  function showWord(word, focusSearch = false) {
    const meaning = glossary[word.toLowerCase()];
    els.wordTitle.textContent = word;
    els.wordMeaning.textContent = meaning || 'No entry yet. Try another word from the list below.';
    els.wordSearch.value = word;
    renderSuggestions(word);
    els.wordPanel.hidden = false;
    if (focusSearch) els.wordSearch.focus();
  }

  function renderSuggestions(query) {
    const term = query.trim().toLowerCase();
    const matches = Object.keys(glossary).filter((word) => !term || word.includes(term)).slice(0, 12);
    els.wordSuggestions.innerHTML = matches.map((word) => `<button type="button" data-glossary-word="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join('') || '<span>No matching glossary entries.</span>';
  }

  els.eventList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-id]');
    if (button) chooseEvent(button.dataset.id);
  });
  els.search.addEventListener('input', (event) => { state.query = event.target.value; renderEventList(); });
  els.partSelect.addEventListener('change', (event) => { state.part = event.target.value; renderEventList(); });
  els.coverageFilters.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (chip) setCoverage(chip.dataset.filter);
  });
  els.viewTabs.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-view]');
    if (!tab) return;
    state.view = tab.dataset.view;
    renderReader();
  });
  els.crossReferences.addEventListener('click', (event) => {
    const gospel = event.target.closest('[data-gospel]');
    if (gospel) {
      state.view = gospel.dataset.gospel;
      renderReader();
      els.comparisonGrid.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      return;
    }
    const related = event.target.closest('[data-related]');
    if (related) chooseEvent(related.dataset.related);
  });
  els.previous.addEventListener('click', () => chooseEvent(els.previous.dataset.id));
  els.next.addEventListener('click', () => chooseEvent(els.next.dataset.id));
  window.enableStudySwipe(els.reader, {
    previous: () => { if (els.previous.dataset.id) chooseEvent(els.previous.dataset.id); },
    next: () => { if (els.next.dataset.id) chooseEvent(els.next.dataset.id); },
    blocked: () => els.verseDialog.open || els.visualDialog.open || !els.wordPanel.hidden || els.sidebar.classList.contains('open'),
  });
  els.menuButton.addEventListener('click', () => els.sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
  els.scrim.addEventListener('click', closeSidebar);
  els.decreaseText.addEventListener('click', () => { state.scriptureSize -= .1; applyTextSize(); });
  els.increaseText.addEventListener('click', () => { state.scriptureSize += .1; applyTextSize(); });
  els.eventVisuals.addEventListener('click', (event) => {
    const button = event.target.closest('[data-visual]');
    if (button) openVisual(button.dataset.visual);
  });
  els.visualClose.addEventListener('click', () => els.visualDialog.close());
  els.verseClose.addEventListener('click', () => els.verseDialog.close());
  els.verseDialog.addEventListener('click', (event) => {
    if (event.target === els.verseDialog) { els.verseDialog.close(); return; }
    const link = event.target.closest('[data-open-verse]');
    if (link) showVerse(link.dataset.openVerse, true);
  });
  els.visualDialog.addEventListener('click', (event) => { if (event.target === els.visualDialog) els.visualDialog.close(); });
  document.addEventListener('click', (event) => {
    const verse = event.target.closest('[data-verse-ref]');
    if (verse) { showVerse(verse.dataset.verseRef); return; }
    const word = event.target.closest('.scripture-word');
    if (word) { showWord(word.dataset.word); return; }
    if (event.target.closest('#glossaryOpen')) return;
    if (!els.wordPanel.hidden && !els.wordPanel.contains(event.target)) closeWordPanel();
  });
  els.wordClose.addEventListener('click', closeWordPanel);
  els.glossaryOpen.addEventListener('click', () => { showWord('', true); els.wordTitle.textContent = 'Word meanings'; els.wordMeaning.textContent = 'Search above or choose a word below.'; });
  els.wordSearch.addEventListener('input', (event) => {
    const term = event.target.value.trim().toLowerCase();
    els.wordTitle.textContent = term || 'Word meanings';
    els.wordMeaning.textContent = glossary[term] || (term ? 'Select a suggested term below to see its meaning.' : 'Search above or choose a word below.');
    renderSuggestions(term);
  });
  els.wordSuggestions.addEventListener('click', (event) => {
    const button = event.target.closest('[data-glossary-word]');
    if (button) showWord(button.dataset.glossaryWord);
  });
  window.addEventListener('hashchange', () => chooseEvent(location.hash.slice(1), { focus: true }));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeWordPanel(); closeSidebar(); return; }
    if (/input|select|textarea/i.test(document.activeElement.tagName) || document.activeElement.classList.contains('scripture-word')) return;
    if (event.key === 'ArrowLeft' && els.previous.dataset.id) chooseEvent(els.previous.dataset.id);
    if (event.key === 'ArrowRight' && els.next.dataset.id) chooseEvent(els.next.dataset.id);
  });

  populateParts();
  applyTextSize();
  renderEventList();
  window.StudyTools.setup({root:els.comparisonGrid,getTitle:()=>els.eventTitle.textContent});
  renderReader();
  // Deep link (e.g. a Journey day's "Read" button): land straight on the
  // passages, not at the top of the homepage (owner directive, 2026-10-30).
  // Later scripts (welcome bar, film strip, verse of the day) inject tall
  // sections ABOVE the reader after this runs, pushing the passages down —
  // so re-land once the page settles, unless the reader starts scrolling.
  if (location.hash.length > 1 && location.hash.slice(1) === state.selectedId) {
    let userScrolled = false;
    const markScrolled = () => { userScrolled = true; };
    window.addEventListener('wheel', markScrolled, { passive: true });
    window.addEventListener('touchmove', markScrolled, { passive: true });
    const land = () => { if (!userScrolled) landOnPassages('auto'); };
    land();
    window.addEventListener('load', () => { land(); setTimeout(land, 500); setTimeout(land, 1500); });
  }
})();
