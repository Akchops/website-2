/* Prayatn — site behaviour.
   Animation uses Motion (motion.dev), vendored at assets/js/vendor/motion.min.js.
   Everything degrades gracefully: if Motion or JavaScript fails to load, the
   page is still complete and readable. */
(function () {
  'use strict';

  var M = window.Motion || null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !!M && !reduceMotion;

  var EASE_OUT = [0.16, 1, 0.3, 1];

  /* If Motion is unavailable, make sure nothing stays hidden. */
  function revealAll() {
    document.documentElement.classList.remove('js-anim');
    Array.prototype.forEach.call(document.querySelectorAll('.anim'), function (el) {
      el.classList.add('is-shown');
    });
  }
  if (!canAnimate) revealAll();

  /* Safety net. Content must never stay invisible: an animation that does not
     play is a small loss, a blank section is not. Scroll observers can miss
     elements when someone scrolls very fast (browsers coalesce those events),
     so every so often we simply show anything that is on screen and still
     hidden. Motion normally gets there first, well within this interval. */
  if (canAnimate) {
    var sweeps = 0;
    var sweep = window.setInterval(function () {
      var pending = document.querySelectorAll('.anim:not(.is-shown)');
      Array.prototype.forEach.call(pending, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-shown');
      });
      if (!pending.length || ++sweeps > 120) window.clearInterval(sweep);
    }, 1200);
    window.addEventListener('beforeprint', revealAll);
  }

  /* ---------------------------------------------------------------- header */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open && window.innerWidth <= 980 ? 'hidden' : '';

      if (canAnimate && open) {
        var items = nav.querySelectorAll('.nav__link, .nav__cta');
        M.animate(items,
          { opacity: [0, 1], transform: ['translateY(-6px)', 'translateY(0px)'] },
          { duration: 0.28, delay: M.stagger(0.035), ease: EASE_OUT });
      }
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.innerWidth <= 980) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* dropdown menus — hover on desktop, tap on mobile */
  Array.prototype.forEach.call(document.querySelectorAll('.nav__item'), function (item) {
    var btn = item.querySelector('[aria-haspopup="true"]');
    if (!btn) return;
    var set = function (state) {
      item.classList.toggle('is-open', state);
      btn.setAttribute('aria-expanded', String(state));
    };
    btn.addEventListener('click', function (e) { e.preventDefault(); set(!item.classList.contains('is-open')); });
    item.addEventListener('mouseenter', function () { if (window.innerWidth > 980) set(true); });
    item.addEventListener('mouseleave', function () { if (window.innerWidth > 980) set(false); });
    item.addEventListener('focusout', function (e) {
      if (window.innerWidth > 980 && !item.contains(e.relatedTarget)) set(false);
    });
  });

  function closeMenus() {
    Array.prototype.forEach.call(document.querySelectorAll('.nav__item.is-open'), function (i) {
      i.classList.remove('is-open');
      var b = i.querySelector('[aria-haspopup="true"]');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenus();
    closeLightbox();
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item') && window.innerWidth <= 980) closeMenus();
  });

  /* ------------------------------------------------------- in-page section nav */
  var pagenav = document.querySelector('.pagenav');
  if (pagenav && 'IntersectionObserver' in window) {
    var links = {};
    Array.prototype.forEach.call(pagenav.querySelectorAll('a[href^="#"]'), function (a) {
      links[a.getAttribute('href').slice(1)] = a;
    });
    var targets = Object.keys(links).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (targets.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          Object.keys(links).forEach(function (id) { links[id].classList.remove('is-active'); });
          if (links[entry.target.id]) links[entry.target.id].classList.add('is-active');
        });
      }, { rootMargin: '-140px 0px -65% 0px' });
      targets.forEach(function (t) { spy.observe(t); });
    }
  }

  /* ------------------------------------------------------------- animation */
  if (canAnimate) {
    /* Page-load sequence: whatever is marked as the opening group rises in order. */
    var intro = document.querySelectorAll('[data-intro]');
    if (intro.length) {
      M.animate(intro,
        { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
        { duration: 0.7, delay: M.stagger(0.08), ease: EASE_OUT })
        .then(function () {
          Array.prototype.forEach.call(intro, function (el) { el.classList.add('is-shown'); });
        });
    }

    /* Scroll reveals. Elements in the same [data-group] rise together, staggered. */
    var groups = {};
    Array.prototype.forEach.call(document.querySelectorAll('.anim:not([data-intro])'), function (el) {
      var key = el.dataset.group || null;
      if (key) { (groups[key] = groups[key] || []).push(el); }
      else { groups['solo-' + Math.random()] = [el]; }
    });

    Object.keys(groups).forEach(function (key) {
      var els = groups[key];
      M.inView(els[0], function () {
        M.animate(els,
          { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
          { duration: 0.75, delay: M.stagger(0.07), ease: EASE_OUT })
          .then(function () {
            els.forEach(function (el) { el.classList.add('is-shown'); });
          });
      }, { amount: 0.12, margin: '0px 0px -6% 0px' });
    });

    /* Cards lift very slightly on hover — enough to feel responsive, not bouncy. */
    Array.prototype.forEach.call(document.querySelectorAll('.workcard'), function (card) {
      card.addEventListener('mouseenter', function () {
        M.animate(card, { transform: 'translateY(-4px)' }, { duration: 0.25, ease: EASE_OUT });
      });
      card.addEventListener('mouseleave', function () {
        M.animate(card, { transform: 'translateY(0px)' }, { duration: 0.3, ease: EASE_OUT });
      });
    });
  }

  /* ------------------------------------------------------------- counters */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var setValue = function (el, value) {
      el.textContent = Math.round(value).toLocaleString('en-IN') + (el.dataset.suffix || '');
    };
    Array.prototype.forEach.call(counters, function (el) {
      var target = Number(el.dataset.count);
      if (!target) return;
      if (!canAnimate) { setValue(el, target); return; }
      setValue(el, 0);
      M.inView(el, function () {
        M.animate(0, target, {
          duration: 1.3,
          ease: EASE_OUT,
          onUpdate: function (v) { setValue(el, v); }
        });
      }, { amount: 0.6 });
    });
  }

  /* ------------------------------------------------------------- lightbox */
  var lightbox = document.querySelector('.lightbox');
  var lightboxImg = lightbox && lightbox.querySelector('img');
  var lastFocused = null;

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  if (lightbox) {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.gallery button');
      if (trigger) {
        var img = trigger.querySelector('img');
        lastFocused = trigger;
        lightboxImg.src = img.dataset.full || img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('.lightbox__close').focus();
        if (canAnimate) {
          M.animate(lightbox, { opacity: [0, 1] }, { duration: 0.2 });
          M.animate(lightboxImg, { transform: ['scale(0.96)', 'scale(1)'] }, { duration: 0.35, ease: EASE_OUT });
        }
        return;
      }
      if (e.target.closest('.lightbox__close') || e.target === lightbox) closeLightbox();
    });
  }

  /* ---------------------------------------------------------------- forms
     No backend yet. Set data-endpoint on the form to a Formspree / Netlify
     Forms URL and submissions post there; until then the form opens the
     visitor's own email client with the message ready to send. */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-mailto]'), function (form) {
    var status = form.querySelector('.form-status');
    var say = function (msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status is-visible form-status--' + (ok ? 'ok' : 'err');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var endpoint = form.dataset.endpoint;

      if (endpoint) {
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (!res.ok) throw new Error('Request failed');
            form.reset();
            say('Thank you — your message has been sent. We will get back to you soon.', true);
          })
          .catch(function () {
            say('Sorry, something went wrong. Please email us directly at ' + form.dataset.mailto + '.', false);
          })
          .finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
          });
        return;
      }

      var lines = [];
      data.forEach(function (value, key) {
        if (key.charAt(0) === '_' || !String(value).trim()) return;
        lines.push(key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) + ': ' + value);
      });
      window.location.href = 'mailto:' + form.dataset.mailto +
        '?subject=' + encodeURIComponent(form.dataset.subject || 'Website enquiry') +
        '&body=' + encodeURIComponent(lines.join('\n\n'));
      say('Your email app should now open with this message ready to send. If it does not, please write to ' + form.dataset.mailto + '.', true);
    });
  });

  /* ------------------------------------------------------------ footer year */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
