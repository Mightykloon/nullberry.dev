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

  let start = null, end = null, ticking = false;

  function measure() {
    // natural in-flow rect of the splash (page coordinates)
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
    nav.style.transition = prev.tr;
    apply();
  }

  function apply() {
    if (!start || !end) return;
    const dockDist = Math.max(1, hero.offsetHeight * 0.6);
    const p = Math.min(1, Math.max(0, window.scrollY / dockDist));

    if (p === 0) {
      // fully home: restore in-flow layout and the breathing glow
      img.classList.remove('docking');
      img.style.cssText = '';
      return;
    }

    const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
    const curTop = start.top - window.scrollY; // where in-flow layout would put it now
    const left = start.left + (end.left - start.left) * e;
    const top = curTop + (end.top - curTop) * e;
    const width = start.width + (end.width - start.width) * e;

    img.classList.add('docking');
    img.style.left = left + 'px';
    img.style.top = top + 'px';
    img.style.width = width + 'px';
    img.style.filter = 'drop-shadow(0 0 ' + (30 * (1 - e)) + 'px rgba(255,255,255,' + (0.3 * (1 - e)).toFixed(3) + '))';
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() { apply(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function() { requestAnimationFrame(measure); });
  if (img.complete) measure(); else img.addEventListener('load', measure);
  window.addEventListener('load', function() { requestAnimationFrame(measure); });
})();
