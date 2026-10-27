/* Ask the Harmony — a Scripture chat whose answers are assembled ONLY from
   this site's own library: the 185 harmony events in data.js (with their
   verbatim KJV account texts) and the glossary. No verse is ever written
   from memory; every quotation is pulled from an event's account text.
   Design rules (from the 2026-10-26 Bible-app chat research):
   - crisis check runs BEFORE any pastoral answer, helplines first
   - verse cards inline, one tap back to the event in context
   - follow-up chips under every answer; conversation kept on-device
   - honest labelling: a study guide, not a pastor or counsellor       */
(function () {
  'use strict';

  var EVENTS = (window.GOSPEL_DATA && window.GOSPEL_DATA.events) || [];
  var BYNUM = {};
  EVENTS.forEach(function (e) { BYNUM[String(e.number)] = e; });
  var GLOSS = window.GOSPEL_GLOSSARY || {};
  var STORE = 'gh-chat-v1';

  /* ---------------- curated topic library ----------------
     lead: original words written for this chat (not Scripture).
     verse: an exact verse pulled live from the named event's account.
     events: anchor moments rendered as cards.                        */
  var TOPICS = [
    { id: 'anxiety', label: 'Anxiety & worry', icon: '😟',
      keys: ['anxious', 'anxiety', 'worried', 'worry', 'worrying', 'stressed', 'stress', 'overwhelmed', 'panic', 'nervous'],
      lead: 'Jesus spoke to worry directly, and He did not scold it — He pointed to the Father who feeds the birds and clothes the flowers, and who knows what you need before you ask. Worry is treated in the Sermon on the Mount not as a sin to hide but as a weight to hand over, one day at a time.',
      verse: { event: '54', book: 'Matthew', chapter: 6, from: 33, to: 34 },
      events: ['54', '65'],
      practice: 'Try this today: name the one worry out loud to God, then read Matthew 6 from the card below slowly, once, before you check anything else.',
      follow: ['fear', 'peace', 'prayer'] },
    { id: 'fear', label: 'Fear', icon: '🌧️',
      keys: ['afraid', 'fear', 'fearful', 'scared', 'terrified', 'frightened'],
      lead: 'When the storm hit the boat, Jesus was asleep — and when the disciples woke Him in panic, He stilled the wind before He ever mentioned their fear. His most repeated word to frightened people in the Gospels is a gentle one: "Fear not." You are not asked to feel brave first; you are invited to bring Him the fear itself.',
      verse: { event: '149', book: 'John', chapter: 14, from: 27, to: 27 },
      events: ['65', '149'],
      practice: 'Read the words of John 14:27 below twice — once as information, once as spoken to you by name.',
      follow: ['anxiety', 'protection', 'peace'] },
    { id: 'protection', label: 'Protection & safety (Psalm 91)', icon: '🛡️',
      keys: ['protection', 'protect', 'safe', 'safety', 'danger', 'psalm 91', 'guard', 'shield'],
      lead: 'Psalm 91 is the Bible\u2019s great protection psalm — "He shall give his angels charge over thee." Jesus Himself crossed a storm and walked through a hostile crowd unharmed until His hour came. God\u2019s care is not a promise that storms never come; it is the promise that you are never in one alone or unseen.',
      verse: { event: '65', book: 'Mark', chapter: 4, from: 39, to: 39 },
      events: ['65'],
      extraLink: { label: 'Read Psalm 91 in the Old Testament reader →', url: 'old-testament.html#PSA-91' },
      practice: 'Open Psalm 91 from the link below and read it aloud once today — many believers pray it over their home and family word for word.',
      follow: ['fear', 'anxiety', 'hope'] },
    { id: 'hope', label: 'Hope', icon: '🌅',
      keys: ['hope', 'hopeless', 'discouraged', 'give up', 'giving up', 'future', 'despair'],
      lead: 'On the road to Emmaus, two disciples were walking away from Jerusalem saying "we had hoped…" — and the risen Jesus walked beside them unrecognised until their hearts burned again. Christian hope is not optimism about circumstances; it is a Person who has already come out of the tomb.',
      verse: { event: '32', book: 'John', chapter: 3, from: 16, to: 16 },
      events: ['176', '179'],
      practice: 'Read the Emmaus story (Event 176) and notice: Jesus drew near before they recognised Him. He is nearer than you feel.',
      follow: ['grief', 'faith', 'salvation'] },
    { id: 'healing', label: 'Healing & sickness', icon: '🤒',
      keys: ['healing', 'heal', 'sick', 'sickness', 'illness', 'disease', 'pain', 'hospital', 'doctor', 'cancer', 'diagnosis'],
      lead: 'A Roman centurion — an outsider — asked Jesus to heal his servant, and Jesus marvelled at his faith and spoke the word from a distance. Again and again in the Gospels, Jesus heals those who simply bring the need to Him, including people who felt far from God. Bring yours to Him the same way: plainly, and without polishing it first.',
      verse: { event: '55', book: 'Matthew', chapter: 8, from: 13, to: 13 },
      events: ['55', '43', '46'],
      practice: 'Say it the centurion\u2019s way: "Lord, speak the word only." Then rest — the answer is in His hands, not your striving.',
      follow: ['faith', 'prayer', 'grief'] },
    { id: 'grief', label: 'Grief & loss', icon: '💔',
      keys: ['grief', 'grieving', 'loss', 'lost my', 'died', 'death of', 'mourning', 'funeral', 'passed away', 'bereaved', 'widow'],
      lead: 'At the tomb of His friend Lazarus, Jesus wept — knowing He was about to raise him. Your grief is not a lack of faith to Him; He stood inside it Himself. And then He spoke the words that still hold: "I am the resurrection, and the life." Death is real, and it is not the end of the story He is telling.',
      verse: { event: '118', book: 'John', chapter: 11, from: 25, to: 26 },
      events: ['118', '56'],
      practice: 'You do not have to be strong here. Read John 11 slowly and let yourself be Martha and Mary — tell Him honestly, "Lord, if you had been here…" He can carry that sentence.',
      follow: ['hope', 'fear', 'prayer'] },
    { id: 'forgiveness', label: 'Forgiveness & guilt', icon: '❤️',
      keys: ['forgive', 'forgiveness', 'guilt', 'guilty', 'ashamed', 'shame', 'my sin', 'i sinned', 'sorry for'],
      lead: 'The younger son rehearsed his apology all the way home — and the father ran to him before the speech was finished. That is Jesus\u2019 own picture of God. Guilt says run and hide; the Gospel says the Father is already watching the road for you.',
      verse: { event: '116', book: 'Luke', chapter: 15, from: 20, to: 20 },
      events: ['116', '156', '164'],
      practice: 'Confess it plainly to God today — no excuses, no bargaining — then read the father\u2019s response in the card below as His response to you.',
      follow: ['repentance', 'salvation', 'love'] },
    { id: 'repentance', label: 'Repentance & coming back', icon: '↩️',
      keys: ['repent', 'repentance', 'come back', 'coming back', 'backslid', 'strayed', 'wandered', 'left god', 'left church'],
      lead: 'Peter denied Jesus three times in one night — and wept. But the story does not end at the charcoal fire of his failure; the risen Jesus came back for him personally. Returning is not climbing back up to God; it is turning around to find He never stopped facing you.',
      verse: { event: '116', book: 'Luke', chapter: 15, from: 7, to: 7 },
      events: ['116', '156'],
      practice: 'One honest prayer is enough to start: "Father, I have sinned — I\u2019m coming home." Then take one small step back toward the people of God this week.',
      follow: ['forgiveness', 'hope', 'faith'] },
    { id: 'prayer', label: 'Prayer', icon: '🙏',
      keys: ['pray', 'prayer', 'praying', 'how to pray', 'lord\u2019s prayer', 'lords prayer', 'intercede'],
      lead: 'When the disciples asked, "Lord, teach us to pray," Jesus gave them a pattern, not a performance: Father first, His name honoured, His kingdom, then daily bread, forgiveness, and protection. Prayer in the Gospels is honest, persistent, and unpolished — the friend who knocks at midnight is praised, not rebuked.',
      verse: { event: '105', book: 'Luke', chapter: 11, from: 2, to: 4 },
      events: ['105', '121', '151'],
      practice: 'Pray the pattern slowly today: one line at a time from Luke 11 below, pausing after each to say it in your own words.',
      follow: ['anxiety', 'faith', 'holyspirit'] },
    { id: 'faith', label: 'Faith & trust', icon: '✨',
      keys: ['faith', 'believe', 'believing', 'trust god', 'trust him', 'faithful'],
      lead: 'Jesus praised faith wherever He found it — a centurion who trusted His word, a woman who reached for His garment, friends who tore open a roof. Faith in the Gospels is rarely a feeling; it is the decision to come to Him with the need, as you are, before you feel ready.',
      verse: { event: '55', book: 'Matthew', chapter: 8, from: 10, to: 10 },
      events: ['55', '46', '179'],
      practice: 'Bring Him the actual thing today — not a tidier version of it. Faith begins with coming.',
      follow: ['healing', 'doubt', 'hope'] },
    { id: 'doubt', label: 'Doubt & questions', icon: '❓',
      keys: ['doubt', 'doubting', 'doubts', 'not sure i believe', 'questions about god', 'struggling to believe', 'thomas'],
      lead: 'Thomas said it out loud: "Except I shall see… I will not believe." Jesus did not expel him — He returned a week later and offered His wounds. Honest doubt brought to Jesus is treated gently in the Gospels; it is doubt that walks away alone that hardens. Bring your questions into His presence, not away from it.',
      verse: { event: '179', book: 'John', chapter: 20, from: 27, to: 28 },
      events: ['179', '176'],
      practice: 'Say Thomas\u2019s honest sentence to God, then Thomas\u2019s final one: "My Lord and my God." Both prayers are in the card below.',
      follow: ['faith', 'hope', 'salvation'] },
    { id: 'love', label: 'Love & loving others', icon: '💛',
      keys: ['love', 'loving', 'neighbour', 'neighbor', 'enemy', 'enemies', 'kindness', 'mercy'],
      lead: 'Asked which commandment matters most and who counts as a neighbour, Jesus told of a Samaritan who crossed the road for a wounded stranger. Love in His teaching is not a feeling to wait for — it is mercy in motion toward the person in front of you, even the unlikely one.',
      verse: { event: '103', book: 'Luke', chapter: 10, from: 27, to: 27 },
      events: ['103', '54'],
      practice: 'One act of unseen mercy today — a meal, a call, a debt forgiven quietly — is the sermon lived.',
      follow: ['forgiveness', 'gratitude', 'family'] },
    { id: 'peace', label: 'Peace', icon: '🕊️',
      keys: ['peace', 'restless', 'no peace', 'calm', 'rest', 'tired', 'weary', 'exhausted', 'burnout'],
      lead: 'On His last night, hours before the cross, Jesus gave His disciples a gift He called "my peace" — not the world\u2019s kind, which waits for circumstances to settle, but His own, which holds in the middle of them. Peace in the Gospels is a Person\u2019s presence, not a problem\u2019s absence.',
      verse: { event: '149', book: 'John', chapter: 14, from: 27, to: 27 },
      events: ['149', '65'],
      practice: 'Sit with John 14:27 for two quiet minutes. Breathe slowly. Receive it as a gift given, not a mood to manufacture.',
      follow: ['anxiety', 'fear', 'prayer'] },
    { id: 'temptation', label: 'Temptation', icon: '🔥',
      keys: ['temptation', 'tempted', 'tempting', 'addiction', 'habit i can\u2019t break', 'cant stop', 'can\u2019t stop'],
      lead: 'Jesus was tempted in the wilderness — hungry, alone, and offered shortcuts — and every answer He gave was Scripture already stored in His heart. Temptation is not a sign God has left you; your Saviour has stood exactly there, and He did not fall.',
      verse: { event: '25', book: 'Matthew', chapter: 4, from: 4, to: 4 },
      events: ['25'],
      practice: 'Choose one verse today and carry it like He did — written on your phone\u2019s lock screen or a card in your pocket — ready before the moment comes.',
      follow: ['repentance', 'faith', 'prayer'] },
    { id: 'anger', label: 'Anger', icon: '😠',
      keys: ['anger', 'angry', 'furious', 'rage', 'resentment', 'bitter', 'bitterness', 'offended'],
      lead: 'In the Sermon on the Mount, Jesus traced anger to the heart and taught His followers to reconcile quickly — even before worship. He is not asking you to pretend the wrong was small; He is freeing you from carrying it. Anger confessed early loses its power to grow roots.',
      verse: { event: '54', book: 'Matthew', chapter: 5, from: 23, to: 24 },
      events: ['54'],
      practice: 'Before the day ends: one message, one visit, or one prayer of release toward the person. Small and soon beats big and someday.',
      follow: ['forgiveness', 'love', 'peace'] },
    { id: 'loneliness', label: 'Loneliness', icon: '🌙',
      keys: ['lonely', 'loneliness', 'alone', 'abandoned', 'forsaken', 'no one cares', 'nobody cares', 'isolated'],
      lead: 'In Gethsemane, Jesus asked His closest friends to watch with Him — and they slept. He knows the specific pain of facing the hardest night with no one awake beside you. And His promise from that same week stands: "I will not leave you comfortless: I will come to you."',
      verse: { event: '149', book: 'John', chapter: 14, from: 18, to: 18 },
      events: ['152', '149'],
      practice: 'Tell Him the plain truth tonight — "Lord, I feel alone" — then text one person and say the honest version too. Both movements matter.',
      follow: ['peace', 'hope', 'prayer'] },
    { id: 'gratitude', label: 'Gratitude & thanksgiving', icon: '🙌',
      keys: ['grateful', 'gratitude', 'thankful', 'thanksgiving', 'thank god', 'blessed', 'praise'],
      lead: 'Five loaves and two fish became a feast for thousands after Jesus gave thanks for what looked like not enough. And in the temple He honoured a poor widow whose two small coins outweighed treasuries — heaven measures gratitude by the heart, not the amount.',
      verse: { event: '72', book: 'John', chapter: 6, from: 11, to: 11 },
      events: ['72', '138'],
      practice: 'Name three specific gifts aloud today — small ones count double. Gratitude grows by being spoken.',
      follow: ['love', 'money', 'hope'] },
    { id: 'money', label: 'Money & provision', icon: '💰',
      keys: ['money', 'debt', 'debts', 'bills', 'finances', 'financial', 'rent', 'job', 'unemployed', 'provision', 'provide', 'rich', 'poverty', 'poor'],
      lead: 'Zacchaeus was rich and empty; an encounter with Jesus turned his ledger into generosity in a single day. And Jesus taught plainly that no one can serve God and mammon — not because money is evil, but because the heart can only have one master. Provision begins with putting the kingdom first and letting Him carry the arithmetic.',
      verse: { event: '54', book: 'Matthew', chapter: 6, from: 33, to: 33 },
      events: ['127', '54', '138'],
      practice: 'Do one honest, generous thing today — Zacchaeus started the same day — and one honest look at the numbers with God beside you, not behind you.',
      follow: ['anxiety', 'gratitude', 'salvation'] },
    { id: 'family', label: 'Family & children', icon: '👨‍👩‍👧',
      keys: ['family', 'children', 'child', 'kids', 'son', 'daughter', 'marriage', 'husband', 'wife', 'parents', 'parenting'],
      lead: 'When the disciples tried to turn children away, Jesus was displeased — He took them in His arms and blessed them, and He made their simple trust the very picture of the kingdom. Your family is not a distraction from the things of God; in His hands it is one of the main places they happen.',
      verse: { event: '123', book: 'Mark', chapter: 10, from: 14, to: 16 },
      events: ['123', '116'],
      practice: 'Bless your child (or a child in your life) out loud today, by name — Jesus used His hands and His voice, and so can you.',
      follow: ['love', 'prayer', 'forgiveness'] },
    { id: 'salvation', label: 'Salvation & eternal life', icon: '✝️',
      keys: ['salvation', 'saved', 'eternal life', 'heaven', 'born again', 'how to be saved', 'give my life', 'accept jesus', 'become a christian'],
      lead: 'Nicodemus came to Jesus at night with questions, and heard the heart of the whole Gospel: God so loved the world that He gave His only Son, so that whoever believes in Him should not perish but have everlasting life. Salvation is a gift to receive, not a wage to earn — the door is a Person, and He is not hiding.',
      verse: { event: '32', book: 'John', chapter: 3, from: 16, to: 17 },
      events: ['32', '127'],
      practice: 'If you have never done so, you can receive Him now, in your own words: thank Him for the cross, confess your need, and trust Him. Then tell one believer today — heaven marks the day.',
      follow: ['repentance', 'faith', 'holyspirit'] },
    { id: 'holyspirit', label: 'The Holy Spirit', icon: '🔥',
      keys: ['holy spirit', 'holy ghost', 'comforter', 'helper', 'spirit of god', 'filled with the spirit'],
      lead: 'At Jesus\u2019 baptism the Spirit descended like a dove; on His last night Jesus promised another Helper who would be with His followers forever — guiding, comforting, and reminding them of everything He said. The Holy Spirit is not a force to fear but a Person to welcome.',
      verse: { event: '149', book: 'John', chapter: 14, from: 16, to: 17 },
      events: ['24', '149', '184'],
      practice: 'Pray it simply: "Holy Spirit, I welcome You — remind me of Jesus\u2019 words today, and comfort what I cannot fix."',
      follow: ['prayer', 'peace', 'salvation'] }
  ];
  var BYID = {};
  TOPICS.forEach(function (t) { BYID[t.id] = t; });

  var CRISIS = ['suicide', 'kill myself', 'end my life', 'ending my life', 'self-harm', 'self harm', 'hurt myself', 'harm myself', 'don\u2019t want to live', 'dont want to live', 'no reason to live', 'want to die', 'better off dead', 'take my own life'];

  var BOOKS = {
    matthew: 'Matthew', mark: 'Mark', luke: 'Luke', john: 'John',
    psalms: 'PSA', psalm: 'PSA', genesis: 'GEN', exodus: 'EXO', isaiah: 'ISA',
    jeremiah: 'JER', proverbs: 'PRO', ecclesiastes: 'ECC', romans: 'ROM',
    '1 corinthians': '1CO', '2 corinthians': '2CO', galatians: 'GAL', ephesians: 'EPH',
    philippians: 'PHP', colossians: 'COL', hebrews: 'HEB', james: 'JAM',
    '1 peter': '1PE', '1 john': '1JO', revelation: 'REV', acts: 'ACT', daniel: 'DAN',
    deuteronomy: 'DEU', joshua: 'JOS', job: 'JOB', micah: 'MIC', habakkuk: 'HAB'
  };
  var GOSPEL_BOOKS = ['Matthew', 'Mark', 'Luke', 'John'];

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim(); }

  /* Parse an account reference like "2:23-25; 3:1-21" into chapter segments. */
  function refChapters(ref) {
    var chapters = [];
    String(ref || '').split(';').forEach(function (seg) {
      var m = /(\d+)\s*:/.exec(seg);
      if (m) chapters.push(parseInt(m[1], 10));
    });
    return chapters;
  }

  /* Extract exact verse text from an account's combined text. The text runs
     verses together ("... 24 text 25 text 1 text ...") across chapters;
     a verse-number reset to 1 marks the next chapter in the segment list. */
  function extractVerse(text, chapters, chapter, from, to) {
    if (!text || !chapters.length) return null;
    var parts = String(text).split(/\s(\d{1,3})\s(?=[A-Z“"(\u2018\u2019\[])/);
    if (parts.length < 3) return null;
    var verses = [];
    var ci = 0, cur = chapters[0];
    var head = /^(\d{1,3})\s+([\s\S]*)$/.exec(parts[0] || '');
    if (head) verses.push({ ch: cur, n: parseInt(head[1], 10), text: head[2] });
    for (var i = 1; i + 1 <= parts.length - 1; i += 2) {
      var n = parseInt(parts[i], 10);
      if (n === 1 && verses.length && ci < chapters.length - 1) { ci++; cur = chapters[ci]; }
      verses.push({ ch: cur, n: n, text: parts[i + 1] });
    }
    var picked = verses.filter(function (v) { return v.ch === chapter && v.n >= from && v.n <= (to || from); });
    if (!picked.length) return null;
    return picked.map(function (v) { return v.text; }).join(' ');
  }

  function verseCard(eventNum, book, chapter, from, to) {
    var e = BYNUM[String(eventNum)];
    if (!e) return null;
    var acc = e.accounts[book];
    if (!acc || !acc.recorded) return null;
    var t = extractVerse(acc.text, refChapters(acc.reference), chapter, from, to);
    if (!t) return null;
    var ref = book + ' ' + chapter + ':' + from + (to && to !== from ? '\u2013' + to : '');
    return { ref: ref, text: t, event: e };
  }

  function eventCard(e, excerptBook) {
    var accs = GOSPEL_BOOKS.filter(function (b) { return e.accounts[b] && e.accounts[b].recorded; });
    var main = excerptBook && e.accounts[excerptBook] && e.accounts[excerptBook].recorded ? excerptBook : accs[0];
    var excerpt = '';
    if (main) {
      var raw = e.accounts[main].text.replace(/^\d+\s/, '').replace(/\s\d{1,3}\s/g, ' ');
      excerpt = raw.length > 340 ? raw.slice(0, 340).trim() + '…' : raw;
    }
    return '<div class="ecard"><div class="et">Event ' + esc(e.number) + ' — ' + esc(e.title) + '</div>' +
      (e.summary ? '<div class="es">' + esc(e.summary) + '</div>' : '') +
      (excerpt ? '<div class="es" style="font-family:Georgia,serif;margin-top:5px">“' + esc(excerpt) + '” <em>— ' + esc(main) + ' ' + esc(e.accounts[main].reference) + ' (KJV)</em></div>' : '') +
      '<div style="margin-top:5px"><a href="index.html#event-' + esc(e.number) + '">Compare all ' + accs.length + ' Gospel accounts side by side →</a></div></div>';
  }

  function verseCardHtml(vc) {
    return '<div class="vcard"><div class="vref">' + esc(vc.ref) + ' (KJV)</div>' +
      '<div class="vtext">“' + esc(vc.text) + '”</div>' +
      '<div style="margin-top:4px"><a href="index.html#event-' + esc(vc.event.number) + '">Read it in Event ' + esc(vc.event.number) + ' — ' + esc(vc.event.title) + ' →</a></div></div>';
  }

  /* ---------------- conversation state ---------------- */
  var thread = document.getElementById('chatThread');
  var chipsRow = document.getElementById('chatChips');
  var history = [];
  try { history = JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { history = []; }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch (e) {}
  }
  function pushMsg(who, html) {
    history.push({ who: who, html: html });
    save();
    renderMsg(who, html);
  }
  function renderMsg(who, html) {
    var div = document.createElement('div');
    div.className = 'msg ' + who;
    div.innerHTML = html;
    thread.appendChild(div);
    div.scrollIntoView({ block: 'end', behavior: 'smooth' });
    wireChips(div);
    return div;
  }
  function setChips(chips) {
    chipsRow.innerHTML = '';
    (chips || []).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (c.gold ? ' gold' : '');
      b.textContent = c.label;
      b.setAttribute('data-q', c.q);
      chipsRow.appendChild(b);
    });
    wireChips(chipsRow);
  }
  function wireChips(root) {
    root.querySelectorAll('[data-q]').forEach(function (b) {
      if (b._wired) return;
      b._wired = true;
      b.addEventListener('click', function () { ask(b.getAttribute('data-q'), b.textContent); });
    });
    root.querySelectorAll('[data-share]').forEach(function (b) {
      if (b._wired) return;
      b._wired = true;
      b.addEventListener('click', function () {
        var card = b.closest('.msg');
        var text = card ? card.innerText.replace(/\s*\n\s*/g, '\n').trim() : '';
        var payload = text + '\n\n— Ask the Harmony, Comparative Gospel Harmony\nhttps://comparative-gospel-harmony.onrender.com/chat.html';
        if (navigator.share) navigator.share({ title: 'Ask the Harmony', text: payload }).catch(function () {});
        else if (navigator.clipboard) { navigator.clipboard.writeText(payload); b.textContent = 'Copied ✓ — share it anywhere'; }
      });
    });
  }
  function followChips(topic, extra) {
    var chips = [];
    if (topic) topic.follow.forEach(function (fid) {
      var f = BYID[fid];
      if (f) chips.push({ label: f.icon + ' ' + f.label, q: 'Tell me about ' + f.label.toLowerCase() });
    });
    (extra || []).forEach(function (c) { chips.push(c); });
    chips.push({ label: '🙏 Pray with this', q: '__pray__' + (topic ? topic.id : '') });
    return chips.slice(0, 4);
  }
  function answerHtml(leadParas, cardsHtml, topic, extraChips) {
    var html = leadParas.map(function (p) { return '<p>' + p + '</p>'; }).join('') + (cardsHtml || '');
    html += '<span class="src">From the harmony library — every verse quoted exactly from the KJV text on this site.</span>';
    html += '<div class="share-row"><button type="button" data-share="1">Share this answer</button></div>';
    html += '<div class="chips">' + followChips(topic, extraChips).map(function (c) {
      return '<button type="button" class="chip" data-q="' + esc(c.q) + '">' + esc(c.label) + '</button>';
    }).join('') + '</div>';
    return html;
  }

  /* ---------------- the answer engine ---------------- */
  function topicScore(q, t) {
    var s = 0;
    t.keys.forEach(function (k) { if (q.indexOf(k) !== -1) s += k.length >= 6 ? 3 : 2; });
    if (q.indexOf(t.id) !== -1) s += 3;
    return s;
  }
  function bestTopic(q) {
    var best = null, bs = 0;
    TOPICS.forEach(function (t) { var s = topicScore(q, t); if (s > bs) { bs = s; best = t; } });
    return bs >= 2 ? best : null;
  }
  function searchEvents(q) {
    var words = q.replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && ['the', 'and', 'about', 'tell', 'what', 'does', 'jesus', 'god', 'bible', 'show', 'give', 'with', 'from', 'that', 'this'].indexOf(w) === -1; });
    if (!words.length) return [];
    var scored = EVENTS.map(function (e) {
      var title = norm(e.title), sum = norm(e.summary || ''), s = 0;
      words.forEach(function (w) {
        if (title.indexOf(w) !== -1) s += 3;
        else if (sum.indexOf(w) !== -1) s += 1;
      });
      return { e: e, s: s };
    }).filter(function (r) { return r.s >= 3; });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, 3).map(function (r) { return r.e; });
  }
  function parseRef(q) {
    var m = /([123]?\s?[a-z]+(?:\s[a-z]+)?)\s+(\d+)(?:\s*[:.]\s*(\d+)(?:\s*-\s*(\d+))?)?/.exec(q);
    if (!m) return null;
    var bookName = m[1].trim();
    var book = null, gospel = null;
    Object.keys(BOOKS).forEach(function (k) { if (norm(k) === bookName) book = BOOKS[k]; });
    GOSPEL_BOOKS.forEach(function (g) { if (norm(g) === bookName) gospel = g; });
    if (!book && !gospel) return null;
    return { gospel: gospel, code: book, name: gospel || bookName, chapter: parseInt(m[2], 10), from: m[3] ? parseInt(m[3], 10) : null, to: m[4] ? parseInt(m[4], 10) : null };
  }

  function topicAnswer(t) {
    var cards = '';
    if (t.verse) { var vc = verseCard(t.verse.event, t.verse.book, t.verse.chapter, t.verse.from, t.verse.to); if (vc) cards += verseCardHtml(vc); }
    t.events.forEach(function (n) { var e = BYNUM[n]; if (e) cards += eventCard(e); });
    if (t.extraLink) cards += '<div class="ecard"><a href="' + t.extraLink.url + '">' + esc(t.extraLink.label) + '</a></div>';
    return answerHtml(['<strong>' + esc(t.label) + '.</strong> ' + esc(t.lead), esc(t.practice)], cards, t);
  }
  function crisisAnswer() {
    var vc = verseCard('149', 'John', 14, 27, 27);
    var html = '<div class="crisis"><strong>Please reach out for help right now — you matter, and help is close:</strong><br>' +
      '📞 <a href="tel:988">Call or text 988</a> — Suicide and Crisis Lifeline (US, free, 24/7)<br>' +
      '💬 Text <strong>HOME</strong> to <a href="sms:741741">741741</a> — Crisis Text Line<br>' +
      '🚨 If you might act on these feelings, call <a href="tel:911">911</a> or go to your nearest emergency room.</div>' +
      '<p>I\u2019m really glad you said this out loud. You don\u2019t have to carry this alone — please call one of those numbers now, or tell one person near you today. Your life is precious to God; the darkest night in the Gospels ended in a resurrection morning, and He is not finished with your story.</p>' +
      (vc ? verseCardHtml(vc) : '') +
      '<span class="src">Ask the Harmony is a study guide, not a counsellor. If you are in crisis, the people at 988 are trained and kind — please call them now.</span>';
    return html;
  }
  function prayerAnswer(topic) {
    var t = topic || BYID.prayer;
    var vc = t.verse ? verseCard(t.verse.event, t.verse.book, t.verse.chapter, t.verse.from, t.verse.to) : null;
    var model = verseCard('105', 'Luke', 11, 2, 4);
    var paras = ['Here is a prayer you can pray right now, built from the words of Scripture — pray it slowly, in your own voice:',
      '<em>"Father, hallowed be Your name. Your kingdom come. I bring You this need today: ' + esc(t.label.toLowerCase()) + '. Give me today what I truly need, forgive me as I forgive, and keep me close. Lord Jesus, You promised Your peace and Your presence — I receive them now. In Your name, Amen."</em>'];
    var cards = (vc ? verseCardHtml(vc) : '') + (model && (!vc || model.ref !== vc.ref) ? verseCardHtml(model) : '');
    return answerHtml(paras, cards, t);
  }
  function refAnswer(r) {
    if (r.gospel) {
      var hits = EVENTS.filter(function (e) {
        var acc = e.accounts[r.gospel];
        return acc && acc.recorded && refChapters(acc.reference).indexOf(r.chapter) !== -1;
      }).slice(0, 3);
      var paras = ['Here is <strong>' + esc(r.name) + ' ' + r.chapter + (r.from ? ':' + r.from : '') + '</strong> in the harmony — the moments where this chapter appears, with the words themselves:'];
      var cards = '';
      hits.forEach(function (e) {
        if (r.from) {
          var vc = verseCard(e.number, r.gospel, r.chapter, r.from, r.to || r.from);
          if (vc) cards += verseCardHtml(vc);
        }
        cards += eventCard(e, r.gospel);
      });
      if (!hits.length) paras = ['I couldn\u2019t find ' + esc(r.name) + ' ' + r.chapter + ' inside the harmony\u2019s 185 events — the harmony covers the four Gospels\u2019 story of Jesus\u2019 life. Try another passage, or ask me about a topic and I\u2019ll take you to the moment itself.'];
      return answerHtml(paras, cards, null, [{ label: '📖 Read the chapter', q: 'Open ' + r.name + ' ' + r.chapter }]);
    }
    var reader = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JUG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'].indexOf(r.code) !== -1 ? 'old-testament.html' : 'new-testament.html';
    var cards2 = '<div class="ecard"><div class="et">' + esc(r.name.charAt(0).toUpperCase() + r.name.slice(1)) + ' ' + r.chapter + '</div><div class="es">This passage lives outside the four Gospels, so it sits in the full Bible reader — with commentary and study tools.</div><div style="margin-top:5px"><a href="' + reader + '#' + r.code + '-' + r.chapter + '">Open ' + esc(r.name) + ' ' + r.chapter + ' in the reader →</a></div></div>';
    return answerHtml(['<strong>' + esc(r.name.charAt(0).toUpperCase() + r.name.slice(1)) + ' ' + r.chapter + '</strong> is beyond the harmony\u2019s Gospel story, but it\u2019s one tap away in the reader on this same site:'], cards2, null);
  }

  function answer(rawQ) {
    var q = norm(rawQ);
    if (q.indexOf('__pray__') === 0) return prayerAnswer(BYID[q.slice(8)] || null);
    for (var i = 0; i < CRISIS.length; i++) if (q.indexOf(CRISIS[i]) !== -1) return crisisAnswer();
    if (/\b(pray for me|pray with me|please pray|say a prayer|i need prayer)\b/.test(q)) {
      return prayerAnswer(bestTopic(q.replace(/pray/g, '')) || BYID.prayer);
    }
    var r = parseRef(q);
    if (r && r.gospel) return refAnswer(r);
    if (r && r.code && r.code !== 'PSA') return refAnswer(r);
    var t = bestTopic(q);
    if (!t && r && r.code === 'PSA') return refAnswer(r);
    if (t) return topicAnswer(t);
    var gm = /(?:meaning of|what does|define)\s+([a-z']+)/.exec(q) || (GLOSS[q] ? [null, q] : null);
    if (gm && GLOSS[gm[1]]) {
      return answerHtml(['In the King James Bible, <strong>' + esc(gm[1]) + '</strong> means: <strong>' + esc(GLOSS[gm[1]]) + '</strong>. You\u2019ll meet this word across the Gospels — tap any underlined word while reading an event to see its meaning the same way.'], '', null);
    }
    var hits = searchEvents(q);
    if (hits.length) {
      var cards = hits.map(function (e) { return eventCard(e); }).join('');
      return answerHtml(['Here are the moments in Jesus\u2019 life that speak most directly to that:'], cards, null);
    }
    if (/^(hi|hello|hey|good morning|good evening|good afternoon)\b/.test(q)) {
      return answerHtml(['Hello, friend. 👋 I\u2019m glad you\u2019re here. Ask me about a verse, a moment in Jesus\u2019 life, or simply how you\u2019re feeling today — anxiety, hope, grief, gratitude — and I\u2019ll answer from the Gospels themselves.'], '', null, startChips().slice(0, 3));
    }
    return answerHtml(['I want to give you a grounded answer, so let me be honest: nothing in the harmony library matched that closely enough to quote responsibly. Try me with a feeling (anxiety, grief, hope), a topic (prayer, forgiveness, money), a person (Peter, Mary, Zacchaeus), or a verse (John 3:16) — and I\u2019ll take you straight to the moment itself.'], '', null, startChips().slice(0, 3));
  }

  /* ---------------- starters & daily moment ---------------- */
  function todaysEvent() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var doy = Math.floor((now - start) / 86400000);
    return EVENTS[doy % EVENTS.length];
  }
  function startChips() {
    var e = todaysEvent();
    return [
      { label: '📖 Today: Event ' + e.number + ' — ' + e.title.slice(0, 42) + (e.title.length > 42 ? '…' : ''), q: 'Tell me about event ' + e.number, gold: true },
      { label: '😟 I feel anxious', q: 'I feel anxious and worried' },
      { label: '🙏 Teach me to pray', q: 'Teach me how to pray' },
      { label: '💔 I lost someone', q: 'I am grieving someone who died' },
      { label: '🌅 I need hope', q: 'I need hope today' },
      { label: '🤒 Pray for healing', q: 'Please pray for healing' },
      { label: '❤️ I need forgiveness', q: 'I need forgiveness and feel guilty' },
      { label: '✝️ How can I be saved?', q: 'How can I be saved and have eternal life?' }
    ];
  }

  /* ---------------- ask flow ---------------- */
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  function ask(q, label) {
    q = String(q || '').trim();
    if (!q) return;
    pushMsg('me', esc(label && q.indexOf('__') !== 0 ? label : q.replace(/^__pray__/, 'Pray with this')));
    var typing = document.createElement('div');
    typing.className = 'msg guide';
    typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    thread.appendChild(typing);
    typing.scrollIntoView({ block: 'end', behavior: 'smooth' });
    var html;
    try { html = answer(q); } catch (e) { html = '<p>Something went wrong building that answer — please try again.</p>'; }
    setTimeout(function () {
      typing.remove();
      var i = history.length; /* keep history in sync: replace placeholder flow by direct push */
      history.push({ who: 'guide', html: html });
      save();
      renderMsg('guide', html);
    }, 650 + Math.random() * 450);
    setChips(startChips().slice(0, 4));
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = input.value;
    input.value = '';
    ask(v);
  });
  document.getElementById('chatClear').addEventListener('click', function () {
    history = [];
    save();
    thread.innerHTML = '';
    greet(true);
  });
  document.getElementById('chatToday').addEventListener('click', function () {
    var e = todaysEvent();
    ask('Tell me about event ' + e.number, '📖 Today\u2019s moment — Event ' + e.number);
  });

  function greet(force) {
    var params = new URLSearchParams(location.search);
    var evNum = params.get('event') || (location.hash.match(/event-(\d+[A-Z]?)/) || [])[1];
    var e = evNum ? BYNUM[evNum] : null;
    var hello = e
      ? 'Welcome! 👋 You\u2019re reading <strong>Event ' + esc(e.number) + ' — ' + esc(e.title) + '</strong>. Ask me anything about it — or about any verse, topic, or feeling — and I\u2019ll answer from the Gospels on this site.'
      : 'Welcome, friend! 👋 I\u2019m <strong>Ask the Harmony</strong>. Ask me about a verse, a moment in Jesus\u2019 life, or how you\u2019re feeling today, and I\u2019ll answer only from the Gospels in this library — with the words themselves, side by side.';
    pushMsg('guide', '<p>' + hello + '</p>');
    setChips(startChips());
  }

  if (history.length) {
    history.forEach(function (m) { renderMsg(m.who, m.html); });
    setChips(startChips().slice(0, 4));
  } else {
    greet(false);
  }

  /* Deep-link: ?event=NN answered in context when arriving fresh. */
  if (!history.length) {
    var p = new URLSearchParams(location.search);
    if (p.get('ask')) setTimeout(function () { ask(p.get('ask')); }, 400);
  }
})();
