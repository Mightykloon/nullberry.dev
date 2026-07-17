/* ═══════════════════════════════════════
   NULLBERRY — main.js
   ═══════════════════════════════════════ */

// Nav visibility & scroll state
(function() {
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');

  function updateNav() {
    const scrollY = window.scrollY;
    const heroBottom = hero.offsetHeight * 0.6;

    if (scrollY > heroBottom) {
      nav.classList.add('visible', 'scrolled');
    } else {
      nav.classList.remove('visible', 'scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

// Mobile nav toggle
(function() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => links.classList.toggle('open'));

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
})();

// Scroll reveal
(function() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
})();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Hide scroll indicator on scroll
(function() {
  const indicator = document.getElementById('scrollIndicator');
  if (!indicator) return;

  let hidden = false;
  window.addEventListener('scroll', () => {
    if (!hidden && window.scrollY > 100) {
      indicator.style.opacity = '0';
      indicator.style.transition = 'opacity 0.5s';
      hidden = true;
    }
  }, { passive: true });
})();

// Hero wordmark docks into the nav logo slot as you scroll
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const img = document.querySelector('.splash-img');
  const wrap = document.getElementById('heroLogo');
  const nav = document.getElementById('nav');
  const navImg = document.querySelector('.nav-logo-img');
  const hero = document.getElementById('hero');
  if (!img || !wrap || !nav || !navImg || !hero) return;

  document.documentElement.classList.add('logo-dock');

  let start = null, end = null, ticking = false, flight = null;
  const mobileMq = window.matchMedia('(max-width: 768px)');

  // steady-state: transforms are scroll-scrubbed by JS, so only let CSS
  // transition the backdrop styles (mobile keeps its own CSS behavior)
  function navTransitionBase() {
    nav.style.transition = mobileMq.matches ? '' : 'background 0.4s ease, border-color 0.4s ease';
  }
  navTransitionBase();

  function measure() {
    // natural in-flow rect of the splash (page coordinates)
    if (img.parentElement !== wrap) wrap.appendChild(img);
    img.classList.remove('docking');
    img.style.cssText = '';
    wrap.style.height = '';
    const r = img.getBoundingClientRect();
    start = { left: r.left, top: r.top + window.scrollY, width: r.width };
    wrap.style.height = r.height + 'px'; // reserve layout space once fixed

    // nav logo slot rect (nav is fixed; force it measurable without its
    // slide transition interfering, then restore)
    const prev = { tr: nav.style.transition, t: nav.style.transform, v: nav.style.visibility, o: nav.style.opacity };
    nav.style.transition = 'none';
    nav.style.transform = 'none'; nav.style.visibility = 'hidden'; nav.style.opacity = '1';
    void nav.offsetHeight; // force reflow so the override applies before measuring
    const nr = navImg.getBoundingClientRect();
    end = { left: nr.left, top: nr.top, width: nr.width };
    nav.style.transform = prev.t; nav.style.visibility = prev.v; nav.style.opacity = prev.o;
    void nav.offsetHeight;
    navTransitionBase();
    apply();
  }

  function apply() {
    if (!start || !end) return;
    const dockDist = Math.max(1, hero.offsetHeight * 0.6);
    const p = Math.min(1, Math.max(0, window.scrollY / dockDist));

    // fade the hero bloom in lockstep so the halo leaves WITH the
    // wordmark rather than lingering as an empty spotlight
    hero.style.setProperty('--hero-bloom', (1 - (1 - Math.pow(1 - p, 3))).toFixed(3));

    // nav descent is scrubbed by the same scroll progress: it starts
    // sliding down mid-flight and locks in exactly as the wordmark lands
    if (!mobileMq.matches) {
      const q = Math.min(1, Math.max(0, (p - 0.45) / 0.55));
      const qe = 1 - Math.pow(1 - q, 3);
      nav.style.transform = 'translateY(' + (qe * 100 - 100).toFixed(2) + '%)';
      nav.style.opacity = qe.toFixed(3);
    } else {
      nav.style.transform = '';
      nav.style.opacity = '';
    }

    if (p === 0) {
      // fully home: back into the hero, in-flow, breathing glow restored
      flight = null;
      if (img.parentElement !== wrap) wrap.appendChild(img);
      img.classList.remove('docking');
      img.style.cssText = '';
      return;
    }

    // seamless glow handoff: sample the breathing animation's live
    // radius/alpha the instant the flight starts, so there is no pop
    if (!flight) {
      const m = getComputedStyle(img).filter.match(/rgba\(255,\s*255,\s*255,\s*([\d.]+)\)\s*0px\s*0px\s*([\d.]+)px/);
      flight = { a0: m ? parseFloat(m[1]) : 0.3, r0: m ? parseFloat(m[2]) : 34 };
    }

    const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
    const curTop = start.top - window.scrollY; // where in-flow layout would put it now
    const left = start.left + (end.left - start.left) * e;
    const top = curTop + (end.top - curTop) * e;
    const width = start.width + (end.width - start.width) * e;

    // portal to <body>: the hero section is its own stacking context
    // (z-index 1), so the image must leave it to render above the nav
    if (img.parentElement !== document.body) document.body.appendChild(img);
    img.classList.add('docking');
    img.style.left = left + 'px';
    img.style.top = top + 'px';
    img.style.width = width + 'px';
    // the glow shrinks in proportion to the wordmark itself, easing from
    // its captured live value to a size-matched halo at the nav
    const rDock = Math.max(6, 34 * (end.width / start.width));
    const rr = flight.r0 + (rDock - flight.r0) * e;
    const aa = flight.a0 + (0.3 - flight.a0) * e;
    img.style.filter = 'drop-shadow(0 0 ' + rr.toFixed(1) + 'px rgba(255,255,255,' + aa.toFixed(3) + '))';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() { apply(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function() { requestAnimationFrame(measure); });
  mobileMq.addEventListener('change', function() {
    nav.style.transform = ''; nav.style.opacity = '';
    navTransitionBase();
    requestAnimationFrame(measure);
  });
  if (img.complete) measure(); else img.addEventListener('load', measure);
  window.addEventListener('load', function() { requestAnimationFrame(measure); });
})();

// Hero tagline "encrypts" away on scroll — cyberpunk ASCII obfuscation.
// It pins in place against the static background and dissolves in a
// random per-character order after jumbling through glyphs.
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const tag = document.querySelector('.hero-tagline');
  const hero = document.getElementById('hero');
  if (!tag || !hero) return;

  const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFXZ$%&@01001';
  const rndGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const BAND = 0.16;  // scramble window before a char dies
  const FADE = 0.10;  // dissolve window after it dies

  const source = tag.textContent;
  tag.textContent = '';
  tag.classList.add('encrypting');
  const chars = [...source].map(function(ch) {
    const s = document.createElement('span');
    s.className = 'enc-char';
    s.textContent = ch;
    s._ch = ch;
    // spaces never scramble; letters die in a random order
    s._th = ch === ' ' ? 2 : 0.08 + Math.random() * 0.5;
    tag.appendChild(s);
    return s;
  });

  let vpTop = 0, vpLeft = 0, w = 0, pinned = false, tick = 0;

  function measure() {
    tag.style.position = ''; tag.style.left = ''; tag.style.top = '';
    tag.style.width = ''; tag.style.display = '';
    pinned = false;
    const r = tag.getBoundingClientRect();
    vpTop = r.top; vpLeft = r.left; w = r.width;
  }

  function reset() {
    tag.classList.remove('scrambling');
    if (tag.style.display === 'none') tag.style.display = '';
    if (pinned) measure();
    chars.forEach(function(s) {
      if (s.textContent !== s._ch) s.textContent = s._ch;
      s.style.opacity = '1';
      s.classList.remove('on');
    });
  }

  function frame() {
    const dockDist = Math.max(1, hero.offsetHeight * 0.6);
    const p = Math.min(1, Math.max(0, window.scrollY / dockDist));

    if (p <= 0) { reset(); return requestAnimationFrame(frame); }

    if (p >= 0.72) {                       // fully gone: hide, skip churn
      if (tag.style.display !== 'none') tag.style.display = 'none';
      return requestAnimationFrame(frame);
    }
    if (tag.style.display === 'none') tag.style.display = '';

    if (!pinned) {                         // pin so it dissolves in place
      tag.style.position = 'fixed';
      tag.style.left = vpLeft + 'px';
      tag.style.top = vpTop + 'px';
      tag.style.width = w + 'px';
      pinned = true;
    }
    tag.classList.add('scrambling');

    const churn = (tick++ % 2) === 0;      // ~30fps glyph churn
    chars.forEach(function(s) {
      if (s._ch === ' ') { s.textContent = ' '; return; }
      const th = s._th;
      if (p < th - BAND) {                 // untouched
        if (s.textContent !== s._ch) s.textContent = s._ch;
        s.style.opacity = '1';
        s.classList.remove('on');
      } else if (p < th) {                 // scrambling
        if (churn) s.textContent = rndGlyph();
        s.style.opacity = '1';
        s.classList.add('on');
      } else {                             // dissolving
        if (churn && Math.random() < 0.6) s.textContent = rndGlyph();
        s.style.opacity = Math.max(0, 1 - (p - th) / FADE).toFixed(2);
        s.classList.add('on');
      }
    });
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', function() { if (window.scrollY <= 0) measure(); });
  window.addEventListener('load', measure);
  measure();
  requestAnimationFrame(frame);
})();
