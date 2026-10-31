(() => {
  'use strict';
  const events = window.ACTS_EVENTS;
  const bible = window.NT_VERSE_TEXT;
  const names = window.GOSPEL_BOOK_NAMES;
  const references = { ...window.GOSPEL_VERSE_REFERENCES, ...window.NT_VERSE_REFERENCES };
  const henry = window.NT_HENRY;
  const glossary = window.GOSPEL_GLOSSARY || {};
  const $ = (id) => document.getElementById(id);
  const els = Object.fromEntries(['sidebar','scrim','menuButton','eventSearch','eventCount','eventList','reader','eventNumber','eventTitle','eventSummary','eventPassages','eventCommentary','previousEvent','nextEvent','eventVisuals','ntVisualDialog','ntVisualKicker','ntVisualTitle','ntVisualBody','ntVisualCaption','ntVisualClose','glossaryOpen','wordPanel','wordClose','wordSearch','wordSuggestions','wordTitle','wordMeaning','verseDialog','verseTitle','verseText','verseBack','verseRelatedHeading','verseRelated','verseMore','verseClose'].map((id) => [id,$(id)]));
  const esc = (v) => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const sourceLink = (entry, label) => /^https?:\/\//i.test((entry && entry.source) || '')
    ? `<a class="source-link" href="${esc(entry.source)}" target="_blank" rel="noopener noreferrer">${label}</a>` : '';
  const fmt = (key) => { const [code,ch,v] = key.split(' '); return `${names[code] || code} ${ch}:${v}`; };
  let selected = Math.max(0, events.findIndex((event) => `#${event.id}` === location.hash));
  let origin = '',current = '',expanded = false, activeVisuals = [];

  function words(s) {
    return s.split(/([A-Za-z]+(?:['’][A-Za-z]+)*)/g).map((p,i) => {
      if (i%2===0 || !Object.prototype.hasOwnProperty.call(glossary,p.toLowerCase())) return esc(p);
      return `<button type="button" class="scripture-word" data-word="${esc(p)}" aria-label="Meaning of ${esc(p)}">${esc(p)}</button>`;
    }).join('');
  }
  function passage(ref, label, kind) {
    const code = Object.keys(names).find((key) => names[key] === ref.book);
    const title = `${ref.book} ${ref.chapter}:${ref.start}–${ref.end}`;
    const content = Array.from({length:ref.end-ref.start+1},(_,i) => {
      const v=ref.start+i,key=`${code} ${ref.chapter} ${v}`;
      return `<p class="nt-verse scripture-verse" data-scripture-key="${esc(key)}" data-share-text="${esc(bible[key]||'')}"><button type="button" class="verse-number verse-link" data-verse-ref="${esc(key)}" aria-label="Cross-references for ${esc(fmt(key))}">${v}</button> ${words(bible[key]||'')} ${window.VERSE_CONTEXT?.[key] ? `<button type="button" class="verse-context-button" data-context-action="${esc(key)}" aria-label="Context for ${esc(fmt(key))}">Context</button>` : ''}<button type="button" class="verse-actions" data-verse-action="${esc(key)}" aria-label="Highlight or share ${esc(fmt(key))}">•••</button></p>`;
    }).join('');
    return `<article class="acts-card ${kind}"><header><span>${esc(label)}</span><strong>${esc(title)}</strong></header><div>${content}</div></article>`;
  }
  function renderList() {
    const query=els.eventSearch.value.trim().toLowerCase();
    const matched=events.filter((e)=>`${e.title} Acts ${e.chapter}:${e.start}`.toLowerCase().includes(query));
    els.eventCount.textContent=`${matched.length} of ${events.length} events · Acts 1–28`;
    els.eventList.innerHTML=matched.map((e)=>`<button type="button" class="event-link ${e.id===events[selected].id?'active':''}" data-event="${esc(e.id)}"><span class="index">${e.chapter}:${e.start}</span><span class="label">${esc(e.title)}</span></button>`).join('')||'<div class="empty-list">No events match.</div>';
  }
  function renderCommentary(event) {
    const entry=henry[`ACT ${event.chapter}`];
    const sections=entry.sections.filter((part)=>part.from<=event.end&&part.to>=event.start);
    els.eventCommentary.innerHTML=`<div class="nt-author">Matthew Henry <small>Concise Commentary on Acts ${event.chapter}</small></div>${sections.map((part,i)=>`<details class="nt-section" ${i===0?'open':''}><summary>Acts ${event.chapter}:${esc(part.heading.replace(/^Verses? /,''))}</summary><p>${esc(part.text)}</p></details>`).join('')}${sourceLink(entry, 'View source ↗')}`;
  }
  function closeSidebar(){els.sidebar.classList.remove('open');els.scrim.classList.remove('show');els.menuButton.setAttribute('aria-expanded','false');}
  function render(focus=false) {
    window.StudyTools.close();
    const e=events[selected];
    els.eventNumber.textContent=`Event ${selected+1} of ${events.length} · Acts ${e.chapter}:${e.start}–${e.end}`;
    els.eventTitle.textContent=e.title;
    const parallels=window.ACTS_PARALLELS[e.id]||[],related=window.ACTS_RELATED[e.id]||[];
    els.eventSummary.textContent=parallels.length?'Compare the narration with another account of the same event.':'Read this passage, then explore its linked verses and commentary.';
    els.eventPassages.innerHTML=passage({book:'Acts',chapter:e.chapter,start:e.start,end:e.end},'Acts narrative','acts-primary')+parallels.map((p)=>passage(p,p.label,'acts-parallel')).join('')+(related.length?`<div class="acts-related"><h2>Related passages</h2>${related.map((p)=>passage(p,p.label,'acts-context')).join('')}</div>`:'');
    window.StudyTools.apply(els.eventPassages);
    activeVisuals=window.NT_STUDY_VISUALS.entries(`ACT ${e.chapter}`,e.id);
    els.eventVisuals.hidden=!activeVisuals.length;
    els.eventVisuals.innerHTML=activeVisuals.length?'<div class="visual-label">Explore this passage</div><div class="visual-cards">'+window.NT_STUDY_VISUALS.cards(activeVisuals)+'</div>':'';
    renderCommentary(e);renderList();
    els.previousEvent.disabled=selected===0;els.nextEvent.disabled=selected===events.length-1;
    document.title=`${e.title} | Acts Event Harmony`;
    if(location.hash!==`#${e.id}`)history.replaceState(null,'',`#${e.id}`);
    if(els.verseDialog.open)els.verseDialog.close();if(els.ntVisualDialog.open)els.ntVisualDialog.close();els.wordPanel.hidden=true;closeSidebar();
    if(focus){window.scrollTo({top:0,behavior:'smooth'});els.reader.focus({preventScroll:true});}
  }
  function go(index){if(index<0||index>=events.length)return;selected=index;render(true);}
  function showVerse(key,keep=false){
    if(!bible[key])return;if(!keep){origin=key;expanded=false;}current=key;
    els.verseTitle.textContent=fmt(key);els.verseText.textContent=bible[key];
    els.verseBack.innerHTML=key===origin?'':`<button type="button" class="verse-back-link" data-open-verse="${esc(origin)}">← Back to ${esc(fmt(origin))}</button>`;
    const links=references[key]||[];els.verseRelatedHeading.hidden=!links.length;
    els.verseRelated.innerHTML=links.slice(0,expanded?links.length:16).map((ref)=>`<button type="button" class="verse-result" data-open-verse="${esc(ref)}"><strong>${esc(fmt(ref))}</strong><span>${esc(bible[ref]||'')}</span></button>`).join('');
    els.verseMore.hidden=expanded||links.length<=16;els.verseMore.textContent=`Show all ${links.length} references`;
    if(!els.verseDialog.open)els.verseDialog.showModal();
  }
  function suggestions(q){const term=q.trim().toLowerCase();els.wordSuggestions.innerHTML=Object.keys(glossary).filter((v)=>!term||v.includes(term)).slice(0,12).map((v)=>`<button type="button" data-glossary-word="${esc(v)}">${esc(v)}</button>`).join('')||'<span>No matching entries.</span>';}
  function showWord(w){els.wordTitle.textContent=w||'Word meanings';els.wordMeaning.textContent=glossary[w.toLowerCase()]||(w?'No entry yet. Try another word.':'Search above or choose a word below.');els.wordSearch.value=w;suggestions(w);els.wordPanel.hidden=false;}
  els.eventVisuals.addEventListener('click',(event)=>{const b=event.target.closest('[data-nt-visual]');if(b)window.NT_STUDY_VISUALS.show(activeVisuals[Number(b.dataset.ntVisual)],{dialog:els.ntVisualDialog,title:els.ntVisualTitle,kicker:els.ntVisualKicker,body:els.ntVisualBody,caption:els.ntVisualCaption});});
  els.ntVisualClose.addEventListener('click',()=>els.ntVisualDialog.close());
  els.ntVisualDialog.addEventListener('click',(event)=>{if(event.target===els.ntVisualDialog)els.ntVisualDialog.close();});
  els.eventSearch.addEventListener('input',renderList);
  els.eventList.addEventListener('click',(ev)=>{const b=ev.target.closest('[data-event]');if(b)go(events.findIndex((e)=>e.id===b.dataset.event));});
  els.previousEvent.addEventListener('click',()=>go(selected-1));els.nextEvent.addEventListener('click',()=>go(selected+1));
  window.enableStudySwipe(els.reader, {
    previous: () => go(selected-1), next: () => go(selected+1),
    blocked: () => els.verseDialog.open || els.ntVisualDialog.open || !els.wordPanel.hidden || els.sidebar.classList.contains('open'),
  });
  els.menuButton.addEventListener('click',()=>{const open=!els.sidebar.classList.contains('open');els.sidebar.classList.toggle('open',open);els.scrim.classList.toggle('show',open);els.menuButton.setAttribute('aria-expanded',String(open));});
  els.scrim.addEventListener('click',closeSidebar);
  els.verseClose.addEventListener('click',()=>els.verseDialog.close());
  els.verseMore.addEventListener('click',()=>{expanded=true;showVerse(current,true);});
  els.verseDialog.addEventListener('click',(ev)=>{if(ev.target===els.verseDialog){els.verseDialog.close();return;}const b=ev.target.closest('[data-open-verse]');if(b){expanded=false;showVerse(b.dataset.openVerse,true);}});
  els.glossaryOpen.addEventListener('click',()=>{showWord('');els.wordSearch.focus();});els.wordClose.addEventListener('click',()=>{els.wordPanel.hidden=true;});
  els.wordSearch.addEventListener('input',(ev)=>{const q=ev.target.value.trim().toLowerCase();els.wordTitle.textContent=q||'Word meanings';els.wordMeaning.textContent=glossary[q]||(q?'Select a suggested word below.':'Search above or choose a word below.');suggestions(q);});
  els.wordSuggestions.addEventListener('click',(ev)=>{const b=ev.target.closest('[data-glossary-word]');if(b)showWord(b.dataset.glossaryWord);});
  document.addEventListener('click',(ev)=>{const v=ev.target.closest('[data-verse-ref]');if(v){showVerse(v.dataset.verseRef);return;}const w=ev.target.closest('[data-word]');if(w)showWord(w.dataset.word);});
  window.addEventListener('hashchange',()=>{const i=events.findIndex((e)=>`#${e.id}`===location.hash);if(i>=0){selected=i;render();}});
  window.StudyTools.setup({root:els.eventPassages,getTitle:()=>els.eventTitle.textContent});
  render();
})();
