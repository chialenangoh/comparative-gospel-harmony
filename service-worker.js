/* Gospel Harmony service worker — offline shell + audio cache.
   Shell: app pages, scripts, styles and data (no audio) precached on
   install. Audio: served cache-first from 'gh-audio-v1', which the
   Listening Journeys page fills when the reader chooses to save it. */
var SHELL = 'gh-shell-v9';
var AUDIO = 'gh-audio-v1';
var PRECACHE = ["/", "/account.js", "/acts-events.js", "/acts-harmony.html", "/acts-view.js", "/acts.css", "/advent.html", "/advent.js", "/app.js", "/audio-journeys.js", "/calvin-commentary.js", "/classic-commentary.js", "/data.js", "/differ.js", "/footnotes-data.js", "/footnotes.css", "/footnotes.js", "/glossary.js", "/growth.css", "/growth.js", "/icon-192.png", "/icon-512.png", "/icon-maskable-512.png", "/images.js", "/index.html", "/journey.html", "/journey.js", "/listen.html", "/listen.js", "/manifest.webmanifest", "/new-testament.html", "/nt-bible-1.js", "/nt-bible-2.js", "/nt-bible-3.js", "/nt-bible-4.js", "/nt-bible-5.js", "/nt-bible-6.js", "/nt-books.js", "/nt-calvin.js", "/nt-commentary.js", "/nt-images.js", "/nt-reader.js", "/nt-refs.js", "/nt-visuals.js", "/nt.css", "/old-testament.html", "/ot-bible-1.js", "/ot-bible-2.js", "/ot-bible-3.js", "/ot-bible-4.js", "/ot-bible-5.js", "/ot-bible-6.js", "/ot-bible-7.js", "/ot-bible-8.js", "/ot-books.js", "/ot-commentary-1.js", "/ot-commentary-2.js", "/ot-commentary-3.js", "/ot-commentary-4.js", "/ot-commentary-5.js", "/ot-commentary-6.js", "/ot-commentary-7.js", "/ot-commentary-8.js", "/ot-images.js", "/ot-reader.js", "/ot-refs-1.js", "/ot-refs-2.js", "/ot-refs-3.js", "/ot-refs-4.js", "/ot-refs-5.js", "/ot-refs-6.js", "/ot-refs-7.js", "/ot-refs-8.js", "/ot-visuals.js", "/pwa.js", "/search.css", "/search.html", "/search.js", "/searchbar.js", "/study-tools.js", "/study.js", "/styles.css", "/swipe-nav.js", "/swipe-test.html", "/swipe.js", "/translation-ASV.js", "/translation-ES.js", "/translation-FR.js", "/translation-WEB.js", "/translations.css", "/translations.js", "/verse-context.js", "/verse-day.js", "/verse-names.js", "/verse-refs.js", "/verse-text-1.js", "/verse-text-2.js", "/verse-text-3.js", "/verse-text-4.js", "/visuals.js", "/watch-links.js"];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL).then(function (cache) {
      return Promise.all(PRECACHE.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== SHELL && k !== AUDIO) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.indexOf('/audio/') !== -1) {
    event.respondWith(
      caches.open(AUDIO).then(function (cache) {
        return cache.match(req).then(function (hit) { return hit || fetch(req); });
      })
    );
    return;
  }

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1) {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL).then(function (cache) { cache.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('/index.html'); });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL).then(function (cache) { cache.put(req, copy); });
        return res;
      });
    })
  );
});
