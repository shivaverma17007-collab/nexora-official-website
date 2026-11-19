/* NEXORA website interactions — day/night nature scene and Calm Corner. */
(() => {
  'use strict';

  // Load the visual layer on every existing site page, not only the new pages.
  if (!document.querySelector('link[href="/assets/css/experience.css"]')) {
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = '/assets/css/experience.css';
    document.head.append(styleLink);
  }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive:true });

  const closeMenu = () => { if (!menu || !nav) return; menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation menu'); nav.classList.remove('is-open'); };
  if (menu && nav) {
    menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded',String(!open)); menu.setAttribute('aria-label',open?'Open navigation menu':'Close navigation menu'); nav.classList.toggle('is-open',!open); });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e => { if(e.key === 'Escape') closeMenu(); });
    document.addEventListener('click',e => { if(nav && menu && !nav.contains(e.target) && !menu.contains(e.target)) closeMenu(); });
  }
  if (nav && !nav.querySelector('a[href="/calm.html"]')) {
    const a = document.createElement('a'); a.href='/calm.html'; a.textContent='Calm Corner';
    const about = nav.querySelector('a[href="/about.html"]'); nav.insertBefore(a,about || nav.firstChild); a.addEventListener('click',closeMenu);
  }

  // A visible theme control in the header; preference stays on this device.
  const themeKey='nexora-site-theme'; let stored=null;
  try { stored=localStorage.getItem(themeKey); } catch(_) {}
  const themeButton=document.createElement('button'); themeButton.type='button'; themeButton.className='nx-header-theme';
  const setTheme = theme => {
    document.documentElement.dataset.nxTheme=theme;
    const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.content=theme==='day'?'#f3f7ff':'#090d22';
    const day=theme==='day'; themeButton.innerHTML=day?'<span aria-hidden="true">☾</span><span>Night</span>':'<span aria-hidden="true">☀</span><span>Day</span>';
    themeButton.setAttribute('aria-label',day?'Switch to night mode':'Switch to day mode'); themeButton.setAttribute('aria-pressed',String(day));
    try { localStorage.setItem(themeKey,theme); } catch(_) {}
    const hint=document.querySelector('[data-nx-scene-hint]'); if(hint) hint.textContent=day?'Tap a bird and watch it flutter to another branch.':'The moon is up. Tap the owl to wake it for a moment.';
  };
  themeButton.addEventListener('click',()=>setTheme(document.documentElement.dataset.nxTheme==='day'?'night':'day'));
  document.querySelector('.header-inner')?.append(themeButton);
  setTheme(stored==='day'||stored==='night'?stored:(window.matchMedia?.('(prefers-color-scheme: light)').matches?'day':'night'));

  // Tap a bird to make it fly, then perch at a new position.
  const birds=[...document.querySelectorAll('.nx-bird-perch')];
  const stops=[[['15%','42%'],['59%','28%'],['37%','53%']],[['70%','44%'],['25%','27%'],['50%','16%']]];
  birds.forEach((bird,i)=>{ let n=0; bird.addEventListener('click',()=>{ if(bird.classList.contains('is-flying')) return; n=(n+1)%stops[i].length; bird.classList.add('is-flying'); bird.style.left=stops[i][n][0]; bird.style.top=stops[i][n][1]; window.setTimeout(()=>bird.classList.remove('is-flying'),1150); }); });
  const owl=document.querySelector('.nx-owl'); owl?.addEventListener('click',()=>{ owl.classList.remove('is-awake'); void owl.offsetWidth; owl.classList.add('is-awake'); window.setTimeout(()=>owl.classList.remove('is-awake'),1200); });

  // Aquarium controls: feed and pause are local page interactions only.
  const tank=document.querySelector('.nx-tank'); const note=document.querySelector('[data-nx-aqua-note]'); const feed=document.querySelector('[data-nx-feed]'); const pause=document.querySelector('[data-nx-aqua-pause]'); let paused=false;
  feed?.addEventListener('click',()=>{ if(!tank)return; tank.classList.remove('is-feeding'); void tank.offsetWidth; tank.classList.add('is-feeding'); if(note)note.textContent='A little food is drifting down. The fish are coming over!'; window.setTimeout(()=>tank.classList.remove('is-feeding'),1800); });
  pause?.addEventListener('click',()=>{if(!tank)return;paused=!paused;tank.classList.toggle('is-paused',paused);pause.textContent=paused?'Resume the water':'Pause the water';if(note)note.textContent=paused?'The underwater garden is resting.':'The water is moving gently. Take your time.';});

  // Gentle 4-4-6 breathing guide. No data is recorded or saved.
  const start=document.querySelector('[data-nx-breath-start]'); const reset=document.querySelector('[data-nx-breath-reset]'); const orb=document.querySelector('.nx-breath-orb'); const label=document.querySelector('[data-nx-breath-label]'); const breathNote=document.querySelector('[data-nx-breath-note]');
  let timer=null,phase=0; const phases=[['Breathe in','Slowly breathe in for four counts.',4000],['Hold','Pause gently for four counts. No strain.',4000],['Breathe out','Let your breath go for six counts.',6000]];
  const stop=()=>{if(timer)clearTimeout(timer);timer=null;orb?.classList.remove('is-breathing','is-exhale','is-hold');if(start)start.textContent='Start breathing';};
  const cycle=()=>{const p=phases[phase];if(label)label.textContent=p[0];if(breathNote)breathNote.textContent=p[1];orb?.classList.toggle('is-exhale',phase===2);orb?.classList.toggle('is-hold',phase===1);timer=setTimeout(()=>{phase=(phase+1)%3;cycle();},p[2]);};
  start?.addEventListener('click',()=>{if(timer){stop();if(label)label.textContent='Paused';if(breathNote)breathNote.textContent='Take your time. Start again whenever you feel ready.';return;}orb?.classList.add('is-breathing');start.textContent='Pause breathing';cycle();});
  reset?.addEventListener('click',()=>{stop();phase=0;if(label)label.textContent='Ready?';if(breathNote)breathNote.textContent='When you are ready, begin with one comfortable breath.';});
  window.addEventListener('pagehide',stop);

  // The existing Features page gets a separate, clearly labelled second section.
  const grid=document.querySelector('.page-grid');
  if(grid&&!document.querySelector('.nx-feature-extra')){
    const extra=document.createElement('section');extra.className='nx-feature-extra';
    extra.innerHTML=`<div class="container nx-feature-extra-inner"><div class="nx-section-heading"><span class="eyebrow"><span class="eyebrow-dot"></span> MORE IN YOUR TOOLKIT</span><h2>More ways to focus and grow.</h2><p>These tools are part of the current NEXORA app experience.</p></div><div class="nx-extra-tool-grid">
    <article><span>◷</span><h3>Focus Sprint</h3><p>Set aside a focused block of time and work on one thing at a time.</p><small>In the app</small></article><article><span>⚑</span><h3>Discipline Sprints</h3><p>Try short, structured challenges that help you build consistency.</p><small>In the app</small></article><article><span>▤</span><h3>Current Affairs</h3><p>Keep a learning habit going with a dedicated current-affairs space.</p><small>In the app</small></article><article><span>↗</span><h3>Analytics</h3><p>Look back at activity and notice patterns in your progress.</p><small>In the app</small></article><article><span>⌛</span><h3>Time Tools</h3><p>Use time-focused utilities to give your plans more structure.</p><small>In the app</small></article><article><span>≈</span><h3>Mindful Moments</h3><p>Make room for breathing practice and small pauses in your day.</p><small>In the app</small></article></div>
    <div class="nx-plan-panel"><div><span class="eyebrow"><span class="eyebrow-dot"></span> WHAT WE'RE BUILDING NEXT</span><h2>A more personal NEXORA.</h2><p>Profiles, optional sign-in and safe guest-data continuity are development targets, not features available today. Timing may change while implementation and testing are completed.</p></div><div class="nx-plan-pills"><span>Personal profile</span><span>Optional sign-in</span><span>Safe guest-data merge</span><span>Google · Apple · Phone · Email</span><span class="future">Community & NOVA AI — future vision</span></div></div></div>`;
    grid.insertAdjacentElement('afterend',extra);
  }
  const faq=[...document.querySelectorAll('.faq-item')];faq.forEach(item=>item.addEventListener('toggle',()=>{if(item.open)faq.forEach(other=>{if(other!==item)other.open=false;});}));
  if(!reduced&&'IntersectionObserver'in window){document.documentElement.classList.add('js-ready');const observer=new IntersectionObserver((entries,instance)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');instance.unobserve(entry.target);}}),{threshold:.1,rootMargin:'0px 0px -25px 0px'});document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));}
})();
