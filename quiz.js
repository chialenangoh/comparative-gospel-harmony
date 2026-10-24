/* The Life of Christ Quiz — 20 questions drawn from the events of the
   Comparative Gospel Harmony. Instant feedback with the Scripture behind
   each answer, a "Read this event" link, and a shareable score card.
   Best score is kept on the device and, when signed in, in the reader's
   account (study_records, kind "quiz"). */
(function () {
  'use strict';

  var QUESTIONS = [
    { q: 'The angel Gabriel came to a young woman in Nazareth with astonishing news. Who was she?', options: ['Mary', 'Elisabeth', 'Martha of Bethany', 'Anna the prophetess'], correct: 'Mary', event: '5', ref: 'Luke 1:26–31', why: 'Gabriel told Mary she would conceive and bear a son, and call His name Jesus.' },
    { q: 'In which town was Jesus born?', options: ['Nazareth', 'Bethlehem', 'Jerusalem', 'Hebron'], correct: 'Bethlehem', event: '10', ref: 'Matthew 2:1 · Luke 2:7', why: 'Jesus was born in Bethlehem of Judæa, the city of David — as the prophet foretold.' },
    { q: 'After the angels’ announcement on the hillside, who came first to see the newborn Jesus?', options: ['The shepherds', 'The Magi', 'The temple priests', 'Simeon'], correct: 'The shepherds', event: '11', ref: 'Luke 2:15–17', why: 'The shepherds hurried to Bethlehem and found Mary, Joseph, and the Babe in the manger.' },
    { q: 'What guided the Magi — the wise men from the East — to the young Child?', options: ['A choir of angels', 'A dream', 'His star', 'A letter from Herod'], correct: 'His star', event: '14', ref: 'Matthew 2:2, 9', why: '“We have seen his star in the east, and are come to worship him.”' },
    { q: 'Who baptized Jesus, and in which river?', options: ['Peter, in the Jordan', 'John the Baptist, in the Jordan', 'John the Baptist, in the Sea of Galilee', 'Andrew, in the Jordan'], correct: 'John the Baptist, in the Jordan', event: '24', ref: 'Matthew 3:13–16', why: 'John baptized Jesus in the Jordan, and the Spirit descended like a dove.' },
    { q: 'How many days did Jesus fast in the wilderness before His temptations?', options: ['40 days', '7 days', '12 days', '3 days'], correct: '40 days', event: '25', ref: 'Matthew 4:2', why: 'After forty days and nights of fasting, the tempter came to Him.' },
    { q: 'At a wedding in Cana, Jesus performed His first miracle. He turned water into…', options: ['Oil', 'Milk', 'Honey', 'Wine'], correct: 'Wine', event: '29', ref: 'John 2:9–11', why: 'The governor of the feast tasted the water made wine — “this beginning of miracles did Jesus in Cana of Galilee.”' },
    { q: '“For God so loved the world, that he gave his only begotten Son…” Jesus spoke these words in a night-time conversation with…', options: ['Nicodemus', 'Pilate', 'Caiaphas', 'Nathanael'], correct: 'Nicodemus', event: '32', ref: 'John 3:1–16', why: 'Nicodemus, a ruler of the Jews, came to Jesus by night and heard of the new birth.' },
    { q: 'At Jacob’s well in Samaria, Jesus asked the Samaritan woman for…', options: ['A drink of water', 'Bread to eat', 'A room for the night', 'Directions to the city'], correct: 'A drink of water', event: '35', ref: 'John 4:7', why: '“Give me to drink” opened the conversation about the living water.' },
    { q: 'From the Sermon on the Mount: “Blessed are the poor in spirit: for theirs is…”', options: ['the kingdom of heaven', 'the earth', 'comfort', 'mercy'], correct: 'the kingdom of heaven', event: '54', ref: 'Matthew 5:3', why: 'The first of the Beatitudes, opening the Sermon on the Mount.' },
    { q: 'When a storm terrified the disciples on the lake, Jesus rebuked the winds and the sea, saying…', options: ['“Peace, be still.”', '“Come unto me.”', '“It is I; be not afraid.”', '“O faithless generation.”'], correct: '“Peace, be still.”', event: '65', ref: 'Mark 4:39', why: '“And the wind ceased, and there was a great calm.”' },
    { q: 'Beyond the lake, Jesus freed the Gerasene demoniac. The demons begged to enter a herd of…', options: ['Goats', 'Sheep', 'Swine', 'Camels'], correct: 'Swine', event: '66', ref: 'Mark 5:12–13', why: 'The unclean spirits entered the swine, which ran into the sea.' },
    { q: 'In Luke 15 Jesus tells of a lost sheep and a lost coin — and a third story, the lost…', options: ['Pearl', 'Talent', 'City', 'Son'], correct: 'Son', event: '116', ref: 'Luke 15:11–32', why: 'The lost (prodigal) son came home to a father who ran to meet him.' },
    { q: '“Jesus wept.” At whose tomb did Jesus weep before calling him out of the grave?', options: ['Lazarus', 'John the Baptist', 'Jairus’s daughter', 'The widow’s son at Nain'], correct: 'Lazarus', event: '118', ref: 'John 11:35, 43', why: 'At Bethany Jesus cried, “Lazarus, come forth” — and he that was dead came forth.' },
    { q: 'Zacchaeus was too short to see Jesus over the crowd in Jericho. What did he climb?', options: ['A rooftop', 'A sycamore tree', 'A watchtower', 'The city wall'], correct: 'A sycamore tree', event: '127', ref: 'Luke 19:4', why: 'He ran ahead and climbed a sycamore tree — and Jesus invited Himself to his house.' },
    { q: 'At Bethany, Mary anointed Jesus for His burial. What did she pour out?', options: ['Water', 'Costly ointment', 'Ashes', 'Frankincense oil only'], correct: 'Costly ointment', event: '141', ref: 'John 12:3', why: 'A pound of ointment of spikenard, very costly — “the house was filled with the odour of the ointment.”' },
    { q: 'Complete the saying of Jesus: “I am the way, the truth, and the ______.”', options: ['Door', 'Life', 'Light', 'Vine'], correct: 'Life', event: '149', ref: 'John 14:6', why: 'Spoken in the Upper Room on the night He was betrayed.' },
    { q: 'From the cross, Jesus prayed for those who crucified Him: “Father, ______ them; for they know not what they do.”', options: ['Judge', 'Forgive', 'Remember', 'Awaken'], correct: 'Forgive', event: '164', ref: 'Luke 23:34', why: 'The first words from the cross were a prayer of forgiveness.' },
    { q: 'When the risen Jesus showed Thomas His wounds, Thomas answered: “My Lord and my ______.”', options: ['King', 'God', 'Master', 'Saviour'], correct: 'God', event: '179', ref: 'John 20:28', why: '“My Lord and my God” — and Jesus blessed those who believe without seeing.' },
    { q: 'The final event of the Harmony: after blessing His disciples, Jesus…', options: ['Walked to Galilee alone', 'Was taken up into heaven', 'Appeared once more to Pilate', 'Wrote down His teachings'], correct: 'Was taken up into heaven', event: '184', ref: 'Luke 24:51 · Acts 1:9', why: '“While he blessed them, he was parted from them, and carried up into heaven.”' }
  ];

  var SITE_URL = 'comparative-gospel-harmony.onrender.com';
  var BEST_KEY = 'gh-quiz-best-v1';

  var idx = 0, score = 0, answered = false;

  var startEl = document.getElementById('quizStart');
  var playEl = document.getElementById('quizPlay');
  var endEl = document.getElementById('quizEnd');
  if (!startEl || !playEl || !endEl) return;

  function loadBest() {
    try { var p = JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); if (p && typeof p.score === 'number') return p; } catch (e) {}
    return null;
  }
  function saveBest(b) {
    try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch (e) {}
    if (window.GHSync && GHSync.signedIn()) {
      try { GHSync.save('quiz:best', 'quiz', b).catch(function () {}); } catch (e) {}
    }
  }
  function renderBest() {
    var b = loadBest();
    var el = document.getElementById('quizBest');
    if (el) el.textContent = b ? 'Your best so far: ' + b.score + ' of ' + b.total + ' 🏆' : '';
  }

  function cloudBest() {
    if (!window.GHSync || !GHSync.signedIn()) return;
    GHSync.load('quiz:best').then(function (rec) {
      if (!rec || !rec.value) return;
      var b = loadBest();
      if (!b || rec.value.score > b.score) { saveBest(rec.value); renderBest(); }
    }).catch(function () {});
  }

  function show(el) {
    [startEl, playEl, endEl].forEach(function (x) { x.hidden = x !== el; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion() {
    answered = false;
    var item = QUESTIONS[idx];
    document.getElementById('quizProgress').textContent = 'Question ' + (idx + 1) + ' of ' + QUESTIONS.length;
    document.getElementById('quizBarFill').style.width = Math.round((idx / QUESTIONS.length) * 100) + '%';
    document.getElementById('quizScore').textContent = 'Score: ' + score;
    document.getElementById('quizQ').textContent = item.q;
    var box = document.getElementById('quizOptions');
    box.innerHTML = '';
    document.getElementById('quizFeedback').innerHTML = '';
    document.getElementById('quizNext').hidden = true;
    item.options.forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', function () { choose(b, opt); });
      box.appendChild(b);
    });
  }

  function choose(btn, opt) {
    if (answered) return;
    answered = true;
    var item = QUESTIONS[idx];
    var right = opt === item.correct;
    if (right) score++;
    document.querySelectorAll('.quiz-opt').forEach(function (b) {
      b.disabled = true;
      if (b.textContent === item.correct) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    document.getElementById('quizScore').textContent = 'Score: ' + score;
    document.getElementById('quizFeedback').innerHTML =
      '<p class="' + (right ? 'quiz-good' : 'quiz-bad') + '">' + (right ? '✓ Correct!' : '✗ Not quite — the answer is “' + item.correct + '.”') + '</p>' +
      '<p class="quiz-why">' + item.why + ' <span class="quiz-ref">(' + item.ref + ')</span></p>' +
      '<p><a class="quiz-read" href="index.html#event-' + item.event + '">📖 Read this event — Event ' + item.event + '</a></p>';
    var next = document.getElementById('quizNext');
    next.textContent = idx === QUESTIONS.length - 1 ? 'See my score →' : 'Next question →';
    next.hidden = false;
  }

  function wrapText(ctx, text, maxWidth) {
    var words = text.split(/\s+/), lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function makeScoreCard() {
    var W = 1080, H = 1350;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0d1f38'); grad.addColorStop(1, '#1d4066');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#d5aa57'; ctx.lineWidth = 3;
    ctx.strokeRect(42, 42, W - 84, H - 84);
    ctx.lineWidth = 1; ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d5aa57';
    ctx.font = '54px Georgia, serif';
    ctx.fillText('🧠', W / 2, 210);
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('LIFE OF CHRIST QUIZ', W / 2, 300);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 190px Georgia, serif';
    ctx.fillText(score + ' / ' + QUESTIONS.length, W / 2, 560);
    ctx.font = 'italic 40px Georgia, serif';
    ctx.fillStyle = '#f5ecd7';
    var msg = score === 20 ? 'Perfect — you know His story beautifully!' :
      score >= 16 ? 'Wonderful — you know the life of Christ well!' :
      score >= 11 ? 'Well done — keep walking through His story!' :
      score >= 6 ? 'A good start — the Harmony will take you deeper!' :
      'Every journey begins somewhere — start with Event 1!';
    wrapText(ctx, msg, 820).forEach(function (line, i) { ctx.fillText(line, W / 2, 660 + i * 56); });
    ctx.fillStyle = '#d5aa57';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText('COMPARATIVE GOSPEL HARMONY', W / 2, H - 178);
    ctx.font = '24px Georgia, serif';
    ctx.fillStyle = '#bcd0e8';
    ctx.fillText(SITE_URL + '/quiz.html', W / 2, H - 136);
    ctx.fillText('Take the quiz and challenge a friend', W / 2, H - 100);
    return cv;
  }

  var cardFile = null;
  function finish() {
    document.getElementById('quizBarFill').style.width = '100%';
    var best = loadBest();
    var isBest = !best || score > best.score;
    if (isBest) saveBest({ score: score, total: QUESTIONS.length, when: new Date().toISOString() });
    document.getElementById('quizFinalScore').textContent = score + ' of ' + QUESTIONS.length;
    document.getElementById('quizFinalNote').textContent =
      (score === QUESTIONS.length ? 'A perfect score! You know the life of Christ beautifully. ' :
       score >= 16 ? 'Wonderful knowledge of His story. ' :
       score >= 11 ? 'Well done — and every answer above links to the event, so you can go deeper. ' :
       'A beginning — the Harmony itself is the best teacher. Start at Event 1 and walk with Him. ') +
      (isBest ? 'This is your new best score 🏆' : 'Your best remains ' + (best ? best.score : score) + ' of ' + QUESTIONS.length + '.');
    var cv = makeScoreCard();
    document.getElementById('quizCardImg').src = cv.toDataURL('image/png');
    cardFile = null;
    if (cv.toBlob) cv.toBlob(function (b) { if (b) { try { cardFile = new File([b], 'life-of-christ-quiz-score.png', { type: 'image/png' }); } catch (e) {} } }, 'image/png');
    show(endEl);
    renderBest();
  }

  document.getElementById('quizStartBtn').addEventListener('click', function () {
    idx = 0; score = 0;
    show(playEl);
    renderQuestion();
  });
  document.getElementById('quizRetake').addEventListener('click', function () {
    idx = 0; score = 0;
    show(playEl);
    renderQuestion();
  });
  document.getElementById('quizNext').addEventListener('click', function () {
    idx++;
    if (idx >= QUESTIONS.length) finish();
    else renderQuestion();
  });
  document.getElementById('quizShare').addEventListener('click', function () {
    var text = '🧠 I scored ' + score + ' of ' + QUESTIONS.length + ' on the Life of Christ Quiz — can you beat me? ' + SITE_URL + '/quiz.html';
    var note = document.getElementById('quizShareNote');
    function fallback() {
      var a = document.createElement('a');
      a.href = document.getElementById('quizCardImg').src;
      a.download = 'life-of-christ-quiz-score.png';
      a.click();
      if (note) note.textContent = 'Sharing is not available in this browser, so your score card was downloaded — attach it anywhere.';
    }
    try {
      if (cardFile && navigator.canShare && navigator.canShare({ files: [cardFile] })) {
        navigator.share({ files: [cardFile], text: text }).catch(function (e) { if (!e || e.name !== 'AbortError') fallback(); });
      } else if (navigator.share) {
        navigator.share({ text: text }).catch(function (e) { if (!e || e.name !== 'AbortError') fallback(); });
      } else fallback();
    } catch (e) { fallback(); }
  });

  renderBest();
  cloudBest();
})();
