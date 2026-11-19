/* NEXORA website interactions — lightweight, accessible and page-specific. */
(() => {
  'use strict';
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Use the custom S monogram consistently, including the existing legal pages.
  document.querySelectorAll('.brand-mark').forEach(mark => {
    mark.innerHTML = '<img src="/assets/img/s-monogram.svg" alt="" width="33" height="33">';
  });

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader(); window.addEventListener('scroll', updateHeader, {passive:true});
  const closeMenu = () => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Open navigation menu');
    nav.classList.remove('is-open');
  };
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!open));
      menu.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
      nav.classList.toggle('is-open', !open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', e => {
      if (nav && menu && !nav.contains(e.target) && !menu.contains(e.target)) closeMenu();
    });
  }

  // Mark the current destination in the desktop and mobile navigation.
  const path = location.pathname.replace(/\/$/, '/index.html');
  nav?.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/') && href === path) a.setAttribute('aria-current','page');
  });

  // Reveal content as it enters the viewport. Content stays visible without JS.
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-ready');
    const observer = new IntersectionObserver((entries, instance) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); instance.unobserve(entry.target); }
    }), {threshold:.12, rootMargin:'0px 0px -25px 0px'});
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }

  // Single-page breathing demo: comfortable pacing, no storage or data collection.
  const start = document.querySelector('[data-breath-start]');
  const reset = document.querySelector('[data-breath-reset]');
  const orb = document.querySelector('.breath-orb');
  const label = document.querySelector('[data-breath-label]');
  const note = document.querySelector('[data-breath-note]');
  let timer = null, phase = 0;
  const phases = [
    {name:'Breathe in', note:'Breathe in gently for four counts.', duration:4000, cls:'is-inhale'},
    {name:'Hold', note:'Pause comfortably for four counts.', duration:4000, cls:'is-hold'},
    {name:'Breathe out', note:'Breathe out slowly for six counts.', duration:6000, cls:'is-exhale'}
  ];
  const stop = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    orb?.classList.remove('is-inhale','is-hold','is-exhale');
    if (start) start.textContent = 'Start breathing';
  };
  const cycle = () => {
    const p = phases[phase];
    if (label) label.textContent = p.name;
    if (note) note.textContent = p.note;
    orb?.classList.remove('is-inhale','is-hold','is-exhale');
    orb?.classList.add(p.cls);
    timer = setTimeout(() => { phase = (phase + 1) % phases.length; cycle(); }, p.duration);
  };
  start?.addEventListener('click', () => {
    if (timer) {
      stop();
      if (label) label.textContent = 'Paused';
      if (note) note.textContent = 'Take your time. Start again whenever you feel ready.';
    } else {
      start.textContent = 'Pause breathing';
      cycle();
    }
  });
  reset?.addEventListener('click', () => {
    stop(); phase = 0;
    if (label) label.textContent = 'Ready?';
    if (note) note.textContent = 'Begin whenever you feel comfortable. There is no need to force your breath.';
  });
  window.addEventListener('pagehide', stop);
})();
