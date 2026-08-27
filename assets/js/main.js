/* Prayatn — site behaviour. No dependencies, no build step. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- sticky header shadow ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open && window.innerWidth <= 940 ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.innerWidth <= 940) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- dropdown menus (click on touch/mobile, hover on desktop) ---- */
  var items = document.querySelectorAll('.nav__item');
  Array.prototype.forEach.call(items, function (item) {
    var btn = item.querySelector('[aria-haspopup="true"]');
    if (!btn) return;

    var open = function (state) {
      item.classList.toggle('is-open', state);
      btn.setAttribute('aria-expanded', String(state));
    };

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      open(!item.classList.contains('is-open'));
    });
    item.addEventListener('mouseenter', function () { if (window.innerWidth > 940) open(true); });
    item.addEventListener('mouseleave', function () { if (window.innerWidth > 940) open(false); });
    item.addEventListener('focusout', function (e) {
      if (window.innerWidth > 940 && !item.contains(e.relatedTarget)) open(false);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    Array.prototype.forEach.call(document.querySelectorAll('.nav__item.is-open'), function (i) {
      i.classList.remove('is-open');
      var b = i.querySelector('[aria-haspopup="true"]');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    closeLightbox();
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('.nav__item')) return;
    Array.prototype.forEach.call(document.querySelectorAll('.nav__item.is-open'), function (i) {
      if (window.innerWidth > 940) return;
      i.classList.remove('is-open');
      var b = i.querySelector('[aria-haspopup="true"]');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- scroll reveal ---- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Number(el.dataset.delay || 0);
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  /* ---- count-up numbers ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var run = function (el) {
      var target = Number(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      if (reduceMotion || !target) { el.textContent = target + suffix; return; }
      var start = performance.now();
      var dur = 1400;
      var step = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          co.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { co.observe(el); });
    } else {
      Array.prototype.forEach.call(counters, run);
    }
  }

  /* ---- gallery lightbox ---- */
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
        return;
      }
      if (e.target.closest('.lightbox__close') || e.target === lightbox) closeLightbox();
    });
  }

  /* ---- forms ----------------------------------------------------------
     No backend is wired up yet. Set data-endpoint on the <form> to a
     Formspree / Netlify Forms URL and submissions post there; until then
     the form opens the visitor's email client, pre-filled.
     ------------------------------------------------------------------- */
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
      var subject = form.dataset.subject || 'Website enquiry';
      window.location.href = 'mailto:' + form.dataset.mailto +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n\n'));
      say('Your email app should now open with this message ready to send. If it does not, please write to ' + form.dataset.mailto + '.', true);
    });
  });

  /* ---- current year in footer ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
