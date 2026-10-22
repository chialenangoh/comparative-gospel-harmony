(() => {
  'use strict';
  const places = {
    Jerusalem:[35.23,31.78], Caesarea:[34.89,32.50], Joppa:[34.75,32.05], Samaria:[35.29,32.21], Damascus:[36.29,33.51], Antioch:[36.16,36.20], Cyprus:[33.37,35.17],
    Philippi:[24.29,41.01], Thessalonica:[22.94,40.64], Berea:[22.20,40.52], Athens:[23.73,37.98], Corinth:[22.93,37.94], Ephesus:[27.34,37.94], Miletus:[27.28,37.53], Troas:[26.16,39.76], Malta:[14.51,35.90], Rome:[12.50,41.90], Crete:[24.90,35.24],
    Patmos:[26.55,37.31], Smyrna:[27.14,38.42], Pergamum:[27.18,39.12], Thyatira:[27.84,38.92], Sardis:[28.04,38.49], Philadelphia:[28.52,38.35], Laodicea:[29.10,37.84]
  };
  const regions = {
    judea:{bounds:[34.1,36.9,30.8,33.9],places:['Jerusalem','Caesarea','Joppa','Samaria','Damascus']},
    levant:{bounds:[32.3,37.4,30.5,37.2],places:['Jerusalem','Caesarea','Damascus','Antioch','Cyprus']},
    aegean:{bounds:[21.4,28.3,37.0,42.0],places:['Philippi','Thessalonica','Berea','Athens','Corinth','Ephesus','Miletus','Troas']},
    mediterranean:{bounds:[11.2,37.2,31.0,43.0],places:['Rome','Malta','Crete','Cyprus','Caesarea']},
    asia:{bounds:[25.6,29.9,36.7,39.8],places:['Patmos','Ephesus','Smyrna','Pergamum','Thyatira','Sardis','Philadelphia','Laodicea']}
  };
  const scenes = {
    'ACT 2':{image:'pentecost',title:'Pentecost in Jerusalem',verse:'Acts 2:1–13'},
    'ACT 7':{image:'stephen',title:'Stephen before the council',verse:'Acts 7:54–60'},
    'ACT 9':{image:'damascus',title:'Saul on the road to Damascus',verse:'Acts 9:1–19'},
    'ACT 10':{image:'cornelius',title:'Peter visits Cornelius',verse:'Acts 10:24–48'},
    'ACT 16':{image:'philippi',title:'Paul and Silas in Philippi',verse:'Acts 16:16–40'},
    'ACT 17':{image:'athens',title:'Paul speaks in Athens',verse:'Acts 17:16–34'},
    'ACT 27':{image:'shipwreck',title:'The voyage and shipwreck',verse:'Acts 27:27–44'},
    'REV 1':{image:'revelation-lampstands',title:'John’s vision of the lampstands',verse:'Revelation 1:9–20',symbolic:true},
    'REV 4':{image:'revelation-throne',title:'The throne vision',verse:'Revelation 4',symbolic:true},
    'REV 21':{image:'new-jerusalem',title:'The New Jerusalem',verse:'Revelation 21',symbolic:true}
  };
  const maps = {
    'ACT 1':['judea','Jerusalem'], 'ACT 2':['judea','Jerusalem'], 'ACT 7':['judea','Jerusalem'], 'ACT 8':['judea','Samaria'], 'ACT 9':['levant','Damascus'], 'ACT 10':['judea','Caesarea'], 'ACT 11':['levant','Antioch'], 'ACT 13':['levant','Cyprus'], 'ACT 15':['levant','Jerusalem'],
    'ACT 16':['aegean','Philippi'], 'ACT 17':['aegean','Athens'], 'ACT 18':['aegean','Corinth'], 'ACT 19':['aegean','Ephesus'], 'ACT 20':['aegean','Miletus'], 'ACT 21':['judea','Jerusalem'], 'ACT 23':['judea','Caesarea'], 'ACT 24':['judea','Caesarea'], 'ACT 25':['judea','Caesarea'], 'ACT 26':['judea','Caesarea'], 'ACT 27':['mediterranean','Malta'], 'ACT 28':['mediterranean','Rome'],
    'REV 1':['asia','Patmos'], 'REV 2':['asia','Ephesus'], 'REV 3':['asia','Philadelphia'],
    'ROM 1':['mediterranean','Rome'], '1CO 1':['aegean','Corinth'], '2CO 1':['aegean','Corinth'], 'EPH 1':['aegean','Ephesus'], 'PHP 1':['aegean','Philippi'], '1TH 1':['aegean','Thessalonica'], '2TH 1':['aegean','Thessalonica']
  };
  const eventScenes = {'acts-4':'ACT 2','acts-19':'ACT 7','acts-23':'ACT 9','acts-28':'ACT 10','acts-46':'ACT 16','acts-49':'ACT 17','acts-74':'ACT 27'};
  const eventMaps = {'acts-4':'Jerusalem','acts-19':'Jerusalem','acts-23':'Damascus','acts-28':'Caesarea','acts-46':'Philippi','acts-49':'Athens','acts-74':'Malta'};
  const escape = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function entries(chapterKey,eventId) {
    const result=[];
    const scene=scenes[eventId ? eventScenes[eventId] : chapterKey];
    if(scene) result.push({type:'image',...scene});
    let map=maps[chapterKey];
    if(eventId && eventMaps[eventId]) map=[map?.[0]||'judea',eventMaps[eventId]];
    if(map) result.push({type:'map',region:map[0],focus:map[1],title:map[0]==='asia'?'Patmos and the seven churches':`${map[1]} in its region`});
    return result;
  }
  function mapSvg(entry) {
    const region=regions[entry.region], [west,east,south,north]=region.bounds;
    const pos=([lon,lat])=>[60+(lon-west)/(east-west)*680,420-(lat-south)/(north-south)*350];
    const markers=region.places.map((name,index)=>{
      const [x,y]=pos(places[name]), focus=name===entry.focus;
      const anchor=x>650?'end':'start', dx=anchor==='end'?-10:10, dy=index%2?-10:20;
      return `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${focus?9:6}" fill="${focus?'#a66424':'#174b68'}" stroke="#fff" stroke-width="3"/><text x="${(x+dx).toFixed(1)}" y="${(y+dy).toFixed(1)}" text-anchor="${anchor}" class="map-label ${focus?'current':''}">${escape(name)}</text></g>`;
    }).join('');
    return `<svg class="study-map" viewBox="0 0 800 480" role="img" aria-label="Schematic study map highlighting ${escape(entry.focus)}"><rect width="800" height="480" fill="#dce9e8"/><path d="M0 370 Q130 290 215 325 T400 295 T620 315 T800 240 L800 480 H0Z" fill="#e8dfc6" opacity=".72"/><path d="M0 125 Q170 115 280 185 T530 110 T800 150 L800 0 H0Z" fill="#e8dfc6" opacity=".65"/><text x="35" y="42" class="map-north">N ↑</text><text x="35" y="457" class="map-small">Schematic positions · not a travel route or precise site plan</text>${markers}</svg>`;
  }
  function cards(items) {
    return items.map((entry,i)=>`<button type="button" class="visual-card ${entry.type==='map'?'visual-map-card':''}" data-nt-visual="${i}" aria-label="Open ${escape(entry.title)}">${entry.type==='image'?`<img src="${window.NT_VISUAL_IMAGES[entry.image]}" alt="" loading="lazy">`:'<span class="map-symbol" aria-hidden="true">⌖</span>'}<span><strong>${escape(entry.title)}</strong><small>${entry.type==='image'?'View illustration':'Open study map'}</small></span></button>`).join('');
  }
  function show(entry,els) {
    els.title.textContent=entry.title;
    els.kicker.textContent=entry.type==='image'?'Illustration':'Study map';
    els.body.innerHTML=entry.type==='image'?`<img class="visual-large" src="${window.NT_VISUAL_IMAGES[entry.image]}" alt="Artistic illustration of ${escape(entry.title)}">`:mapSvg(entry);
    els.caption.textContent=entry.type==='image'?`${entry.verse} · Original interpretive artwork${entry.symbolic?' of a symbolic vision':''}; visual details are not a reconstruction of the event.`:`Approximate positions of named places. ${entry.focus} is highlighted. This schematic map does not show an exact event site or travel route.`;
    els.dialog.showModal();
  }
  window.NT_STUDY_VISUALS={entries,cards,show,regions,places,mapSvg};
})();
