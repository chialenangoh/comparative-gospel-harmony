/* Listening journeys — curated paths through the harmony's KJV audio,
   played continuously, with a sleep timer and an offline download option.
   Paths data is generated from the harmony catalogue (audio-paths.json). */
(function () {
  'use strict';

  var PATHS = [{"id": "journey30", "name": "🕊 The Life of Christ in 30 Days", "desc": "The whole journey, read aloud in order.", "totalSec": 6946, "tracks": [{"n": "5", "t": "The Annunciation to the Virgin Mary of the Birth of Jesus", "r": "Luke 1:26-38", "d": 101}, {"n": "10", "t": "The Birth of Jesus", "r": "Luke 2:1-7", "d": 48}, {"n": "14", "t": "Magi Visit the New-born King of the Jews", "r": "Matthew 2:1-12", "d": 105}, {"n": "18", "t": "The Visit of the Boy Jesus to Jerusalem When Twelve Years Old", "r": "Luke 2:41-50", "d": 78}, {"n": "24", "t": "Jesus Baptized by John in the Jordan", "r": "Matthew 3:13-17", "d": 94}, {"n": "25", "t": "The Three Temptations of Jesus", "r": "Matthew 4:1-11", "d": 188}, {"n": "29", "t": "Jesus Works His First Miracle", "r": "John 2:1-11", "d": 83}, {"n": "32", "t": "The Interview of Nicodemus with Jesus", "r": "John 2:23-25; 3:1-21", "d": 185}, {"n": "35", "t": "Jesus in Samaria.", "r": "John 4:5-42", "d": 272}, {"n": "41", "t": "Jesus Finds Four Fishers of Men in Four Fishermen", "r": "Matthew 4:18-22", "d": 173}, {"n": "54", "t": "The Sermon on the Mount. Privileges and Requirements of the…", "r": "Matthew 5:1-48; 6:1-34; 7:1-29; 8:1", "d": 1155}, {"n": "65", "t": "In Crossing the Lake, Jesus Stills the Tempest", "r": "Matthew 8:18; 8:23-27", "d": 155}, {"n": "72", "t": "The First Retirement. the Twelve Return, and Jesus Retires…", "r": "Matthew 14:13-21", "d": 344}, {"n": "85", "t": "The Transfiguration of Jesus on a Mountain (probably Hermon)…", "r": "Matthew 17:1-8", "d": 193}, {"n": "103", "t": "Jesus Answers a Lawyer's Question as to Eternal Life, Giving…", "r": "Luke 10:25-37", "d": 128}, {"n": "116", "t": "The Pharisees and the Scribes Murmur Against Jesus for…", "r": "Luke 15:1-32", "d": 245}, {"n": "118", "t": "Jesus Raises Lazarus from the Dead", "r": "John 11:1-44", "d": 292}, {"n": "127", "t": "Jesus Visits Zacchæus, and Speaks the Parable of the Pounds…", "r": "Luke 19:1-28", "d": 212}, {"n": "128B", "t": "His Triumphal Entry into Jerusalem as the Messiah", "r": "Matthew 21:1-11; 21:14-17", "d": 398}, {"n": "141", "t": "At the Feast in the House of Simon the Leper Mary of Bethany…", "r": "Matthew 26:6-13", "d": 166}, {"n": "148", "t": "Jesus Institutes the Memorial of Eating Bread and Drinking…", "r": "Matthew 26:26-29", "d": 103}, {"n": "149", "t": "The Farewell Discourse to His Disciples in the Upper Room", "r": "John 14:1-31", "d": 249}, {"n": "152", "t": "Going Forth to Gethsemane, Jesus Suffers Long in Agony", "r": "Matthew 26:30; 26:36-46", "d": 258}, {"n": "153", "t": "Jesus Is Betrayed, Arrested and Forsaken", "r": "Matthew 26:47-56", "d": 289}, {"n": "156", "t": "Peter Thrice Denies His Lord", "r": "Matthew 26:58; 26:69-75", "d": 286}, {"n": "161", "t": "Jesus the Second Time Before Pilate", "r": "Matthew 27:15-26", "d": 394}, {"n": "164", "t": "The First Three Hours on the Cross", "r": "Matthew 27:35-44", "d": 322}, {"n": "167", "t": "The Burial of the Body of Jesus in the Tomb of Joseph of…", "r": "Matthew 27:57-60", "d": 220}, {"n": "176", "t": "The Appearance to Two Disciples (cleopas and Another) on the…", "r": "Mark 16:12-13", "d": 160}, {"n": "184", "t": "The Last Appearance and the Ascension", "r": "Mark 16:19-20", "d": 50}]}, {"id": "birth", "name": "⭐ The Birth of Jesus", "desc": "Annunciations, songs, shepherds and wise men.", "totalSec": 1142, "tracks": [{"n": "4", "t": "The Annunciation of the Birth of the Baptist to Zacharias", "r": "Luke 1:5-25", "d": 176}, {"n": "5", "t": "The Annunciation to the Virgin Mary of the Birth of Jesus", "r": "Luke 1:26-38", "d": 101}, {"n": "7", "t": "The Magnificat of Mary", "r": "Luke 1:46-56", "d": 63}, {"n": "8", "t": "The Birth and Childhood of the Baptist, and His Desert Life", "r": "Luke 1:57-80", "d": 141}, {"n": "9", "t": "The Annunciation to Joseph of the Birth of Jesus", "r": "Matthew 1:18-25", "d": 74}, {"n": "10", "t": "The Birth of Jesus", "r": "Luke 2:1-7", "d": 48}, {"n": "11", "t": "The Praise of the Angels and the Homage of the Shepherds", "r": "Luke 2:8-20", "d": 99}, {"n": "13", "t": "The Presentation in the Temple with the Homage of Simeon and…", "r": "Luke 2:22-38", "d": 128}, {"n": "14", "t": "Magi Visit the New-born King of the Jews", "r": "Matthew 2:1-12", "d": 105}, {"n": "15", "t": "The Child Jesus Carried to Egypt, and the Children at…", "r": "Matthew 2:13-18", "d": 71}, {"n": "16", "t": "The Child Brought from Egypt to Nazareth", "r": "Matthew 2:19-23", "d": 58}, {"n": "18", "t": "The Visit of the Boy Jesus to Jerusalem When Twelve Years Old", "r": "Luke 2:41-50", "d": 78}]}, {"id": "miracles", "name": "✨ The Miracles of Jesus", "desc": "Healings, storms stilled, the dead raised.", "totalSec": 3372, "tracks": [{"n": "29", "t": "Jesus Works His First Miracle", "r": "John 2:1-11", "d": 83}, {"n": "38", "t": "The Healing at Cana of the Son of a Courtier of Capernaum", "r": "John 4:46-54", "d": 70}, {"n": "43", "t": "He Heals Peter's Mother-in-law and Many Others", "r": "Matthew 8:14-17", "d": 122}, {"n": "45", "t": "A Leper Healed, and Much Popular Excitement", "r": "Matthew 8:2-4", "d": 146}, {"n": "46", "t": "Thronged in Capernaum, He Heals a Paralytic Lowered Through…", "r": "Matthew 9:1-8", "d": 246}, {"n": "55", "t": "Jesus Heals a Centurion's Servant at Capernaum", "r": "Matthew 8:5-13", "d": 157}, {"n": "56", "t": "He Raises a Widow's Son at Nain", "r": "Luke 7:11-17", "d": 64}, {"n": "65", "t": "In Crossing the Lake, Jesus Stills the Tempest", "r": "Matthew 8:18; 8:23-27", "d": 155}, {"n": "66", "t": "Beyond the Lake Jesus Heals the Gerasene Demoniac", "r": "Matthew 8:28-34", "d": 347}, {"n": "67", "t": "The Return and the Healing of Jairus' Daughter and of the…", "r": "Matthew 9:18-26", "d": 380}, {"n": "72", "t": "The First Retirement. the Twelve Return, and Jesus Retires…", "r": "Matthew 14:13-21", "d": 344}, {"n": "74", "t": "The Peril to the Twelve in the Storm at Sea and Christ's…", "r": "Matthew 14:24-33", "d": 161}, {"n": "87", "t": "The Demoniac Boy, Whom the Disciples Could Not Heal", "r": "Matthew 17:14-21", "d": 248}, {"n": "100", "t": "Jesus Heals a Man Born Blind Who Outwits the Pharisees. the…", "r": "John 9:1-41", "d": 303}, {"n": "118", "t": "Jesus Raises Lazarus from the Dead", "r": "John 11:1-44", "d": 292}, {"n": "126", "t": "Blind Bartimæus and His Companion Healed", "r": "Matthew 20:29-34", "d": 254}]}, {"id": "parables", "name": "🌾 The Parables of Jesus", "desc": "The stories He told — the Sower, the Good Samaritan, the Prodigal and more.", "totalSec": 2525, "tracks": [{"n": "64", "t": "The First Great Group of Parables", "r": "Matthew 13:1-53", "d": 825}, {"n": "101", "t": "In the Parable (allegory) of the Good Shepherd Jesus Draws…", "r": "John 10:1-21", "d": 170}, {"n": "103", "t": "Jesus Answers a Lawyer's Question as to Eternal Life, Giving…", "r": "Luke 10:25-37", "d": 128}, {"n": "108", "t": "He Speaks to His Disciples and a Vast Throng, About…", "r": "Luke 12:1-59", "d": 465}, {"n": "116", "t": "The Pharisees and the Scribes Murmur Against Jesus for…", "r": "Luke 15:1-32", "d": 245}, {"n": "117", "t": "Three Parables on Stewardship (to the Disciples, the Parable…", "r": "Luke 16:1-31; 17:1-10", "d": 364}, {"n": "121", "t": "Two Parables on Prayer (the Importunate Widow, the Pharisee…", "r": "Luke 18:1-14", "d": 116}, {"n": "127", "t": "Jesus Visits Zacchæus, and Speaks the Parable of the Pounds…", "r": "Luke 19:1-28", "d": 212}]}, {"id": "holyweek", "name": "🌿 Holy Week", "desc": "From the triumphal entry to the sealed tomb.", "totalSec": 3886, "tracks": [{"n": "128B", "t": "His Triumphal Entry into Jerusalem as the Messiah", "r": "Matthew 21:1-11; 21:14-17", "d": 398}, {"n": "141", "t": "At the Feast in the House of Simon the Leper Mary of Bethany…", "r": "Matthew 26:6-13", "d": 166}, {"n": "144", "t": "Jesus Partakes of the Paschal Meal with the Twelve Apostles…", "r": "Matthew 26:20", "d": 100}, {"n": "148", "t": "Jesus Institutes the Memorial of Eating Bread and Drinking…", "r": "Matthew 26:26-29", "d": 103}, {"n": "149", "t": "The Farewell Discourse to His Disciples in the Upper Room", "r": "John 14:1-31", "d": 249}, {"n": "150", "t": "The Discourse on the Way to Gethsemane", "r": "John 15:1-27; 16:1-33", "d": 461}, {"n": "152", "t": "Going Forth to Gethsemane, Jesus Suffers Long in Agony", "r": "Matthew 26:30; 26:36-46", "d": 258}, {"n": "153", "t": "Jesus Is Betrayed, Arrested and Forsaken", "r": "Matthew 26:47-56", "d": 289}, {"n": "156", "t": "Peter Thrice Denies His Lord", "r": "Matthew 26:58; 26:69-75", "d": 286}, {"n": "159", "t": "Jesus Before Pilate the First Time", "r": "Matthew 27:2; 27:11-14", "d": 219}, {"n": "161", "t": "Jesus the Second Time Before Pilate", "r": "Matthew 27:15-26", "d": 394}, {"n": "163", "t": "Jesus on the Way to the Cross (via Dolorosa) on Golgotha", "r": "Matthew 27:31-34", "d": 156}, {"n": "164", "t": "The First Three Hours on the Cross", "r": "Matthew 27:35-44", "d": 322}, {"n": "165", "t": "The Three Hours of Darkness from Noon to Three P.m.", "r": "Matthew 27:45-50", "d": 139}, {"n": "166", "t": "The Phenomena Accompanying the Death of Christ", "r": "Matthew 27:51-56", "d": 126}, {"n": "167", "t": "The Burial of the Body of Jesus in the Tomb of Joseph of…", "r": "Matthew 27:57-60", "d": 220}]}, {"id": "risen", "name": "🌅 The Risen Lord", "desc": "The empty tomb and every appearance, to the Ascension.", "totalSec": 1398, "tracks": [{"n": "168", "t": "The Watch of the Women by the Tomb of Jesus", "r": "Matthew 27:61-66", "d": 80}, {"n": "169", "t": "The Visit of the Women to the Tomb of Jesus", "r": "Matthew 28:1", "d": 28}, {"n": "170", "t": "The Earthquake, the Rolling Away of the Stone by an Angel…", "r": "Matthew 28:2-4", "d": 31}, {"n": "171", "t": "The Visit of the Women to the Tomb of Jesus About Sunrise…", "r": "Matthew 28:5-8", "d": 169}, {"n": "172", "t": "Mary Magdalene and the Other Women Report to the Apostles and…", "r": "Luke 24:9-12", "d": 100}, {"n": "173", "t": "The Appearance of Jesus to Mary Magdalene and the Message to…", "r": "Mark 16:9-11", "d": 116}, {"n": "174", "t": "The Appearance of Jesus to the Other Women", "r": "Matthew 28:9-10", "d": 24}, {"n": "176", "t": "The Appearance to Two Disciples (cleopas and Another) on the…", "r": "Mark 16:12-13", "d": 160}, {"n": "178", "t": "The Appearance to the Astonished Disciples (thomas Absent)…", "r": "Mark 16:14", "d": 205}, {"n": "179", "t": "The Appearance to the Disciples the Next Sunday Night and the…", "r": "John 20:26-31", "d": 55}, {"n": "180", "t": "The Appearance to Seven Disciples Beside the Sea of Galilee…", "r": "John 21:1-25", "d": 242}, {"n": "181", "t": "The Appearance to Above Five Hundred on an Appointed Mountain…", "r": "Matthew 28:16-20", "d": 77}, {"n": "182", "t": "The Appearance to James the Brother of Jesus", "r": "", "d": 15}, {"n": "183", "t": "The Appearance to the Disciples with Another Commission", "r": "Luke 24:44-49", "d": 46}, {"n": "184", "t": "The Last Appearance and the Ascension", "r": "Mark 16:19-20", "d": 50}]}, {"id": "all", "name": "📖 The Whole Story", "desc": "All 185 events in order — the complete harmony, about eight and a half hours.", "totalSec": 30813, "tracks": [{"n": "1", "t": "In the Dedication Luke Explains His Method of Research", "r": "Luke 1:1-4", "d": 35}, {"n": "2", "t": "In His Introduction John Pictures Christ as the Word (logos)", "r": "John 1:1-18", "d": 105}, {"n": "3", "t": "Apparently Joseph's Genealogy in Matthew and Mary's in Luke", "r": "Matthew 1:1-17", "d": 276}, {"n": "4", "t": "The Annunciation of the Birth of the Baptist to Zacharias", "r": "Luke 1:5-25", "d": 176}, {"n": "5", "t": "The Annunciation to the Virgin Mary of the Birth of Jesus", "r": "Luke 1:26-38", "d": 101}, {"n": "6", "t": "The Song of Elisabeth to Mary Upon Her Visit", "r": "Luke 1:39-45", "d": 52}, {"n": "7", "t": "The Magnificat of Mary", "r": "Luke 1:46-56", "d": 63}, {"n": "8", "t": "The Birth and Childhood of the Baptist, and His Desert Life", "r": "Luke 1:57-80", "d": 141}, {"n": "9", "t": "The Annunciation to Joseph of the Birth of Jesus", "r": "Matthew 1:18-25", "d": 74}, {"n": "10", "t": "The Birth of Jesus", "r": "Luke 2:1-7", "d": 48}, {"n": "11", "t": "The Praise of the Angels and the Homage of the Shepherds", "r": "Luke 2:8-20", "d": 99}, {"n": "12", "t": "The Circumcision of Jesus", "r": "Luke 2:21", "d": 16}, {"n": "13", "t": "The Presentation in the Temple with the Homage of Simeon and…", "r": "Luke 2:22-38", "d": 128}, {"n": "14", "t": "Magi Visit the New-born King of the Jews", "r": "Matthew 2:1-12", "d": 105}, {"n": "15", "t": "The Child Jesus Carried to Egypt, and the Children at…", "r": "Matthew 2:13-18", "d": 71}, {"n": "16", "t": "The Child Brought from Egypt to Nazareth", "r": "Matthew 2:19-23", "d": 58}, {"n": "17", "t": "The Childhood of Jesus at Nazareth", "r": "Luke 2:40", "d": 12}, {"n": "18", "t": "The Visit of the Boy Jesus to Jerusalem When Twelve Years Old", "r": "Luke 2:41-50", "d": 78}, {"n": "19", "t": "The Eighteen Years at Nazareth", "r": "Luke 2:51-52", "d": 18}, {"n": "20", "t": "The Time of the Beginning", "r": "Mark 1:1", "d": 37}, {"n": "21", "t": "The Message and the Messenger", "r": "Matthew 3:1-6", "d": 115}, {"n": "22", "t": "A Specimen of John's Preaching", "r": "Matthew 3:7-10", "d": 114}, {"n": "23", "t": "The Forerunner's Picture of the Messiah Before Seeing Him", "r": "Matthew 3:11-12", "d": 87}, {"n": "24", "t": "Jesus Baptized by John in the Jordan", "r": "Matthew 3:13-17", "d": 94}, {"n": "25", "t": "The Three Temptations of Jesus", "r": "Matthew 4:1-11", "d": 188}, {"n": "26", "t": "The Testimony of the Baptist to the Committee of the Sanhedrin", "r": "John 1:19-28", "d": 71}, {"n": "27", "t": "John's Identification of Jesus as the Messiah", "r": "John 1:29-34", "d": 40}, {"n": "28", "t": "Jesus Makes His First Disciples", "r": "John 1:35-51", "d": 150}, {"n": "29", "t": "Jesus Works His First Miracle", "r": "John 2:1-11", "d": 83}, {"n": "30", "t": "Jesus Makes a First Sojourn at Capernaum, Accompanied by His…", "r": "John 2:12", "d": 18}, {"n": "31", "t": "The First Cleansing of the Temple at the Passover", "r": "John 2:13-22", "d": 72}, {"n": "32", "t": "The Interview of Nicodemus with Jesus", "r": "John 2:23-25; 3:1-21", "d": 185}, {"n": "33", "t": "The Parallel Ministry of Jesus and John with John's Loyalty…", "r": "John 3:22-36", "d": 114}, {"n": "34", "t": "Christ's Reasons for Leaving Judea", "r": "Matthew 4:12", "d": 65}, {"n": "35", "t": "Jesus in Samaria.", "r": "John 4:5-42", "d": 272}, {"n": "36", "t": "The Arrival of Jesus in Galilee", "r": "John 4:43-45", "d": 26}, {"n": "37", "t": "General Account of His Teaching in Galilee", "r": "Matthew 4:17", "d": 45}, {"n": "38", "t": "The Healing at Cana of the Son of a Courtier of Capernaum", "r": "John 4:46-54", "d": 70}, {"n": "39", "t": "The First Rejection at Nazareth", "r": "Luke 4:16-31", "d": 124}, {"n": "40", "t": "The New Home in Capernaum", "r": "Matthew 4:13-16", "d": 35}, {"n": "41", "t": "Jesus Finds Four Fishers of Men in Four Fishermen", "r": "Matthew 4:18-22", "d": 173}, {"n": "42", "t": "The Excitement in the Synagogue Because of the Teaching of…", "r": "Mark 1:21-28", "d": 124}, {"n": "43", "t": "He Heals Peter's Mother-in-law and Many Others", "r": "Matthew 8:14-17", "d": 122}, {"n": "44", "t": "The First Tour of Galilee with the Four Fishermen", "r": "Matthew 4:23-25", "d": 109}, {"n": "45", "t": "A Leper Healed, and Much Popular Excitement", "r": "Matthew 8:2-4", "d": 146}, {"n": "46", "t": "Thronged in Capernaum, He Heals a Paralytic Lowered Through…", "r": "Matthew 9:1-8", "d": 246}, {"n": "47", "t": "The Call of Matthew (levi) and His Reception in Honor of Jesus", "r": "Matthew 9:9-13", "d": 148}, {"n": "48", "t": "Jesus in Three Parables Defends His Disciples for Feasting…", "r": "Matthew 9:14-17", "d": 152}, {"n": "49", "t": "At a Feast in Jerusalem (possibly the Passover) Jesus Heals a…", "r": "John 5:1-47", "d": 338}, {"n": "50", "t": "Another Sabbath Controversy with the Pharisees When the…", "r": "Matthew 12:1-8", "d": 158}, {"n": "51", "t": "A Third Sabbath Controversy with the Pharisees Over the…", "r": "Matthew 12:9-14", "d": 164}, {"n": "52", "t": "Jesus Teaches and Heals Great Multitudes by the Sea of Galilee", "r": "Matthew 12:15-21", "d": 98}, {"n": "53", "t": "After a Night of Prayer, Jesus Selects Twelve Apostles", "r": "Mark 3:13-19", "d": 96}, {"n": "54", "t": "The Sermon on the Mount. Privileges and Requirements of the…", "r": "Matthew 5:1-48; 6:1-34; 7:1-29; 8:1", "d": 1155}, {"n": "55", "t": "Jesus Heals a Centurion's Servant at Capernaum", "r": "Matthew 8:5-13", "d": 157}, {"n": "56", "t": "He Raises a Widow's Son at Nain", "r": "Luke 7:11-17", "d": 64}, {"n": "57", "t": "The Message from the Baptist and the Eulogy of Jesus", "r": "Matthew 11:2-19", "d": 287}, {"n": "58", "t": "Woes Upon the Cities of Opportunity. the Claims of Christ as…", "r": "Matthew 11:20-30", "d": 101}, {"n": "59", "t": "The Anointing of Christ's Feet by a Sinful Woman in the House…", "r": "Luke 7:36-50", "d": 133}, {"n": "60", "t": "The Second Tour of Galilee", "r": "Luke 8:1-3", "d": 33}, {"n": "61", "t": "Blasphemous Accusation of League with Beelzebub", "r": "Matthew 12:22-37", "d": 219}, {"n": "62", "t": "Scribes and Pharisees Demand a Sign", "r": "Matthew 12:38-45", "d": 86}, {"n": "63", "t": "Christ's Mother and Brethren Seek to Take Him Home", "r": "Matthew 12:46-50", "d": 101}, {"n": "64", "t": "The First Great Group of Parables", "r": "Matthew 13:1-53", "d": 825}, {"n": "65", "t": "In Crossing the Lake, Jesus Stills the Tempest", "r": "Matthew 8:18; 8:23-27", "d": 155}, {"n": "66", "t": "Beyond the Lake Jesus Heals the Gerasene Demoniac", "r": "Matthew 8:28-34", "d": 347}, {"n": "67", "t": "The Return and the Healing of Jairus' Daughter and of the…", "r": "Matthew 9:18-26", "d": 380}, {"n": "68", "t": "He Heals Two Blind Men, and a Dumb Demoniac. a Blasphemous…", "r": "Matthew 9:27-34", "d": 58}, {"n": "69", "t": "The Last Visit to Nazareth", "r": "Matthew 13:54-58", "d": 100}, {"n": "70", "t": "The Third Tour of Galilee After Instructing the Twelve and…", "r": "Matthew 9:35-38; 10:1-42; 11:1", "d": 471}, {"n": "71", "t": "The Guilty Fears of Herod Antipas in Tiberias About Jesus…", "r": "Matthew 14:1-12", "d": 227}, {"n": "72", "t": "The First Retirement. the Twelve Return, and Jesus Retires…", "r": "Matthew 14:13-21", "d": 344}, {"n": "73", "t": "The Prevention of the Revolutionary Purpose to Proclaim Jesus…", "r": "Matthew 14:22-23", "d": 60}, {"n": "74", "t": "The Peril to the Twelve in the Storm at Sea and Christ's…", "r": "Matthew 14:24-33", "d": 161}, {"n": "75", "t": "The Reception at Gennesaret", "r": "Matthew 14:34-36", "d": 63}, {"n": "76", "t": "The Collapse of the Galilean Campaign Because Jesus Will Not…", "r": "John 6:22-71", "d": 358}, {"n": "77", "t": "Pharisees from Jerusalem Reproach Jesus for Allowing His…", "r": "Matthew 15:1-20", "d": 345}, {"n": "78", "t": "The Second Withdrawal to the Region of Tyre and Sidon and the…", "r": "Matthew 15:21-28", "d": 122}, {"n": "79", "t": "The Third Withdrawal North Through Phoenicia and East Towards…", "r": "Matthew 15:29-38", "d": 211}, {"n": "80", "t": "The Brief Visit to Magadan (dalmanutha) in Galilee and the…", "r": "Matthew 15:39; 16:1-4", "d": 80}, {"n": "81", "t": "The Fourth Retirement to Bethsaida Julias in the Tetrarchy of…", "r": "Matthew 16:5-12", "d": 164}, {"n": "82", "t": "Near Cæsarea Philippi Jesus Tests the Faith of the Twelve in…", "r": "Matthew 16:13-20", "d": 133}, {"n": "83", "t": "Jesus Distinctly Foretells That He, the Messiah, Will Be…", "r": "Matthew 16:21-26", "d": 171}, {"n": "84", "t": "The Coming of the Son of Man in That Generation", "r": "Matthew 16:27-28", "d": 78}, {"n": "85", "t": "The Transfiguration of Jesus on a Mountain (probably Hermon)…", "r": "Matthew 17:1-8", "d": 193}, {"n": "86", "t": "The Puzzle of the Three Disciples About the Resurrection and…", "r": "Matthew 17:9-13", "d": 104}, {"n": "87", "t": "The Demoniac Boy, Whom the Disciples Could Not Heal", "r": "Matthew 17:14-21", "d": 248}, {"n": "88", "t": "Returning Privately Through Galilee, He Again Foretells His…", "r": "Matthew 17:22-23", "d": 71}, {"n": "89", "t": "Jesus, the Messiah, Pays the Half-shekel for the Temple", "r": "Matthew 17:24-27", "d": 51}, {"n": "90", "t": "The Twelve Contend as to Who Shall Be the Greatest Under the…", "r": "Matthew 18:1-5", "d": 108}, {"n": "91", "t": "The Mistaken Zeal of the Apostle John Rebuked by Jesus in…", "r": "Matthew 18:6-14", "d": 213}, {"n": "92", "t": "Right Treatment of a Brother Who Has Sinned Against One, and…", "r": "Matthew 18:15-35", "d": 163}, {"n": "93", "t": "The Messiah's Followers Must Give Up Everything for His…", "r": "Matthew 8:19-22", "d": 163}, {"n": "94", "t": "The Unbelieving Brothers of Jesus Counsel Him to Exhibit…", "r": "John 7:2-9", "d": 58}, {"n": "95", "t": "He Goes Privately to Jerusalem Through Samaria", "r": "Luke 9:51-56", "d": 58}, {"n": "96", "t": "The Coming of Jesus to the Feast of Tabernacles Creates…", "r": "John 7:11-52", "d": 280}, {"n": "97", "t": "Story of an Adulteress Brought to Jesus for Judgment", "r": "John 7:53; 8:1-11", "d": 82}, {"n": "98", "t": "After the Feast of Tabernacles in the Temple Jesus Angers the…", "r": "John 8:12-20", "d": 84}, {"n": "99", "t": "The Pharisees Attempt to Stone Jesus When He Exposes Their…", "r": "John 8:21-59", "d": 281}, {"n": "100", "t": "Jesus Heals a Man Born Blind Who Outwits the Pharisees. the…", "r": "John 9:1-41", "d": 303}, {"n": "101", "t": "In the Parable (allegory) of the Good Shepherd Jesus Draws…", "r": "John 10:1-21", "d": 170}, {"n": "102", "t": "Mission of the Seventy. Christ's Joy in Their Work on Their…", "r": "Luke 10:1-24", "d": 196}, {"n": "103", "t": "Jesus Answers a Lawyer's Question as to Eternal Life, Giving…", "r": "Luke 10:25-37", "d": 128}, {"n": "104", "t": "Jesus the Guest of Martha and Mary", "r": "Luke 10:38-42", "d": 43}, {"n": "105", "t": "Jesus Again Gives a Model of Prayer (comp. § 54), and…", "r": "Luke 11:1-13", "d": 125}, {"n": "106", "t": "Blasphemous Accusation of League with Beelzebub", "r": "Luke 11:14-36", "d": 191}, {"n": "107", "t": "While Breakfasting with a Pharisee, Jesus Severely Denounces…", "r": "Luke 11:37-54", "d": 153}, {"n": "108", "t": "He Speaks to His Disciples and a Vast Throng, About…", "r": "Luke 12:1-59", "d": 465}, {"n": "109", "t": "All Must Repent or Perish (two Current Tragedies); Parable of…", "r": "Luke 13:1-9", "d": 87}, {"n": "110", "t": "Jesus Heals a Crippled Woman on the Sabbath and Defends…", "r": "Luke 13:10-21", "d": 114}, {"n": "111", "t": "At the Feast of Dedication, Jesus Will Not Yet Openly Say…", "r": "John 10:22-39", "d": 111}, {"n": "112", "t": "The Withdrawal from Jerusalem to Bethany Beyond Jordan", "r": "John 10:40-42", "d": 22}, {"n": "113", "t": "Teaching in Perea, on a Journey Toward Jerusalem. Warned…", "r": "Luke 13:22-35", "d": 130}, {"n": "114", "t": "While Dining (breakfasting) with a Chief Pharisee, He Again…", "r": "Luke 14:1-24", "d": 195}, {"n": "115", "t": "Great Crowds Follow Him, and He Warns Them to Count the Cost…", "r": "Luke 14:25-35", "d": 90}, {"n": "116", "t": "The Pharisees and the Scribes Murmur Against Jesus for…", "r": "Luke 15:1-32", "d": 245}, {"n": "117", "t": "Three Parables on Stewardship (to the Disciples, the Parable…", "r": "Luke 16:1-31; 17:1-10", "d": 364}, {"n": "118", "t": "Jesus Raises Lazarus from the Dead", "r": "John 11:1-44", "d": 292}, {"n": "119", "t": "The Effect of the Raising of Lazarus (on the People, on the…", "r": "John 11:45-54", "d": 80}, {"n": "120", "t": "Jesus Starts on the Last Journey to Jerusalem by Way of…", "r": "Luke 17:11-37", "d": 192}, {"n": "121", "t": "Two Parables on Prayer (the Importunate Widow, the Pharisee…", "r": "Luke 18:1-14", "d": 116}, {"n": "122", "t": "Going from Galilee Through Perea, He Teaches Concerning…", "r": "Matthew 19:1-12", "d": 193}, {"n": "123", "t": "Christ and Children and the Failure of the Disciples to…", "r": "Matthew 19:13-15", "d": 86}, {"n": "124", "t": "The Rich Young Ruler, the Perils of Riches, and Amazement of…", "r": "Matthew 19:16-30; 20:1-16", "d": 491}, {"n": "125", "t": "Jesus Again Foretells to the Disciples His Death and…", "r": "Matthew 20:17-28", "d": 281}, {"n": "126", "t": "Blind Bartimæus and His Companion Healed", "r": "Matthew 20:29-34", "d": 254}, {"n": "127", "t": "Jesus Visits Zacchæus, and Speaks the Parable of the Pounds…", "r": "Luke 19:1-28", "d": 212}, {"n": "128A", "t": "Jesus Arrives at Bethany, Near Jerusalem", "r": "John 11:55-57; 12:1; 12:9-11", "d": 64}, {"n": "128B", "t": "His Triumphal Entry into Jerusalem as the Messiah", "r": "Matthew 21:1-11; 21:14-17", "d": 398}, {"n": "129", "t": "The Barren Fig Tree Cursed, and the Second Cleansing of the…", "r": "Matthew 21:12-13; 21:18-19", "d": 142}, {"n": "130", "t": "The Desire of Some Greeks to See Jesus Puzzles the Disciples…", "r": "John 12:20-50", "d": 232}, {"n": "131", "t": "The Barren Fig Tree Found to Have Withered", "r": "Matthew 21:19-22", "d": 130}, {"n": "132", "t": "The Rulers (sanhedrin) Formally Challenge the Authority of…", "r": "Matthew 21:23-46; 22:1-14", "d": 635}, {"n": "133", "t": "The Pharisees and the Herodians Try to Ensnare Jesus About…", "r": "Matthew 22:15-22", "d": 167}, {"n": "134", "t": "The Sadducees Ask Him a Puzzling Question About the…", "r": "Matthew 22:23-33", "d": 247}, {"n": "135", "t": "The Pharisees Rejoice Over the Rout of the Sadducees and a…", "r": "Matthew 22:34-40", "d": 116}, {"n": "136", "t": "Jesus, to the Joy of the Multitude, Silences His Enemies by…", "r": "Matthew 22:41-46", "d": 105}, {"n": "137", "t": "In His Last Public Discourse, Jesus Solemnly Denounces the…", "r": "Matthew 23:1-39", "d": 379}, {"n": "138", "t": "Jesus Closely Observes the Contributions in the Temple, and…", "r": "Mark 12:41-44", "d": 67}, {"n": "139", "t": "Sitting on the Mount of Olives, Jesus Speaks to His Disciples…", "r": "Matthew 24:1-51; 25:1-46", "d": 1200}, {"n": "140", "t": "Jesus Predicts His Crucifixion Two Days Hence (jewish Friday)", "r": "Matthew 26:1-5", "d": 72}, {"n": "141", "t": "At the Feast in the House of Simon the Leper Mary of Bethany…", "r": "Matthew 26:6-13", "d": 166}, {"n": "142", "t": "Judas, Stung by the Rebuke of Jesus at the Feast, Bargains…", "r": "Matthew 26:14-16", "d": 70}, {"n": "143", "t": "The Preparation for the Paschal Meal at the Home of a Friend…", "r": "Matthew 26:17-19", "d": 124}, {"n": "144", "t": "Jesus Partakes of the Paschal Meal with the Twelve Apostles…", "r": "Matthew 26:20", "d": 100}, {"n": "145", "t": "During the Paschal Meal, Jesus Washes the Feet of His…", "r": "John 13:1-20", "d": 149}, {"n": "146", "t": "At the Paschal Meal Jesus Points Out Judas as the Betrayer", "r": "Matthew 26:21-25", "d": 164}, {"n": "147", "t": "After the Departure of Judas Jesus Warns the Disciples (peter…", "r": "Matthew 26:31-35", "d": 225}, {"n": "148", "t": "Jesus Institutes the Memorial of Eating Bread and Drinking…", "r": "Matthew 26:26-29", "d": 103}, {"n": "149", "t": "The Farewell Discourse to His Disciples in the Upper Room", "r": "John 14:1-31", "d": 249}, {"n": "150", "t": "The Discourse on the Way to Gethsemane", "r": "John 15:1-27; 16:1-33", "d": 461}, {"n": "151", "t": "Christ's Intercessory Prayer", "r": "John 17:1-26", "d": 207}, {"n": "152", "t": "Going Forth to Gethsemane, Jesus Suffers Long in Agony", "r": "Matthew 26:30; 26:36-46", "d": 258}, {"n": "153", "t": "Jesus Is Betrayed, Arrested and Forsaken", "r": "Matthew 26:47-56", "d": 289}, {"n": "154", "t": "Jesus First Examined by Annas, the Ex-high-priest", "r": "John 18:12-14; 18:19-23", "d": 67}, {"n": "155", "t": "Jesus Hurriedly Tried and Condemned by Caiaphas and the…", "r": "Matthew 26:57; 26:59-68", "d": 237}, {"n": "156", "t": "Peter Thrice Denies His Lord", "r": "Matthew 26:58; 26:69-75", "d": 286}, {"n": "157", "t": "After Dawn, Jesus Is Formally Condemned by the Sanhedrin", "r": "Matthew 27:1", "d": 72}, {"n": "158", "t": "Remorse and Suicide of Judas the Betrayer", "r": "Matthew 27:3-10", "d": 62}, {"n": "159", "t": "Jesus Before Pilate the First Time", "r": "Matthew 27:2; 27:11-14", "d": 219}, {"n": "160", "t": "Jesus Before Herod Antipas the Tetrarch", "r": "Luke 23:6-12", "d": 58}, {"n": "161", "t": "Jesus the Second Time Before Pilate", "r": "Matthew 27:15-26", "d": 394}, {"n": "162", "t": "The Roman Soldiers Mock Jesus", "r": "Matthew 27:27-30", "d": 59}, {"n": "163", "t": "Jesus on the Way to the Cross (via Dolorosa) on Golgotha", "r": "Matthew 27:31-34", "d": 156}, {"n": "164", "t": "The First Three Hours on the Cross", "r": "Matthew 27:35-44", "d": 322}, {"n": "165", "t": "The Three Hours of Darkness from Noon to Three P.m.", "r": "Matthew 27:45-50", "d": 139}, {"n": "166", "t": "The Phenomena Accompanying the Death of Christ", "r": "Matthew 27:51-56", "d": 126}, {"n": "167", "t": "The Burial of the Body of Jesus in the Tomb of Joseph of…", "r": "Matthew 27:57-60", "d": 220}, {"n": "168", "t": "The Watch of the Women by the Tomb of Jesus", "r": "Matthew 27:61-66", "d": 80}, {"n": "169", "t": "The Visit of the Women to the Tomb of Jesus", "r": "Matthew 28:1", "d": 28}, {"n": "170", "t": "The Earthquake, the Rolling Away of the Stone by an Angel…", "r": "Matthew 28:2-4", "d": 31}, {"n": "171", "t": "The Visit of the Women to the Tomb of Jesus About Sunrise…", "r": "Matthew 28:5-8", "d": 169}, {"n": "172", "t": "Mary Magdalene and the Other Women Report to the Apostles and…", "r": "Luke 24:9-12", "d": 100}, {"n": "173", "t": "The Appearance of Jesus to Mary Magdalene and the Message to…", "r": "Mark 16:9-11", "d": 116}, {"n": "174", "t": "The Appearance of Jesus to the Other Women", "r": "Matthew 28:9-10", "d": 24}, {"n": "175", "t": "Some of the Guard Report to the Jewish Rulers", "r": "Matthew 28:11-15", "d": 40}, {"n": "176", "t": "The Appearance to Two Disciples (cleopas and Another) on the…", "r": "Mark 16:12-13", "d": 160}, {"n": "177", "t": "The Report of the Two Disciples and the News of the…", "r": "Luke 24:33-35", "d": 29}, {"n": "178", "t": "The Appearance to the Astonished Disciples (thomas Absent)…", "r": "Mark 16:14", "d": 205}, {"n": "179", "t": "The Appearance to the Disciples the Next Sunday Night and the…", "r": "John 20:26-31", "d": 55}, {"n": "180", "t": "The Appearance to Seven Disciples Beside the Sea of Galilee…", "r": "John 21:1-25", "d": 242}, {"n": "181", "t": "The Appearance to Above Five Hundred on an Appointed Mountain…", "r": "Matthew 28:16-20", "d": 77}, {"n": "182", "t": "The Appearance to James the Brother of Jesus", "r": "", "d": 15}, {"n": "183", "t": "The Appearance to the Disciples with Another Commission", "r": "Luke 24:44-49", "d": 46}, {"n": "184", "t": "The Last Appearance and the Ascension", "r": "Mark 16:19-20", "d": 50}]}];
  var audio = null;
  var queue = [];
  var qIndex = -1;
  var currentPath = null;
  var sleepDeadline = 0;
  var sleepTick = null;

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + 'h ' + String(m).padStart(2, '0') + 'm';
    return m + ':' + String(s).padStart(2, '0');
  }

  function el(id) { return document.getElementById(id); }

  function renderPaths() {
    var wrap = el('pathList');
    if (!wrap) return;
    wrap.innerHTML = '';
    PATHS.forEach(function (p) {
      var card = document.createElement('div');
      card.className = 'path-card';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aj-btn gold';
      btn.textContent = '▶ Play';
      btn.addEventListener('click', function () { startPath(p, 0); });
      card.innerHTML = '<h3></h3><p class="path-desc"></p><p class="path-meta"></p>';
      card.querySelector('h3').textContent = p.name;
      card.querySelector('.path-desc').textContent = p.desc;
      card.querySelector('.path-meta').textContent = p.tracks.length + ' readings · about ' + fmt(p.totalSec) + ' of listening';
      card.appendChild(btn);
      wrap.appendChild(card);
    });
  }

  function startPath(p, idx) {
    currentPath = p;
    queue = p.tracks;
    el('nowPath').textContent = p.name;
    renderQueue();
    playAt(idx);
    var player = el('ajPlayer');
    if (player) player.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderQueue() {
    var list = el('queueList');
    if (!list) return;
    list.innerHTML = '';
    queue.forEach(function (t, i) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'queue-row' + (i === qIndex ? ' current' : '');
      row.innerHTML = '<span class="q-num"></span><span class="q-title"></span><span class="q-dur"></span>';
      row.querySelector('.q-num').textContent = (i + 1) + '.';
      row.querySelector('.q-title').textContent = 'Event ' + t.n + ' — ' + t.t + (t.r ? ' · ' + t.r : '');
      row.querySelector('.q-dur').textContent = fmt(t.d);
      row.addEventListener('click', function () { playAt(i); });
      list.appendChild(row);
    });
  }

  function playAt(i) {
    if (i < 0 || i >= queue.length) { stopQueue(); return; }
    qIndex = i;
    var t = queue[i];
    audio.src = 'audio/event-' + t.n + '.mp3';
    audio.play().catch(function () {});
    el('nowTitle').textContent = 'Event ' + t.n + ' — ' + t.t;
    el('nowRef').textContent = t.r || '';
    el('playPause').textContent = '⏸';
    renderQueue();
    if (navigator.mediaSession && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.t,
        artist: 'Comparative Gospel Harmony — ' + (currentPath ? currentPath.name : ''),
        album: 'King James Version audio'
      });
    }
  }

  function stopQueue() {
    el('nowTitle').textContent = 'Finished — may the words abide with you.';
    el('playPause').textContent = '▶';
    qIndex = -1;
    renderQueue();
  }

  function setSleep(minutes) {
    if (sleepTick) { clearInterval(sleepTick); sleepTick = null; }
    var label = el('sleepLabel');
    if (!minutes) {
      sleepDeadline = 0;
      if (label) label.textContent = '';
      if (audio) audio.volume = 1;
      return;
    }
    sleepDeadline = Date.now() + minutes * 60000;
    sleepTick = setInterval(function () {
      var remain = sleepDeadline - Date.now();
      if (label) label.textContent = '🌙 Sleep timer: ' + fmt(remain / 1000) + ' left';
      if (remain <= 15000 && remain > 0 && audio && !audio.paused) {
        audio.volume = Math.max(0.05, remain / 15000);
      }
      if (remain <= 0) {
        clearInterval(sleepTick); sleepTick = null;
        if (audio) { audio.pause(); audio.volume = 1; }
        el('playPause').textContent = '▶';
        if (label) label.textContent = '🌙 Sleep timer ended — playback paused. Sleep well.';
      }
    }, 500);
    if (label) label.textContent = '🌙 Sleep timer: ' + fmt(minutes * 60) + ' left';
  }

  function initPlayer() {
    audio = el('ajAudio');
    if (!audio) return;
    el('playPause').addEventListener('click', function () {
      if (qIndex < 0 && queue.length) { playAt(0); return; }
      if (audio.paused) { audio.play().catch(function () {}); el('playPause').textContent = '⏸'; }
      else { audio.pause(); el('playPause').textContent = '▶'; }
    });
    el('prevTrack').addEventListener('click', function () { if (qIndex > 0) playAt(qIndex - 1); });
    el('nextTrack').addEventListener('click', function () { if (qIndex >= 0 && qIndex < queue.length - 1) playAt(qIndex + 1); });
    audio.addEventListener('ended', function () {
      if (qIndex >= 0 && qIndex < queue.length - 1) playAt(qIndex + 1);
      else stopQueue();
    });
    audio.addEventListener('timeupdate', function () {
      var bar = el('ajProgress');
      if (bar && audio.duration) bar.value = (audio.currentTime / audio.duration) * 100;
      var t = el('ajTime');
      if (t) t.textContent = fmt(audio.currentTime || 0) + ' / ' + fmt(audio.duration || 0);
    });
    el('ajProgress').addEventListener('input', function (e) {
      if (audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
    });
    el('sleepSelect').addEventListener('change', function (e) { setSleep(parseInt(e.target.value, 10) || 0); });
    var offBtn = el('offlineBtn');
    if (offBtn) offBtn.addEventListener('click', downloadAllAudio);
  }

  function downloadAllAudio() {
    var status = el('offlineStatus');
    var btn = el('offlineBtn');
    if (!('caches' in window)) { status.textContent = 'Offline saving is not supported in this browser.'; return; }
    btn.disabled = true;
    var all = null;
    PATHS.forEach(function (p) { if (p.id === 'all') all = p; });
    var urls = (all ? all.tracks : []).map(function (t) { return 'audio/event-' + t.n + '.mp3'; });
    caches.open('gh-audio-v1').then(function (cache) {
      var done = 0, failed = 0;
      var chain = Promise.resolve();
      urls.forEach(function (u) {
        chain = chain.then(function () {
          return cache.match(u).then(function (hit) {
            if (hit) { done++; }
            else return cache.add(u).then(function () { done++; }, function () { failed++; });
          }).then(function () {
            status.textContent = 'Saving audio for offline… ' + done + ' of ' + urls.length + (failed ? ' (' + failed + ' failed)' : '');
          });
        });
      });
      return chain.then(function () {
        status.textContent = failed
          ? 'Finished with ' + failed + ' files not saved — check your connection and try again.'
          : '✓ All ' + urls.length + ' readings saved. The audio now plays with no connection.';
        btn.disabled = false;
      });
    }).catch(function () {
      status.textContent = 'Offline saving failed in this browser.';
      btn.disabled = false;
    });
  }

  function init() {
    renderPaths();
    initPlayer();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
