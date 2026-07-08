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
