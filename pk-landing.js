/* Pap Kőfaragó Üzem – kegyeleti landing: minimális vanilla JS.
   1. Videó és térkép csak kattintásra töltődik.
   2. A kivitel-gombok előválasztják a kivitelt a GHL-űrlapon (URL-paraméterrel).
   2b. Referencia-kártyák: hover-kinagyítás (≥1200 px) és diavetítés.
   Az űrlap ellenőrzését, küldését és az átirányítást a GHL-űrlap végzi. */
(function () {
  var root = document.querySelector('.pk-landing');
  if (!root) return;

  // 1a. Videó: VEED (data-video-src) vagy youtube-nocookie (data-video-id), csak a kattintás után töltődik
  root.querySelectorAll('[data-pk-video]').forEach(function (box) {
    var btn = box.querySelector('.pk-video__play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var src = box.getAttribute('data-video-src');
      var id = box.getAttribute('data-video-id');
      if (src) {
        if (!/^https:\/\/(www\.veed\.io|www\.youtube-nocookie\.com)\//.test(src)) { console.warn('[pk-landing] A videó címe nem engedélyezett szolgáltatásé.'); return; }
        src += (src.indexOf('?') < 0 ? '?' : '&') + 'autoplay=1';
      } else if (id) {
        src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      } else {
        console.warn('[pk-landing] Hiányzik a videó címe (data-video-src) vagy a YouTube-azonosító (data-video-id).');
        return;
      }
      var frame = document.createElement('iframe');
      frame.src = src;
      frame.title = 'Pap Lajos a kőfaragásról';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(frame);
      frame.focus();
    });
  });

  // 1b. Térkép: a Google-térkép csak kattintásra töltődik
  root.querySelectorAll('[data-pk-map]').forEach(function (box) {
    var btn = box.querySelector('.pk-map__load');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = box.getAttribute('data-map-src');
      frame.title = 'Pap Kőfaragó Üzem a térképen';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      box.innerHTML = '';
      box.appendChild(frame);
    });
  });

  // 2. Kivitel előválasztása: a GHL-űrlapot tölti újra URL-paraméterrel (a GHL „Kivitel” mezőjének Query Key-e: data-kivitel-param)
  var ghl = root.querySelector('[data-pk-ghl-form]');
  root.querySelectorAll('[data-kivitel]').forEach(function (link) {
    link.addEventListener('click', function () {
      var value = link.getAttribute('data-kivitel');
      var frame = ghl && ghl.querySelector('iframe');
      if (frame && frame.src) {
        var param = ghl.getAttribute('data-kivitel-param') || 'kivitel';
        var url = new URL(frame.src);
        if (url.searchParams.get(param) !== value) {
          url.searchParams.set(param, value);
          frame.src = url.toString();
        }
      }
    });
  });

  // 2b. Referencia-kártyák: kinagyítás (≥1200 px és hover) és diavetítés
  var refs = root.querySelector('[data-pk-refs]');
  if (refs) (function () {
    var cards = [].slice.call(refs.querySelectorAll('[data-pk-ref]'));
    var wide = window.matchMedia('(min-width: 1200px) and (hover: hover)');

    function show(s, i) {
      s.index = i;
      s.slides.forEach(function (el, k) {
        var on = k === i;
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
    }
    // Kártyánként egy léptető; egy diánál nincs időzítő és nincs átalakítás (JS nélkül is az első dia látszik)
    var sliders = cards.map(function (card) {
      var list = card.querySelector('[data-pk-slides]');
      var s = {
        slides: [].slice.call(card.querySelectorAll('.pk-ref__slide')),
        index: 0, timer: null,
        interval: parseInt(card.getAttribute('data-interval'), 10) || 3000
      };
      if (list && s.slides.length > 1) { list.classList.add('is-enhanced'); show(s, 0); }
      return s;
    });
    function start(s) {
      if (s.slides.length < 2 || s.timer) return;
      s.timer = setInterval(function () { show(s, (s.index + 1) % s.slides.length); }, s.interval);
    }
    function stop(s) { if (s.timer) { clearInterval(s.timer); s.timer = null; } }
    function stopAll() { sliders.forEach(stop); }
    function setActive(i) { cards.forEach(function (c, k) { c.classList.toggle('is-active', k === i); }); }

    // Hover (≥1200 px): az állapot a soron él, csak a sor elhagyásakor áll vissza, így kártyák között nincs visszaugrás
    cards.forEach(function (card, i) {
      card.addEventListener('mouseenter', function () {
        if (!wide.matches) return;
        stopAll(); setActive(i); start(sliders[i]);
      });
    });
    refs.addEventListener('mouseleave', function () {
      if (!wide.matches) return;
      stopAll(); setActive(-1);
    });

    // Kisebb kijelző: nincs nagyítás, a diavetítés a látható kártyán fut
    var io = null;
    function observe() {
      if (io || !('IntersectionObserver' in window)) return;
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var s = sliders[cards.indexOf(e.target)];
          if (!s) return;
          var vh = e.rootBounds ? e.rootBounds.height : window.innerHeight;
          var seen = e.isIntersecting && (e.intersectionRatio >= 0.6 || e.intersectionRect.height >= 0.6 * vh);
          if (seen) start(s); else stop(s);
        });
      }, { threshold: [0, 0.25, 0.6, 0.9] });
      cards.forEach(function (c) { io.observe(c); });
    }
    function unobserve() { if (io) { io.disconnect(); io = null; } }

    // A sor magasságát rögzítjük a három állapot maximumára, hogy az alatta lévő tartalom ne ugráljon
    function lockHeight() {
      refs.style.minHeight = '';
      if (!wide.matches) return;
      refs.classList.add('is-measuring');
      var prev = cards.map(function (c) { return c.classList.contains('is-active'); });
      var max = refs.offsetHeight;
      cards.forEach(function (c, i) { setActive(i); max = Math.max(max, refs.offsetHeight); });
      cards.forEach(function (c, i) { c.classList.toggle('is-active', prev[i]); });
      refs.style.minHeight = max + 'px';
      void refs.offsetHeight;
      refs.classList.remove('is-measuring');
    }

    function mode() {
      stopAll(); setActive(-1);
      if (wide.matches) unobserve(); else observe();
      lockHeight();
    }
    if (wide.addEventListener) wide.addEventListener('change', mode); else wide.addListener(mode);
    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(lockHeight, 150); });
    window.addEventListener('load', lockHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockHeight);
    mode();

    // Előtöltés: a képek akkor töltődnek be, amikor a sor a nézet közelébe ér
    function preload() {
      refs.querySelectorAll('.pk-ref__slide img').forEach(function (img) {
        img.loading = 'eager';
        if (img.decode) img.decode().catch(function () {});
      });
    }
    if ('IntersectionObserver' in window) {
      var pre = new IntersectionObserver(function (entries, o) {
        if (entries.some(function (e) { return e.isIntersecting; })) { preload(); o.disconnect(); }
      }, { rootMargin: '600px 0px' });
      pre.observe(refs);
    } else {
      preload();
    }
  })();
})();
