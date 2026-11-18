/* NEXORA official website interactions. This file is safe to load on every website page. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Load the optional experience layer without requiring HTML edits on every page.
  if (!document.querySelector('[data-nx-experience-style]')) {
    const experienceStyle = document.createElement('link');
    experienceStyle.rel = 'stylesheet';
    experienceStyle.href = '/assets/css/experience.css';
    experienceStyle.dataset.nxExperienceStyle = 'true';
    document.head.append(experienceStyle);
  }

  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Keep the current mobile navigation behaviour.
  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 16);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation menu');
    nav.classList.remove('is-open');
  };
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const isOpen = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!isOpen));
      menu.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });
  }

  // Existing scroll reveal behaviour.
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-ready');
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  // Day/night mode. The preference is stored only in this browser on this device.
  const themeKey = 'nexora-site-theme';
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(themeKey); } catch (error) { /* Storage may be disabled. */ }
  const applyTheme = theme => {
    document.documentElement.dataset.nxTheme = theme;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'day' ? '#f7f5ff' : '#080918');
    try { localStorage.setItem(themeKey, theme); } catch (error) { /* Theme still works for this page. */ }
  };
  applyTheme(savedTheme === 'day' || savedTheme === 'night' ? savedTheme : 'night');

  const themeButton = document.createElement('button');
  themeButton.className = 'nx-theme-toggle';
  themeButton.type = 'button';
  themeButton.setAttribute('aria-label', 'Switch website colour theme');
  const syncThemeButton = () => {
    const isDay = document.documentElement.dataset.nxTheme === 'day';
    themeButton.innerHTML = isDay
      ? '<span aria-hidden="true">🌙</span><span>Night mode</span>'
      : '<span aria-hidden="true">☀️</span><span>Day mode</span>';
    themeButton.setAttribute('aria-pressed', String(isDay));
  };
  themeButton.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.nxTheme === 'day' ? 'night' : 'day');
    syncThemeButton();
  });
  document.body.append(themeButton);
  syncThemeButton();

  // Birds fly through the home hero. They are decorative and hidden from screen readers.
  const homeHero = document.querySelector('.home-hero');
  if (homeHero && !homeHero.querySelector('.nx-birds')) {
    const birds = document.createElement('div');
    birds.className = 'nx-birds';
    birds.setAttribute('aria-hidden', 'true');
    birds.innerHTML = '<span class="nx-bird">🕊️</span><span class="nx-bird">🐦</span><span class="nx-bird">🕊️</span><span class="nx-bird">🐦</span>';
    homeHero.append(birds);
  }

  // Preserve the site's hero carousel if a page uses it.
  const heroSlides = [...document.querySelectorAll('.hero-slide')];
  const heroDots = [...document.querySelectorAll('[data-hero-dot]')];
  let heroIndex = 0;
  let heroTimer = null;
  let heroPaused = reduceMotion;
  const showHero = index => {
    if (!heroSlides.length) return;
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === heroIndex);
      slide.setAttribute('aria-hidden', String(position !== heroIndex));
    });
    heroDots.forEach((dot, position) => dot.setAttribute('aria-current', String(position === heroIndex)));
  };
  const heroToggle = document.querySelector('[data-hero-toggle]');
  const startHero = () => {
    if (heroTimer) window.clearInterval(heroTimer);
    if (!heroPaused && heroSlides.length > 1) heroTimer = window.setInterval(() => showHero(heroIndex + 1), 4500);
  };
  heroDots.forEach((dot, index) => dot.addEventListener('click', () => { showHero(index); startHero(); }));
  if (heroToggle) heroToggle.addEventListener('click', () => {
    heroPaused = !heroPaused;
    heroToggle.textContent = heroPaused ? 'Play' : 'Pause';
    startHero();
  });
  showHero(0);
  startHero();

  // Feature carousel: autoplay, dots, previous/next arrows and touch swipe.
  const track = document.querySelector('.feature-track');
  const featureDots = [...document.querySelectorAll('[data-feature-dot]')];
  const featureToggle = document.querySelector('[data-feature-toggle]');
  let featureIndex = 0;
  let featureTimer = null;
  let featurePaused = reduceMotion;
  const visibleFeatureCount = () => window.innerWidth <= 680 ? 1 : 3;
  const maxFeatureIndex = () => Math.max(0, track ? track.children.length - visibleFeatureCount() : 0);
  const showFeature = index => {
    if (!track || !track.children.length) return;
    featureIndex = Math.max(0, Math.min(index, maxFeatureIndex()));
    const firstCard = track.children[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 14;
    const step = firstCard.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(${-featureIndex * step}px)`;
    const activeDot = featureDots.length > 1 && maxFeatureIndex() > 0
      ? Math.round((featureIndex / maxFeatureIndex()) * (featureDots.length - 1))
      : 0;
    featureDots.forEach((dot, position) => {
      dot.setAttribute('aria-current', String(position === activeDot));
    });
    if (previousButton) previousButton.disabled = featureIndex <= 0;
    if (nextButton) nextButton.disabled = featureIndex >= maxFeatureIndex();
  };
  const startFeatureAutoplay = () => {
    if (featureTimer) window.clearInterval(featureTimer);
    if (!featurePaused && track && maxFeatureIndex() > 0) {
      featureTimer = window.setInterval(() => {
        showFeature(featureIndex >= maxFeatureIndex() ? 0 : featureIndex + 1);
      }, 4200);
    }
  };
  const moveFeature = delta => {
    showFeature(featureIndex + delta);
    startFeatureAutoplay();
  };

  let previousButton = null;
  let nextButton = null;
  if (track) {
    const controls = document.querySelector('.carousel-controls');
    if (controls) {
      const arrowWrap = document.createElement('div');
      arrowWrap.className = 'nx-carousel-arrows';
      arrowWrap.innerHTML = '<button type="button" data-nx-prev aria-label="Previous feature">←</button><button type="button" data-nx-next aria-label="Next feature">→</button>';
      controls.insertAdjacentElement('afterend', arrowWrap);
      previousButton = arrowWrap.querySelector('[data-nx-prev]');
      nextButton = arrowWrap.querySelector('[data-nx-next]');
      previousButton.addEventListener('click', () => moveFeature(-1));
      nextButton.addEventListener('click', () => moveFeature(1));
    }
    featureDots.forEach((dot, index) => dot.addEventListener('click', () => {
      const dotTarget = featureDots.length > 1
        ? Math.round((index / (featureDots.length - 1)) * maxFeatureIndex())
        : 0;
      showFeature(dotTarget);
      startFeatureAutoplay();
    }));

    let touchStartX = 0;
    track.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', event => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 42) moveFeature(distance < 0 ? 1 : -1);
    }, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') moveFeature(1);
      if (event.key === 'ArrowLeft') moveFeature(-1);
    });
  }
  if (featureToggle) featureToggle.addEventListener('click', () => {
    featurePaused = !featurePaused;
    featureToggle.textContent = featurePaused ? 'Play' : 'Pause';
    startFeatureAutoplay();
  });
  window.addEventListener('resize', () => showFeature(featureIndex));
  showFeature(0);
  startFeatureAutoplay();

  // Aquarium demo. Feeding and pausing are local page interactions only.
  const homeQuick = document.querySelector('.home-quick');
  if (homeQuick && !document.querySelector('.nx-aqua-section')) {
    const aquariumSection = document.createElement('section');
    aquariumSection.className = 'nx-aqua-section container';
    aquariumSection.innerHTML = `
      <div class="nx-aquarium">
        <div class="nx-aqua-head">
          <div>
            <span class="nx-aqua-kicker">A LITTLE DIGITAL ESCAPE</span>
            <h2>Your tiny underwater world 🫧</h2>
            <p>Take a breath, watch the fish drift by and give your mind a colourful pause. No goals to chase here.</p>
          </div>
        </div>
        <div class="nx-tank" role="group" aria-label="Decorative animated aquarium">
          <span class="nx-fish fish-one" aria-hidden="true">🐠</span>
          <span class="nx-fish fish-two" aria-hidden="true">🐟</span>
          <span class="nx-fish fish-three" aria-hidden="true">🐡</span>
          <span class="nx-fish fish-four" aria-hidden="true">🐠</span>
          <span class="nx-plant plant-one" aria-hidden="true"></span>
          <span class="nx-plant plant-two" aria-hidden="true"></span>
          <span class="nx-plant plant-three" aria-hidden="true"></span>
          <span class="nx-bubble bubble-one" aria-hidden="true"></span>
          <span class="nx-bubble bubble-two" aria-hidden="true"></span>
          <span class="nx-bubble bubble-three" aria-hidden="true"></span>
          <span class="nx-bubble bubble-four" aria-hidden="true"></span>
        </div>
        <div class="nx-aqua-actions">
          <button type="button" data-nx-feed>🐟 Feed the fish</button>
          <button type="button" data-nx-aqua-pause>Ⅱ Pause aquarium</button>
          <span class="nx-aqua-note" aria-live="polite">A tiny moment of calm. Just for you.</span>
        </div>
      </div>`;
    homeQuick.insertAdjacentElement('afterend', aquariumSection);

    const tank = aquariumSection.querySelector('.nx-tank');
    const aquaNote = aquariumSection.querySelector('.nx-aqua-note');
    const feedButton = aquariumSection.querySelector('[data-nx-feed]');
    const pauseButton = aquariumSection.querySelector('[data-nx-aqua-pause]');
    feedButton.addEventListener('click', () => {
      aquaNote.textContent = 'The fish say thank you! 🫧 Take one slow breath.';
      tank.querySelectorAll('.nx-fish').forEach(fish => {
        if (typeof fish.animate === 'function') {
          fish.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-18px)' }, { transform: 'translateY(0)' }], { duration: 650 });
        }
      });
    });
    pauseButton.addEventListener('click', () => {
      const paused = tank.classList.toggle('is-paused');
      pauseButton.textContent = paused ? '▶ Resume aquarium' : 'Ⅱ Pause aquarium';
      aquaNote.textContent = paused ? 'The underwater world is resting.' : 'The fish are swimming again.';
    });
  }

  // A compact roadmap so visitors know what the next update is working towards.
  if (homeQuick && !document.querySelector('.nx-roadmap-strip')) {
    const roadmap = document.createElement('section');
    roadmap.className = 'nx-roadmap-strip container';
    roadmap.innerHTML = `
      <div class="nx-roadmap-top">
        <span class="nx-roadmap-label">The next NEXORA chapter</span>
        <span class="nx-roadmap-target">Target: coming week</span>
      </div>
      <h2>A more personal NEXORA is on the way.</h2>
      <p>We’re preparing profiles and a guest-first account experience, while keeping your existing progress in mind.</p>
      <div class="nx-roadmap-pills"><span>👤 Personal profile</span><span>🔐 Optional sign-in</span><span>🧩 Safe guest-data merge</span><span>🌐 Google · Apple · Phone · Email</span></div>
      <p class="nx-roadmap-foot">These are planned updates, not features available today. Timing may change while development and testing are completed.</p>`;
    const aquarium = document.querySelector('.nx-aqua-section');
    if (aquarium) aquarium.insertAdjacentElement('afterend', roadmap);
    else homeQuick.insertAdjacentElement('afterend', roadmap);
  }

  // Small website-only demos: timer and mood check-in. Nothing is sent to NEXORA or saved.
  if (homeQuick && !document.querySelector('.nx-playground')) {
    const playground = document.createElement('section');
    playground.className = 'nx-playground container';
    playground.innerHTML = `
      <div class="nx-playground-heading">
        <span class="eyebrow"><span class="eyebrow-dot"></span> TRY A LITTLE SOMETHING</span>
        <h2>Explore a few tiny moments.</h2>
        <p>Just website demos — they do not change or save your NEXORA app data.</p>
      </div>
      <div class="nx-demo-grid">
        <article class="nx-demo-card">
          <span class="nx-demo-kicker">A small reset</span>
          <h3>5-minute focus timer</h3>
          <p>Give one small thing your attention. You can pause or reset whenever you like.</p>
          <div class="nx-timer-display" data-nx-timer aria-live="off">05:00</div>
          <div class="nx-demo-actions"><button type="button" data-nx-timer-start>Start</button><button type="button" data-nx-timer-reset>Reset</button></div>
          <p class="nx-demo-note" data-nx-timer-note aria-live="polite">A fresh five minutes, whenever you're ready.</p>
        </article>
        <article class="nx-demo-card">
          <span class="nx-demo-kicker">A quick check-in</span>
          <h3>How are you feeling?</h3>
          <p>Choose an emoji that matches this moment. No account, no submission.</p>
          <div class="nx-mood-options" role="group" aria-label="Choose a mood">
            <button type="button" data-nx-mood="Bright" aria-label="Bright" aria-pressed="false">😄</button>
            <button type="button" data-nx-mood="Okay" aria-label="Okay" aria-pressed="false">🙂</button>
            <button type="button" data-nx-mood="Tired" aria-label="Tired" aria-pressed="false">😴</button>
            <button type="button" data-nx-mood="Stressed" aria-label="Stressed" aria-pressed="false">😵‍💫</button>
            <button type="button" data-nx-mood="Calm" aria-label="Calm" aria-pressed="false">😌</button>
          </div>
          <p class="nx-demo-note" data-nx-mood-note aria-live="polite">Every mood is welcome here.</p>
        </article>
      </div>`;
    const roadmap = document.querySelector('.nx-roadmap-strip');
    const aquarium = document.querySelector('.nx-aqua-section');
    if (roadmap) roadmap.insertAdjacentElement('afterend', playground);
    else if (aquarium) aquarium.insertAdjacentElement('afterend', playground);
    else homeQuick.insertAdjacentElement('afterend', playground);

    let remaining = 300;
    let timerId = null;
    const timerDisplay = playground.querySelector('[data-nx-timer]');
    const timerNote = playground.querySelector('[data-nx-timer-note]');
    const startButton = playground.querySelector('[data-nx-timer-start]');
    const resetButton = playground.querySelector('[data-nx-timer-reset]');
    const drawTime = () => {
      const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
      const seconds = (remaining % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${minutes}:${seconds}`;
    };
    const stopTimer = () => {
      if (timerId) window.clearInterval(timerId);
      timerId = null;
      startButton.textContent = 'Start';
    };
    startButton.addEventListener('click', () => {
      if (timerId) {
        stopTimer();
        timerNote.textContent = 'Timer paused. Pick it up whenever you are ready.';
        return;
      }
      if (remaining <= 0) remaining = 300;
      startButton.textContent = 'Pause';
      timerNote.textContent = 'One small thing at a time.';
      timerId = window.setInterval(() => {
        remaining -= 1;
        drawTime();
        if (remaining <= 0) {
          stopTimer();
          timerNote.textContent = 'Five minutes complete. Nice work taking that pause! ✨';
        }
      }, 1000);
    });
    resetButton.addEventListener('click', () => {
      stopTimer();
      remaining = 300;
      drawTime();
      timerNote.textContent = 'Timer reset. A fresh five minutes.';
    });
    drawTime();

    const moodButtons = [...playground.querySelectorAll('[data-nx-mood]')];
    const moodNote = playground.querySelector('[data-nx-mood-note]');
    moodButtons.forEach(button => button.addEventListener('click', () => {
      moodButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      moodNote.textContent = `${button.dataset.nxMood} — thanks for checking in with yourself. 💜`;
    }));
  }

  // Extend the Features page with tools and a clearly-labelled roadmap.
  const featureGrid = document.querySelector('.page-grid');
  if (featureGrid && !document.querySelector('.nx-feature-extra')) {
    const extra = document.createElement('section');
    extra.className = 'nx-feature-extra';
    extra.innerHTML = `
      <div class="container">
        <h2>More ways to focus and grow</h2>
        <p class="nx-section-intro">A wider look at the tools and experiences in the NEXORA app.</p>
        <div class="nx-roadmap-grid">
          <article class="nx-roadmap-card"><span class="nx-card-icon">⏱️</span><h3>Focus Sprint</h3><p>Set aside a focused block of time and work on one thing at a time.</p><span class="nx-status">In the app</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">🏁</span><h3>Discipline Sprints</h3><p>Try short, structured challenges that help you build consistency.</p><span class="nx-status">In the app</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">🗞️</span><h3>Current Affairs</h3><p>Keep a learning habit going with a dedicated current-affairs space.</p><span class="nx-status">In the app</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">📈</span><h3>Past Analytics</h3><p>Look back at your activity and notice patterns in your progress.</p><span class="nx-status">In the app</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">⌛</span><h3>Time Tools</h3><p>Use time-focused utilities to give your plans more structure.</p><span class="nx-status">In the app</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">🧘</span><h3>Mindful Moments</h3><p>Make room for breathing practice and small pauses during the day.</p><span class="nx-status">Available now</span></article>
        </div>
      </div>
      <div class="container" style="margin-top:38px">
        <h2>What we're building next</h2>
        <p class="nx-section-intro">Planned work is labelled honestly so you can tell what's ready today and what's still being built.</p>
        <div class="nx-roadmap-grid">
          <article class="nx-roadmap-card"><span class="nx-card-icon">👤</span><h3>Personal profile & account centre</h3><p>A dedicated place for profile details and account settings.</p><span class="nx-status status-week">Target: coming week</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">🔐</span><h3>Guest-first sign-in</h3><p>Explore first, then optionally sign in with Google, Apple, phone or email.</p><span class="nx-status status-week">Target: coming week</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">🧩</span><h3>Safe guest-data continuity</h3><p>Keep guest progress safe and provide a careful merge choice when an account is connected.</p><span class="nx-status status-week">Target: coming week</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">🌐</span><h3>Community & sharing</h3><p>Explore public profiles and ways to share selected progress with others.</p><span class="nx-status status-future">Future vision</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">✨</span><h3>NOVA AI</h3><p>A future assistant concept to help people plan, reflect and stay on track.</p><span class="nx-status status-future">Future vision</span></article>
          <article class="nx-roadmap-card"><span class="nx-card-icon">🎨</span><h3>Deeper personalisation</h3><p>More ways to shape the experience around your own routines and preferences.</p><span class="nx-status status-future">Future vision</span></article>
        </div>
        <p class="nx-section-intro" style="margin-top:15px">The coming-week items are development targets, not a promise of a release date. Final availability depends on implementation and testing.</p>
      </div>`;
    const pageContent = document.querySelector('.page-content');
    if (pageContent) pageContent.insertAdjacentElement('afterend', extra);
  }

  // Keep the FAQ accordion's existing one-at-a-time behaviour.
  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems.forEach(item => item.addEventListener('toggle', () => {
    if (item.open) faqItems.forEach(other => { if (other !== item) other.open = false; });
  }));
})();
