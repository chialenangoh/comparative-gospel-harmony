/* "Why do the accounts differ?" — short, honest, sourced notes for the
   events readers most often compare. Rendered as a collapsible panel on
   the event page. The four accounts always stand side by side above;
   these notes simply name what differs and how readers have understood
   it. Sources: the accounts themselves, the Henry and Calvin commentaries
   carried in this app, and standard Gospel-harmony scholarship. */
(function () {
  'use strict';

  var NOTES = {
    '3': {
      differs: "Matthew traces 42 names from Abraham to Joseph, through David's son Solomon. Luke traces about 77 names back to Adam, and between David and Joseph the names differ almost completely — Luke's line runs through David's son Nathan.",
      understood: "Matthew gives the royal, legal line — arranged in three groups of fourteen so it could be memorised — to show Jesus is Abraham's seed and David's rightful heir. Luke's list is widely understood as Mary's own line (Joseph named as Heli's son-in-law), or a second reckoning of descent; it runs to Adam because Luke writes for all humanity. Ancient genealogies often telescoped — skipping generations to make the theological point — so the two lists answer two different questions: 'Who is He legally?' and 'Whose is He by birth?'"
    },
    '10': {
      differs: "Matthew centres on Joseph — an angel in a dream, wise men, the flight to Egypt. Luke centres on Mary — the angel in person, shepherds, the presentation in the temple. Neither mentions the other's visitors.",
      understood: "Two witnesses remembering the same household event from the two people who lived it. Each evangelist records what his sources preserved; on the core they agree exactly — a virgin conception, a birth at Bethlehem, a childhood at Nazareth. Historians call this pattern complementary testimony: independent accounts that interlock without being identical."
    },
    '14': {
      differs: "Only Matthew tells of the Magi; only Luke tells of the shepherds. Readers sometimes ask why Luke, who tells the fullest birth story, never mentions the wise men.",
      understood: "Each evangelist chose his witnesses to fit his theme. Matthew, watching for the King of the Jews, shows Gentile scholars bowing first; Luke, the Gospel of the lowly, shows shepherds — the poorest workers — hearing it first. An omission is not a denial: no Gospel claims to tell everything (John 21:25)."
    },
    '24': {
      differs: "Matthew, Mark and Luke narrate the baptism and the voice from heaven. John's Gospel does not narrate the baptism itself — instead the Baptist testifies that he saw the Spirit descend and remain. Matthew alone adds John's hesitation: 'I have need to be baptized of thee.'",
      understood: "John assumes the event his readers already know and supplies the eyewitness interpretation of it. Matthew's added exchange serves his theme of fulfilled righteousness — Jesus insisting on doing 'all righteousness' before He requires it of others."
    },
    '25': {
      differs: "Matthew and Luke record the same three temptations but in different order — Matthew ends on the mountain of kingdoms, Luke ends at the pinnacle of the temple in Jerusalem. Mark compresses the whole forty days into two verses, with no dialogue at all.",
      understood: "Ancient writers arranged material topically as well as chronologically. Luke, whose Gospel journeys toward Jerusalem, climaxes there; Matthew climaxes with the offer of the kingdoms, fitting his Gospel of the King. Mark's brevity is his signature everywhere. The substance — Scripture answered to every temptation — is identical."
    },
    '54': {
      differs: "Matthew's Sermon on the Mount fills three chapters, preached on a mountain. Luke's parallel sermon is much shorter, preached 'on the plain' (Luke 6), and adds woes beside the blessings; many of Matthew's sermon sayings appear scattered elsewhere in Luke.",
      understood: "Jesus taught the same truths many times in many places; these need not be one occasion. Matthew gathers a great teaching collection, as ancient biographies did, while Luke preserves another delivery and distributes further sayings along his travel narrative. The agreement of the core — the Beatitudes, the Golden Rule, the house on the rock — is striking."
    },
    '72': {
      differs: "The feeding of the five thousand is the only miracle recorded in all four Gospels — yet the details vary: Philip's 'two hundred pennyworth' (John), the lad with the loaves (John only), green grass (Mark), 'besides women and children' (Matthew).",
      understood: "This is the classic signature of independent testimony: complete agreement on the substance — five loaves, two fishes, about five thousand fed, twelve baskets gathered — with the natural variation of four people remembering a day none of them forgot. Accounts that matched in every detail would suggest copying, not witnessing."
    },
    '100': {
      differs: "John gives a long, dramatic account of a man born blind, interrogated by the rulers. The Synoptic Gospels never mention this healing, though they record many others.",
      understood: "John tells us plainly that he selected seven 'signs' for a purpose (John 20:30–31); the Synoptics select differently for their audiences. The setting — Jerusalem, late in the ministry, ending in a clash over the Sabbath and sight — belongs to John's temple-centred final section."
    },
    '118': {
      differs: "The raising of Lazarus — arguably the greatest sign — appears only in John. Matthew, Mark and Luke never mention Lazarus of Bethany at all, though Luke knows his sisters (Luke 10) and uses the name in a parable (Luke 16).",
      understood: "Commentators have long noted the possibilities: John writes with a different scope and shows this sign as the direct trigger of the plot to kill Jesus (John 11:45–53). An old suggestion is that the Synoptics, written while Lazarus still lived under threat from the authorities (John 12:10), protected him by silence. What is undisputed is John's claim: he was there, and the event explains the cross that followed."
    },
    '128B': {
      differs: "Matthew speaks of a donkey and a colt, and quotes Zechariah 9:9 in full; Mark, Luke and John mention one colt only. Did Jesus ride one animal or two?",
      understood: "Zechariah's prophecy itself names the animal twice in Hebrew poetic parallelism — 'an ass, and a colt the foal of an ass' — one animal described twice. Matthew, writing for Hebrew readers, keeps the full picture: the mother donkey led alongside her unbroken colt, on whom Jesus sat. The other evangelists simply focus on the animal He rode."
    },
    '148': {
      differs: "Matthew, Mark and Luke record the institution of the bread and the cup. John's Gospel — the longest account of that evening — records no institution words at all, and instead gives the footwashing and chapters of farewell teaching.",
      understood: "John complements the others rather than repeating them: he assumes his readers know the supper tradition and supplies what they omitted — the Lord washing feet, and His final words in the upper room. Read together, the four give the complete evening: the example, the teaching, and the memorial."
    },
    '156': {
      differs: "Mark writes that the cock would crow twice before Peter denied three times; Matthew, Luke and John say simply 'before the cock crow'. The questioners also vary — two servant girls, men by the fire, a kinsman of Malchus.",
      understood: "A cock crowing twice in the night watch still means the denials happened before cockcrow — the dawn signal. Mark, whose Gospel tradition traces to Peter's own preaching, preserves Peter's precise memory; the others give the sense. The courtyard held a shifting crowd; three denials among several exchanges is exactly what all four describe."
    },
    '164': {
      differs: "Seven sayings from the cross are gathered across the four Gospels, but no Gospel has them all: 'Father, forgive them' and the penitent thief are Luke's alone; 'It is finished' is John's alone; Matthew and Mark share the cry 'My God, my God, why hast thou forsaken me?' The wording of the inscription over the cross also differs slightly in each Gospel.",
      understood: "Over six hours, much was said; each evangelist selected the words matching his portrait of the Lord. Together the church's memory holds all seven. The inscription was trilingual (John 19:20); each Gospel gives its sense and emphasis — John, an eyewitness standing there, the fullest form."
    },
    '171': {
      differs: "The resurrection morning is the most compared passage in the Gospels: the number of women varies, Matthew has an angel, Mark 'a young man', Luke 'two men in shining garments'; the order of visits differs, and Mark's Gospel ends abruptly at 16:8, 'for they were afraid'.",
      understood: "On the core, all four agree without exception: women came first, the stone was moved, the tomb was empty, a heavenly message was given, and Jesus was alive. The differences are those of separate witnesses arriving in more than one visit, describing the same angels by their nature (Matthew) or their appearance (Mark, Luke). Mark's sudden ending leaves the reader standing where the women stood — in awe. Harmonists note that accounts invented to deceive would have been made to match; these were not."
    },
    '176': {
      differs: "Mark gives the Emmaus appearance two verses; Luke gives it a whole beloved chapter — the walk, the opened Scriptures, the breaking of bread.",
      understood: "Mark compresses throughout his Gospel; his resurrection chapter is the briefest of all. Luke, who tells us he interviewed eyewitnesses (Luke 1:1–4), preserves the full account — very likely from Cleopas himself. A difference of scope, not of fact."
    },
    '184': {
      differs: "Luke narrates the Ascension in detail — and retells it in Acts. Mark's longer ending mentions it in a single line. Matthew ends instead on a mountain in Galilee with the Great Commission, and John with appearances and a promise.",
      understood: "Each Gospel closes where its theme lands. Luke's story continues into the Acts of the Apostles, so the Ascension is his hinge between the two books. The others end on the risen Lord's presence and commission. All four agree on what matters: He was alive, He blessed and sent His disciples, and He would come again."
    }
  };

  var CSS = [
    '.differ-panel{margin:0 0 16px;border:1px solid #b9c8d7;border-radius:10px;background:#fbfcfe;clear:both}',
    '.differ-panel summary{cursor:pointer;padding:11px 14px;font-weight:700;color:#10243f;font-size:.95rem;list-style:none}',
    '.differ-panel summary::-webkit-details-marker{display:none}',
    '.differ-panel .differ-body{padding:0 14px 13px;font-size:.94rem;line-height:1.55;color:#33475e}',
    '.differ-panel .differ-body h4{margin:8px 0 3px;font-size:.8rem;letter-spacing:.09em;text-transform:uppercase;color:#7a5c14}',
    '.differ-panel .differ-body p{margin:0 0 8px}',
    '.differ-panel .differ-src{font-size:.8rem;color:#4e5a6e}'
  ].join('\n');

  function currentEventNumber() {
    var el = document.getElementById('eventNumber');
    if (!el) return null;
    var m = /Event\s+(\S+)\s+of/i.exec(el.textContent || '');
    return m ? m[1] : null;
  }

  function render() {
    var num = currentEventNumber();
    var old = document.getElementById('differPanel');
    var note = num ? NOTES[num] : null;
    if (!note) { if (old) old.remove(); return; }
    if (old && old.dataset.event === num) return;
    if (old) old.remove();
    var anchor = document.getElementById('eventVisuals');
    if (!anchor || !anchor.parentNode) return;
    var panel = document.createElement('details');
    panel.id = 'differPanel';
    panel.className = 'differ-panel';
    panel.dataset.event = num;
    panel.innerHTML =
      '<summary>❓ Why do the accounts differ? — Event ' + num + '</summary>' +
      '<div class="differ-body">' +
      '<h4>What differs</h4><p></p>' +
      '<h4>How readers have understood it</h4><p></p>' +
      '<p class="differ-src">Sources: the four accounts side by side above; the Henry and Calvin commentaries on this event (in this app); standard Gospel-harmony scholarship.</p>' +
      '</div>';
    var ps = panel.querySelectorAll('.differ-body p');
    ps[0].textContent = note.differs;
    ps[1].textContent = note.understood;
    var dayBar = document.getElementById('journeyDayBar');
    var cardBar = document.getElementById('verseCardBar');
    if (dayBar && dayBar.parentNode === anchor.parentNode) anchor.parentNode.insertBefore(panel, dayBar.nextSibling);
    else if (cardBar && cardBar.parentNode === anchor.parentNode) anchor.parentNode.insertBefore(panel, cardBar.nextSibling);
    else anchor.parentNode.insertBefore(panel, anchor);
  }

  function init() {
    var s = document.createElement('style');
    s.id = 'differStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
    render();
    var target = document.getElementById('eventNumber');
    if (target && window.MutationObserver) {
      new MutationObserver(function () { render(); }).observe(target, { childList: true, characterData: true, subtree: true });
    }
    window.addEventListener('hashchange', function () { setTimeout(render, 60); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
