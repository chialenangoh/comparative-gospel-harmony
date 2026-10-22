(() => {
  'use strict';
  const scenes = {
    'GEN 1': ['creation', 'Creation and light', 'Genesis 1'],
    'GEN 15': ['covenant', 'Abram under the stars', 'Genesis 15'],
    'EXO 14': ['exodus', 'The crossing of the sea', 'Exodus 14'],
    '1SA 17': ['david', 'David and Goliath', '1 Samuel 17'],
    'DAN 6': ['daniel', 'Daniel in the lions’ den', 'Daniel 6']
  };
  const places = {
    Ur:[46.10,30.96], Haran:[39.03,36.87], Hebron:[35.10,31.53], Jerusalem:[35.23,31.78],
    Bethlehem:[35.20,31.70], Jericho:[35.44,31.87], Joppa:[34.75,32.05], Egypt:[31.20,30.90],
    Babylon:[44.42,32.54], Nineveh:[43.15,36.36], Susa:[48.25,32.19]
  };
  const regions = {
    patriarchs:{bounds:[33.0,48.5,29.0,38.0],places:['Ur','Haran','Hebron','Jerusalem','Babylon']},
    levant:{bounds:[29.0,37.0,29.0,34.0],places:['Egypt','Joppa','Hebron','Bethlehem','Jerusalem','Jericho']},
    empires:{bounds:[38.0,50.0,29.5,38.5],places:['Haran','Nineveh','Babylon','Susa']}
  };
  const maps = {
    'GEN 12':['patriarchs','Haran'], 'GEN 13':['levant','Hebron'], 'GEN 23':['levant','Hebron'],
    'EXO 1':['levant','Egypt'], 'EXO 12':['levant','Egypt'], 'EXO 14':['levant','Egypt'],
    'JOS 6':['levant','Jericho'], 'RUT 1':['levant','Bethlehem'], '1SA 17':['levant','Bethlehem'],
    '1KI 8':['levant','Jerusalem'], 'EZR 1':['empires','Babylon'], 'NEH 1':['empires','Susa'],
    'EST 1':['empires','Susa'], 'ISA 1':['levant','Jerusalem'], 'JER 1':['levant','Jerusalem'],
    'DAN 1':['empires','Babylon'], 'DAN 6':['empires','Babylon'], 'JON 1':['levant','Joppa']
  };
  const esc = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function entries(key) {
    const items=[];
    if (scenes[key]) { const [image,title,verse]=scenes[key]; items.push({type:'image',image,title,verse}); }
    if (maps[key]) { const [region,focus]=maps[key]; items.push({type:'map',region,focus,title:`${focus} and nearby places`}); }
    return items;
  }
  function cards(items) {
    return items.map((entry,i)=>`<button type="button" class="visual-card ${entry.type==='map'?'visual-map-card':''}" data-ot-visual="${i}" aria-label="Open ${esc(entry.title)}">${entry.type==='image'?`<img src="${window.OT_VISUAL_IMAGES[entry.image]}" alt="" loading="lazy">`:'<span class="map-symbol" aria-hidden="true">⌖</span>'}<span><strong>${esc(entry.title)}</strong><small>${entry.type==='image'?'View illustration':'Open study map'}</small></span></button>`).join('');
  }
  function mapSvg(entry) {
    const region=regions[entry.region], [west,east,south,north]=region.bounds;
    const markers=region.places.map((name,index)=>{
      const [lon,lat]=places[name], x=65+(lon-west)/(east-west)*670, y=410-(lat-south)/(north-south)*330;
      const focus=name===entry.focus, anchor=x>650?'end':'start';
      return `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${focus?9:6}" fill="${focus?'#a66424':'#174b68'}" stroke="#fff" stroke-width="3"/><text x="${(x+(anchor==='end'?-10:10)).toFixed(1)}" y="${(y+(index%2?20:-10)).toFixed(1)}" text-anchor="${anchor}" class="map-label ${focus?'current':''}">${esc(name)}</text></g>`;
    }).join('');
    return `<svg class="study-map" viewBox="0 0 800 470" role="img" aria-label="Schematic study map highlighting ${esc(entry.focus)}"><rect width="800" height="470" fill="#dce9e8"/><path d="M0 305 Q170 270 300 310 T540 290 T800 260 L800 470 H0Z" fill="#e8dfc6" opacity=".7"/><text x="35" y="42" class="map-north">N ↑</text><text x="35" y="450" class="map-small">Approximate positions · no event site or route is claimed</text>${markers}</svg>`;
  }
  function show(entry,els) {
    els.title.textContent=entry.title;
    els.kicker.textContent=entry.type==='image'?'Illustration':'Study map';
    els.body.innerHTML=entry.type==='image'?`<img class="visual-large" src="${window.OT_VISUAL_IMAGES[entry.image]}" alt="Artist’s interpretation of ${esc(entry.title)}">`:mapSvg(entry);
    els.caption.textContent=entry.type==='image'?`${entry.verse} · Original interpretive artwork; visual details are not a historical reconstruction.`:`Approximate positions of named places. ${entry.focus} is highlighted. This schematic map does not establish an exact event site or travel route.`;
    els.dialog.showModal();
  }
  window.OT_STUDY_VISUALS={entries,cards,show,regions,places};
})();
