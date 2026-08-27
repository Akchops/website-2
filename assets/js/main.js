/* Prayatn — site behaviour.
   Animation uses Motion (motion.dev), vendored at assets/js/vendor/motion.min.js.
   Everything degrades gracefully: if Motion or JavaScript fails to load, the
   page is still complete and readable. */
(function () {
  'use strict';

  var M = window.Motion || null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !!M && !reduceMotion;

  var EASE = [0.16, 1, 0.3, 1];          // long, settling ease
  var SPRING = { type: 'spring', stiffness: 320, damping: 34 };

  function revealAll() {
    document.documentElement.classList.remove('js-anim');
    Array.prototype.forEach.call(document.querySelectorAll('.anim, .reveal-img'), function (el) {
      el.classList.add('is-shown');
    });
  }
  if (!canAnimate) revealAll();

  /* Safety net — content must never stay invisible. Scroll observers can miss
     elements when someone scrolls very fast, so periodically show anything on
     screen that is still hidden. Motion normally gets there first. */
  if (canAnimate) {
    var sweeps = 0;
    var sweep = window.setInterval(function () {
      var pending = document.querySelectorAll('.anim:not(.is-shown), .reveal-img:not(.is-shown)');
      Array.prototype.forEach.call(pending, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-shown');
      });
      if (!pending.length || ++sweeps > 120) window.clearInterval(sweep);
    }, 1200);
    window.addEventListener('beforeprint', revealAll);
  }

  /* =====================================================================
     Headlines: split into lines so they can rise out from behind a mask.
     Done in JS so the HTML stays plain text for search engines and readers.
     ===================================================================== */
  function splitIntoLines(el) {
    if (el.dataset.split) return;
    var html = el.innerHTML;
    // <br> already marks the author's intended line breaks
    var parts = html.split(/<br\s*\/?>/i);
    if (parts.length === 1) {
      // wrap the whole heading as a single line
      parts = [html];
    }
    el.innerHTML = parts.map(function (line) {
      return '<span class="split-line"><span>' + line + '</span></span>';
    }).join('');
    el.dataset.split = 'true';
  }

  /* =====================================================================
     Entrance
     ===================================================================== */
  function playIntro(root) {
    var scope = root || document;
    var heading = scope.querySelector('h1[data-intro]');
    var others = [].slice.call(scope.querySelectorAll('[data-intro]')).filter(function (el) {
      return el !== heading;
    });

    if (heading) {
      splitIntoLines(heading);
      heading.classList.add('is-shown');
      var lines = heading.querySelectorAll('.split-line > span');
      M.animate(lines, { transform: ['translateY(105%)', 'translateY(0%)'] },
        { duration: 0.85, delay: M.stagger(0.09), ease: EASE });
    }

    if (others.length) {
      M.animate(others,
        { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
        { duration: 0.7, delay: M.stagger(0.07, { startDelay: heading ? 0.18 : 0 }), ease: EASE })
        .then(function () {
          others.forEach(function (el) { el.classList.add('is-shown'); });
        });
      // the hero picture wipes open at the end of the sequence
      var heroImg = scope.querySelector('.hero__media .reveal-img');
      if (heroImg) {
        M.animate(heroImg,
          { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], transform: ['scale(1.06)', 'scale(1)'] },
          { duration: 1.05, delay: 0.3, ease: EASE })
          .then(function () { heroImg.classList.add('is-shown'); });
      }
    }
  }

  /* =====================================================================
     Scroll reveals
     ===================================================================== */
  function setupReveals(root) {
    var scope = root || document;

    // pictures wipe open
    Array.prototype.forEach.call(scope.querySelectorAll('.reveal-img:not(.is-shown)'), function (el) {
      if (el.closest('.hero__media')) return;         // handled by the intro
      M.inView(el, function () {
        M.animate(el,
          { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], transform: ['scale(1.05)', 'scale(1)'] },
          { duration: 0.95, ease: EASE })
          .then(function () { el.classList.add('is-shown'); });
      }, { amount: 0.15 });
    });

    // headings rise line by line
    Array.prototype.forEach.call(scope.querySelectorAll('.anim h2:not([data-split])'), function (h) {
      var holder = h.closest('.anim');
      if (!holder || holder.classList.contains('is-shown')) return;
      splitIntoLines(h);
      M.inView(h, function () {
        M.animate(h.querySelectorAll('.split-line > span'),
          { transform: ['translateY(105%)', 'translateY(0%)'] },
          { duration: 0.8, delay: M.stagger(0.07), ease: EASE });
      }, { amount: 0.4 });
    });

    // everything else rises and fades, grouped so related things move together
    var groups = {};
    var n = 0;
    Array.prototype.forEach.call(scope.querySelectorAll('.anim:not([data-intro]):not(.is-shown)'), function (el) {
      var key = el.dataset.group || ('solo-' + (n++));
      (groups[key] = groups[key] || []).push(el);
    });
    Object.keys(groups).forEach(function (key) {
      var els = groups[key];
      M.inView(els[0], function () {
        M.animate(els,
          { opacity: [0, 1], transform: ['translateY(22px)', 'translateY(0px)'] },
          { duration: 0.8, delay: M.stagger(0.08), ease: EASE })
          .then(function () { els.forEach(function (el) { el.classList.add('is-shown'); }); });
      }, { amount: 0.12, margin: '0px 0px -6% 0px' });
    });
  }

  window.Prayatn = {
    reveal: function (root) {
      if (!canAnimate) { revealAll(); return; }
      playIntro(root);
      setupReveals(root);
    },
    revealAll: revealAll
  };

  /* =====================================================================
     Header — condenses as you scroll away from the top
     ===================================================================== */
  var header = document.querySelector('.site-header');
  if (header) {
    var condensed = false;
    var onScroll = function () {
      var should = window.scrollY > 40;
      if (should !== condensed) {
        condensed = should;
        header.classList.toggle('is-condensed', should);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* =====================================================================
     Parallax — the hero picture drifts slightly slower than the page
     ===================================================================== */
  if (canAnimate && M.scroll) {
    var heroFig = document.querySelector('.hero__media img');
    if (heroFig && window.innerWidth > 700) {
      try {
        M.scroll(function (progress) {
          heroFig.style.transform = 'translateY(' + (progress * 34) + 'px) scale(1.04)';
        }, { target: document.querySelector('.hero__media'), offset: ['start end', 'end start'] });
      } catch (e) { /* parallax is decoration; never let it break the page */ }
    }
  }

  /* =====================================================================
     Mobile menu — a sheet that slides in, with the links following
     ===================================================================== */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  var backdrop = document.querySelector('.nav-backdrop');
  var menuOpen = false;

  function setMenu(open) {
    if (!nav || open === menuOpen) return;
    menuOpen = open;
    nav.classList.toggle('is-open', open);
    if (backdrop) backdrop.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open && window.innerWidth <= 980 ? 'hidden' : '';

    var bars = toggle.querySelectorAll('.nav-toggle__bars i');

    if (!canAnimate) {
      nav.style.transform = open ? 'translateX(0%)' : 'translateX(100%)';
      if (backdrop) backdrop.style.opacity = open ? '1' : '0';
      return;
    }

    M.animate(nav, { transform: open ? 'translateX(0%)' : 'translateX(100%)' }, SPRING);
    if (backdrop) M.animate(backdrop, { opacity: open ? 1 : 0 }, { duration: 0.25 });

    if (bars.length === 3) {
      if (open) {
        M.animate(bars[0], { transform: 'translateY(7px) rotate(45deg)' }, { duration: 0.35, ease: EASE });
        M.animate(bars[1], { opacity: 0, transform: 'scaleX(0.3)' }, { duration: 0.2 });
        M.animate(bars[2], { transform: 'translateY(-7px) rotate(-45deg)' }, { duration: 0.35, ease: EASE });
      } else {
        M.animate(bars[0], { transform: 'translateY(0px) rotate(0deg)' }, { duration: 0.35, ease: EASE });
        M.animate(bars[1], { opacity: 1, transform: 'scaleX(1)' }, { duration: 0.25, delay: 0.1 });
        M.animate(bars[2], { transform: 'translateY(0px) rotate(0deg)' }, { duration: 0.35, ease: EASE });
      }
    }

    if (open) {
      var items = nav.querySelectorAll('.nav__link, .nav__cta');
      M.animate(items,
        { opacity: [0, 1], transform: ['translateX(26px)', 'translateX(0px)'] },
        { duration: 0.45, delay: M.stagger(0.05, { startDelay: 0.1 }), ease: EASE });
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!menuOpen); });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.innerWidth <= 980) setMenu(false);
    });
    if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); closeLightbox(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && menuOpen) setMenu(false);
    });
  }

  /* =====================================================================
     Page transitions — a short veil so pages do not snap between each other
     ===================================================================== */
  var veil = document.querySelector('.page-veil');
  if (veil && canAnimate) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (a.target === '_blank' || /^(https?:|mailto:|tel:|#)/.test(href)) return;
      if (a.origin && a.origin !== window.location.origin) return;
      e.preventDefault();
      veil.classList.add('is-active');
      M.animate(veil, { opacity: [0, 1] }, { duration: 0.24, ease: EASE })
        .then(function () { window.location.href = href; });
    });

    // coming back via the browser's back button must not land on a white veil
    window.addEventListener('pageshow', function () {
      veil.style.opacity = '0';
      veil.classList.remove('is-active');
    });
  }

  /* =====================================================================
     Start
     ===================================================================== */
  if (canAnimate) {
    playIntro(document);
    setupReveals(document);
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
        M.animate(0, target, { duration: 1.4, ease: EASE, onUpdate: function (v) { setValue(el, v); } });
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
        var im = trigger.querySelector('img');
        lastFocused = trigger;
        lightboxImg.src = im.dataset.full || im.src;
        lightboxImg.alt = im.alt;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('.lightbox__close').focus();
        if (canAnimate) {
          M.animate(lightbox, { opacity: [0, 1] }, { duration: 0.22 });
          M.animate(lightboxImg, { transform: ['scale(0.94)', 'scale(1)'], opacity: [0, 1] }, { duration: 0.4, ease: EASE });
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
      if (canAnimate) M.animate(status, { opacity: [0, 1], transform: ['translateY(-4px)', 'translateY(0px)'] }, { duration: 0.3 });
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
