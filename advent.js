/* The Advent Journey — 25 days, December 1–25: the promises, then the
   birth story in the harmony's own order. Progress lives on the reader's
   device. Before December the days can be previewed; check-offs open on
   their December dates (and stay open afterwards for catching up). */
(function () {
  'use strict';

  var DAYS = [{"day": 1, "phase": "The Promise — seven prophecies", "title": "The Child Who Is God", "focus": "Seven hundred years before Bethlehem, Isaiah saw a child who would be called Mighty God. Advent begins with a promise too big for one generation.", "ref": "Isaiah 9:6", "verse": "For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace."}, {"day": 2, "phase": "The Promise — seven prophecies", "title": "The Sign of the Virgin", "focus": "Immanuel — God with us. The sign was given to a doubting king; it is kept for everyone who waits.", "ref": "Isaiah 7:14", "verse": "Behold, a virgin shall conceive, and bear a son, and shall call his name Immanuel."}, {"day": 3, "phase": "The Promise — seven prophecies", "title": "Little Bethlehem", "focus": "God chose the small town on purpose. Where you come from is no limit to what He can do through you.", "ref": "Micah 5:2", "verse": "But thou, Bethlehem Ephratah, though thou be little among the thousands of Judah, yet out of thee shall he come forth unto me that is to be ruler in Israel."}, {"day": 4, "phase": "The Promise — seven prophecies", "title": "The Shoot from Jesse", "focus": "A cut-down family tree, and new life from the stump. The Messiah would come quietly, like growth — not like conquest.", "ref": "Isaiah 11:1", "verse": "And there shall come forth a rod out of the stem of Jesse, and a Branch shall grow out of his roots."}, {"day": 5, "phase": "The Promise — seven prophecies", "title": "The Righteous Branch", "focus": "A King unlike the kings before Him — reigning in justice and righteousness. David’s greater Son was coming.", "ref": "Jeremiah 23:5", "verse": "Behold, the days come, saith the LORD, that I will raise unto David a righteous Branch, and a King shall reign and prosper."}, {"day": 6, "phase": "The Promise — seven prophecies", "title": "The Messenger First", "focus": "Before the Lord came, a voice would prepare the way. The last prophecy of the Old Testament points straight at John the Baptist.", "ref": "Malachi 3:1", "verse": "Behold, I will send my messenger, and he shall prepare the way before me."}, {"day": 7, "phase": "The Promise — seven prophecies", "title": "The Star Out of Jacob", "focus": "A star would announce Him — and fourteen centuries later, wise men from the East were still watching for it.", "ref": "Numbers 24:17", "verse": "There shall come a Star out of Jacob, and a Sceptre shall rise out of Israel."}, {"day": 8, "phase": "The Story — the birth in the Gospels", "title": "The Angel Visits Zacharias", "focus": "An old priest, an ordinary day of service — and heaven breaks a four-hundred-year silence.", "ref": "Luke 1:5-25", "event": "4"}, {"day": 9, "phase": "The Story — the birth in the Gospels", "title": "The Angel Visits Mary", "focus": "One ordinary girl in Nazareth receives the greatest announcement ever given.", "ref": "Luke 1:26-38", "event": "5"}, {"day": 10, "phase": "The Story — the birth in the Gospels", "title": "Elisabeth’s Song", "focus": "Two mothers, one miracle each, and a baby leaping for joy before he is born.", "ref": "Luke 1:39-45", "event": "6"}, {"day": 11, "phase": "The Story — the birth in the Gospels", "title": "Mary’s Magnificat", "focus": "Mary sings: the proud scattered, the humble lifted, the hungry filled. This is the world her Son would turn right side up.", "ref": "Luke 1:46-56", "event": "7"}, {"day": 12, "phase": "The Story — the birth in the Gospels", "title": "John Is Born", "focus": "The messenger arrives first, and a silenced father finds his voice again — in praise.", "ref": "Luke 1:57-80", "event": "8"}, {"day": 13, "phase": "The Story — the birth in the Gospels", "title": "The Angel Visits Joseph", "focus": "Joseph learns the truth in a dream, and quietly chooses mercy and obedience.", "ref": "Matthew 1:18-25", "event": "9"}, {"day": 14, "phase": "The Story — the birth in the Gospels", "title": "The Family Tree", "focus": "Kings and outsiders, the celebrated and the scandalous — God wrote His Son’s family line through them all.", "ref": "Matthew 1:1-17", "event": "3"}, {"day": 15, "phase": "The Story — the birth in the Gospels", "title": "The Birth of Jesus", "focus": "No room, no cradle — and the King of heaven laid in a feeding trough. Glory begins in humility.", "ref": "Luke 2:1-7", "event": "10"}, {"day": 16, "phase": "The Story — the birth in the Gospels", "title": "Angels and Shepherds", "focus": "The greatest birth announcement in history was made to shepherds on a night shift.", "ref": "Luke 2:8-20", "event": "11"}, {"day": 17, "phase": "The Story — the birth in the Gospels", "title": "His Name Is Jesus", "focus": "Eight days old, He receives the name heaven chose: Jesus — the LORD saves.", "ref": "Luke 2:21", "event": "12"}, {"day": 18, "phase": "The Story — the birth in the Gospels", "title": "Simeon and Anna", "focus": "Two old saints who waited decades for one glimpse — and recognised Him instantly. God honours those who wait.", "ref": "Luke 2:22-38", "event": "13"}, {"day": 19, "phase": "The Story — the birth in the Gospels", "title": "The Wise Men Worship", "focus": "Scholars from a distant land kneel where kings did not. Gold, frankincense and myrrh — gifts that preach.", "ref": "Matthew 2:1-12", "event": "14"}, {"day": 20, "phase": "The Story — the birth in the Gospels", "title": "The Flight to Egypt", "focus": "Herod rages; a family flees by night. The story’s first shadow falls — and God protects the promise.", "ref": "Matthew 2:13-18", "event": "15"}, {"day": 21, "phase": "The Story — the birth in the Gospels", "title": "Home to Nazareth", "focus": "Out of Egypt He is called, and raised in a town so small that men would ask, “Can any good thing come out of Nazareth?”", "ref": "Matthew 2:19-23", "event": "16"}, {"day": 22, "phase": "The Story — the birth in the Gospels", "title": "The Childhood at Nazareth", "focus": "Thirty quiet years begin. The Son of God grows in wisdom and stature, in favour with God and man.", "ref": "Luke 2:40", "event": "17"}, {"day": 23, "phase": "The Story — the birth in the Gospels", "title": "The Boy in the Temple", "focus": "Twelve years old, He is found in His Father’s house — about His Father’s business.", "ref": "Luke 2:41-50", "event": "18"}, {"day": 24, "phase": "The Story — the birth in the Gospels", "title": "The Messenger’s Message", "focus": "The voice in the wilderness cries, “Prepare ye the way of the Lord.” All four Gospels start their story here.", "ref": "Matthew 3:1-6", "event": "21"}, {"day": 25, "phase": "The Story — the birth in the Gospels", "title": "The Word Became Flesh", "focus": "Christmas Day. John tells us what it all means: the eternal Word became flesh, and dwelt among us — full of grace and truth.", "ref": "John 1:1-18", "event": "2"}];
  var KEY = 'gh-advent-v1';

  var CSS = [
    '.adv-wrap{max-width:56rem;margin:0 auto;padding:104px 16px 48px}',
    '.adv-stats{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 18px}',
    '.adv-stat{flex:1 1 9rem;border:1px solid #b9c8d7;border-radius:10px;background:#fff;padding:12px 14px;text-align:center}',
    '.adv-stat .n{font:700 1.4rem Georgia,serif;color:#10243f}',
    '.adv-stat .l{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:#4e5a6e}',
    '.adv-phase{font:700 .8rem Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#7a5c14;margin:20px 0 8px}',
    '.adv-day{display:flex;gap:14px;border:1px solid #d7e0ea;border-radius:12px;background:#fff;padding:14px 16px;margin:0 0 12px}',
    '.adv-day.today{border-color:#b03a2e;box-shadow:0 0 0 2px rgba(176,58,46,.3)}',
    '.adv-day.done{opacity:.85}',
    '.adv-num{flex:0 0 3rem;text-align:center}',
    '.adv-num .d{font:700 1.3rem Georgia,serif;color:#10243f}',
    '.adv-num .w{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:#b03a2e}',
    '.adv-body{flex:1 1 auto;min-width:0}',
    '.adv-body h3{margin:0 0 2px;font:700 1.05rem/1.3 Georgia,serif;color:#10243f}',
    '.adv-refs{font-size:.84rem;color:#4e5a6e}',
    '.adv-verse{font:italic .95rem/1.5 Georgia,serif;color:#33475e;margin-top:6px}',
    '.adv-focus{font-size:.93rem;line-height:1.5;color:#33475e;margin-top:4px}',
    '.adv-links{margin-top:9px;display:flex;gap:8px;flex-wrap:wrap}',
    '.adv-links a{font-size:.84rem;font-weight:700;color:#10243f;text-decoration:none;border:1px solid #b9c8d7;background:#f4f7fb;border-radius:7px;padding:6px 10px}',
    '.adv-check{flex:0 0 auto;align-self:flex-start}',
    '.adv-check button{width:2.4rem;height:2.4rem;border-radius:50%;border:2px solid #b9c8d7;background:#fff;font-size:1.1rem;cursor:pointer;color:#fff}',
    '.adv-check button[disabled]{opacity:.35;cursor:default}',
    '.adv-day.done .adv-check button{background:#2e7d46;border-color:#2e7d46}',
    '.adv-note{font-size:.88rem;color:#4e5a6e}'
  ].join('\n');

  function load() {
    try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {}
    return { done: {} };
  }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  function season() {
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    if (m === 11) return { mode: d <= 25 ? 'live' : 'after', today: Math.min(d, 25), year: y };
    if (m === 0) return { mode: 'after', today: 25, year: y - 1 };
    var dec1 = new Date(y, 11, 1);
    var days = Math.round((dec1 - new Date(y, m, d)) / 86400000);
    return { mode: 'before', today: 0, year: y, until: days };
  }

  function canCheck(day, s) {
    if (s.mode === 'after') return true;
    if (s.mode === 'live') return day <= s.today;
    return false;
  }

  function render() {
    var list = document.getElementById('adventList');
    if (!list) return;
    var st = load();
    var s = season();
    var doneN = Object.keys(st.done).length;

    var stats = document.getElementById('adventStats');
    if (stats) {
      var mid = s.mode === 'before' ? { n: s.until + (s.until === 1 ? ' day' : ' days'), l: 'Until December 1' }
        : s.mode === 'live' ? { n: 'Day ' + s.today, l: 'Of Advent' }
        : { n: 'Complete', l: 'Season finished — revisit anytime' };
      stats.innerHTML =
        '<div class="adv-stat"><div class="n">🎄 ' + doneN + ' / 25</div><div class="l">Days lit</div></div>' +
        '<div class="adv-stat"><div class="n">' + mid.n + '</div><div class="l">' + mid.l + '</div></div>' +
        '<div class="adv-stat"><div class="n">Dec 1–25</div><div class="l">' + s.year + '</div></div>';
    }
    var note = document.getElementById('adventNote');
    if (note) {
      note.textContent = s.mode === 'before'
        ? 'The journey opens on December 1. You can preview every day now — the candles light from December 1.'
        : s.mode === 'live'
          ? 'Light one candle a day. Missed one? Catch up anytime — every day stays open once its date arrives.'
          : 'The season is complete — all 25 days stay open here whenever you want to walk them again.';
    }

    list.innerHTML = '';
    var lastPhase = '';
    DAYS.forEach(function (d) {
      if (d.phase !== lastPhase) {
        lastPhase = d.phase;
        var ph = document.createElement('div');
        ph.className = 'adv-phase';
        ph.textContent = d.phase;
        list.appendChild(ph);
      }
      var done = !!st.done[d.day];
      var row = document.createElement('article');
      row.className = 'adv-day' + (done ? ' done' : '') + (s.mode === 'live' && d.day === s.today && !done ? ' today' : '');
      var links = '';
      if (d.event) {
        links = '<a href="index.html#event-' + d.event + '">📖 Read — Event ' + d.event + '</a>' +
                '<a href="audio/event-' + d.event + '.mp3">🔊 Listen</a>';
      } else {
        links = '<a href="search.html?q=' + encodeURIComponent(d.ref) + '">📖 Read ' + d.ref + '</a>';
      }
      row.innerHTML =
        '<div class="adv-num"><div class="d">' + d.day + '</div><div class="w">Dec ' + d.day + '</div></div>' +
        '<div class="adv-body"><h3>' + (done ? '🕯 ' : '') + d.title + '</h3>' +
        '<div class="adv-refs">' + d.ref + '</div>' +
        (d.verse ? '<p class="adv-verse">“' + d.verse + '”</p>' : '') +
        '<p class="adv-focus">' + d.focus + '</p>' +
        '<div class="adv-links">' + links + '</div></div>' +
        '<div class="adv-check"><button type="button" aria-label="Light day ' + d.day + '" title="' +
          (canCheck(d.day, s) ? 'Light this day' : 'Opens December ' + d.day) + '"' +
          (canCheck(d.day, s) ? '' : ' disabled') + '>✓</button></div>';
      var btn = row.querySelector('.adv-check button');
      if (canCheck(d.day, s)) {
        btn.addEventListener('click', function () {
          var s2 = load();
          if (s2.done[d.day]) delete s2.done[d.day]; else s2.done[d.day] = true;
          save(s2);
          render();
        });
      }
      list.appendChild(row);
    });
  }

  function init() {
    var st = document.createElement('style');
    st.id = 'adventStyle';
    st.textContent = CSS;
    document.head.appendChild(st);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
