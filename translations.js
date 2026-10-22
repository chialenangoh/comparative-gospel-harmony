(() => {
 'use strict';
 const versions={KJV:'King James Version',WEB:'World English Bible',ASV:'American Standard Version (1901)',ES:'Reina-Valera (1909)',FR:'Louis Segond (1910)'};
 let preferred='KJV';try{preferred=localStorage.getItem('bible-translation')||'KJV';}catch{}
 const requested=new URLSearchParams(location.search).get('translation');const current=Object.hasOwn(versions,requested)?requested:Object.hasOwn(versions,preferred)?preferred:'KJV';
 const dict=window.BIBLE_TRANSLATIONS?.[current];
 window.BibleTranslation={current,name:versions[current]};
 if(current!=='KJV'&&dict){
  const codes=Object.keys(window.GOSPEL_BOOK_NAMES),ot=new Set(codes.slice(0,39));
  for(const name of ['GOSPEL_VERSE_TEXT','OT_VERSE_TEXT','NT_VERSE_TEXT']){if(!window[name])continue;const old=window[name],selected={};for(const key of Object.keys(old))selected[key]=dict[key]||`[Verse ${key.split(' ').slice(1).join(':')} is not supplied in this ${current} edition.]`;for(const [key,value] of Object.entries(dict))if(name==='GOSPEL_VERSE_TEXT'||(name==='OT_VERSE_TEXT'?ot.has(key.split(' ')[0]):!ot.has(key.split(' ')[0])))selected[key]=value;window[name]=selected;}
  const chapterMax={};for(const key of Object.keys(dict)){const [code,c,v]=key.split(' '),id=code+' '+c;chapterMax[id]=Math.max(chapterMax[id]||0,Number(v));}
  for(const books of [window.OT_BOOKS,window.NT_BOOKS])if(books)for(const book of books)for(let c=1;c<=book.chapters.length;c++)book.chapters[c-1]=Math.max(book.chapters[c-1],chapterMax[book.code+' '+c]||0);
 }
 function ready(){
  const root=document.querySelector('.reader-inner')||document.querySelector('.search-page');if(!root)return;
  const panel=document.createElement('section');panel.className='translation-picker';panel.setAttribute('aria-label','Bible translation');
  panel.innerHTML='<label for="bibleTranslation">Bible translation</label><select id="bibleTranslation">'+Object.entries(versions).map(([id,name])=>`<option value="${id}" ${id===current?'selected':''}>${id} — ${name}</option>`).join('')+'</select><small id="translationInfo"></small><details><summary>About these translations</summary><p>WEB provides modern English; ASV preserves the wording of its 1901 translation. All are public-domain texts — including the Reina-Valera (1909) in Spanish and the Louis Segond (1910) in French, digital texts from ebible.org. Verse numbering and the inclusion of some verses differ between editions. Missing verses are labeled rather than replaced with KJV wording.</p><p>Commentaries and footnotes retain their original quotations and may discuss KJV wording.</p><a href="https://github.com/TehShrike/world-english-bible" target="_blank" rel="noopener noreferrer">WEB digital text source</a> · <a href="https://github.com/openbibleinfo/American-Standard-Version-Bible" target="_blank" rel="noopener noreferrer">ASV digital text source</a><p>NIV and ESV are not included in this edition.</p></details>';
  root.prepend(panel);panel.querySelector('small').textContent=`Reading ${versions[current]} (${current}). Search, audio, and sharing use this version. Changing versions reloads the page.`;
  panel.querySelector('select').onchange=e=>{const url=new URL(location.href);url.searchParams.set('translation',e.target.value);try{localStorage.setItem('bible-translation',e.target.value);}catch{}location.assign(url.href);};
  const replaceLabels=node=>{const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);const list=[];while(walker.nextNode()){const n=walker.currentNode;if(!n.parentElement.closest('script,style,textarea,.scripture-verse,[data-scripture-key],.footnote-dialog,.nt-commentary,.study-panel,.translation-picker,#wordPanel'))list.push(n);}for(const n of list)if(/King James Version|\bKJV\b/.test(n.nodeValue))n.nodeValue=n.nodeValue.replaceAll('King James Version',versions[current]).replace(/\bKJV\b/g,current);};
  if(current!=='KJV')replaceLabels(document.body);
  // Explicit query parameters carry the choice even when browser preferences are blocked.
  document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.target==='_blank')return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&/\/(index|old-testament|new-testament|acts-harmony|search)\.html$/.test(url.pathname)){url.searchParams.set('translation',current);a.href=url.href;}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
