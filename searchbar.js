/* A visible Scripture search bar. The harmony already has a full search
   page (search.html); this bar simply puts it one tap away at the top of
   the reader and of the journey / advent / listening pages. Submitting
   goes to search.html?q=… which the app's search already understands. */
(function () {
  'use strict';

  function build() {
    if (document.getElementById('ghSearchBar')) return null;
    var form = document.createElement('form');
    form.id = 'ghSearchBar';
    form.action = 'search.html';
    form.method = 'get';
    form.style.cssText = 'display:flex;gap:8px;margin:0 0 16px;clear:both';
    var input = document.createElement('input');
    input.type = 'search';
    input.name = 'q';
    input.placeholder = '🔍 Search the Scriptures — a verse, a name, a topic…';
    input.setAttribute('aria-label', 'Search the Scriptures');
    input.style.cssText = 'flex:1 1 auto;padding:11px 13px;border:1px solid #b9c8d7;border-radius:9px;font-size:1rem;background:#fff;color:#10243f;min-width:0';
    var btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Search';
    btn.style.cssText = 'padding:11px 16px;border-radius:9px;border:1px solid #10243f;background:#10243f;color:#fff;font-weight:700;font-size:.95rem;cursor:pointer';
    form.appendChild(input);
    form.appendChild(btn);
    return form;
  }

  function init() {
    var form = build();
    if (!form) return;
    var reader = document.querySelector('.reader-inner');
    if (reader) {
      var first = reader.firstElementChild;
      if (first) reader.insertBefore(form, first); else reader.appendChild(form);
      return;
    }
    var main = document.querySelector('main');
    if (main) main.insertBefore(form, main.firstElementChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
