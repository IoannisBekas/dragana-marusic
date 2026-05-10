/* =========================================================
   MARUSIC — interactions
   ========================================================= */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  window.lenis = lenis;

  /* ---------- Preloader (CSS-driven, JS just hides at end) ---------- */
  function runPreloader(){
    const pre = document.querySelector('[data-pre]');
    if (!pre) return Promise.resolve();
    if (reduceMotion){ pre.style.display = 'none'; return Promise.resolve(); }

    const counter = pre.querySelector('[data-pre-count]');
    const total = 2200;   // ms — count + bar duration
    const exitAfter = 3200; // total time before lifting off
    const startedAt = performance.now();

    return new Promise(resolve => {
      function tick(now){
        const t = Math.min(1, (now - startedAt) / total);
        if (counter) counter.textContent = String(Math.round(t * 100)).padStart(2,'0');
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      // Trigger the CSS-driven exit animation
      setTimeout(() => {
        pre.classList.add('is-out');
        setTimeout(() => {
          pre.style.display = 'none';
          resolve();
        }, 1200);
      }, exitAfter);
    });
  }

  /* ---------- Hero name reveal ---------- */
  function animateHero(){
    const heroSplit = document.querySelector('.hero__name [data-split]');
    if (heroSplit){
      gsap.to(heroSplit, { y: '0%', duration: 1.4, ease: 'expo.out' });
    }
  }

  /* ---------- Generic [data-split] line reveals on scroll ---------- */
  function animateSplits(){
    document.querySelectorAll('.marker [data-split], .frame [data-split], .end [data-split]').forEach(el => {
      gsap.to(el, {
        y: '0%',
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ---------- Marker rule sweep ---------- */
  function animateRules(){
    document.querySelectorAll('[data-rule]').forEach(el => {
      gsap.to(el, {
        scaleX: 1,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
  }

  /* ---------- Generic fades ---------- */
  function animateFades(){
    document.querySelectorAll('[data-fade]').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter(){ el.classList.add('is-in'); }
      });
    });
  }

  /* ---------- Image masked reveals ---------- */
  function animateReveals(){
    document.querySelectorAll('[data-reveal]').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter(){ el.classList.add('is-in'); }
      });
    });
  }

  /* ---------- Manifesto words: scroll-scrubbed opacity ---------- */
  function setupWords(){
    document.querySelectorAll('[data-words]').forEach(node => {
      const words = node.textContent.trim().split(/\s+/);
      node.textContent = '';
      const frag = document.createDocumentFragment();
      words.forEach(w => {
        const s = document.createElement('span');
        s.textContent = w + ' ';
        frag.appendChild(s);
      });
      node.appendChild(frag);
      const spans = node.querySelectorAll('span');
      gsap.to(spans, {
        opacity: 1,
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: node,
          start: 'top 78%',
          end: 'bottom 60%',
          scrub: 0.6,
        }
      });
    });
  }

  /* ---------- Horizontal rail ---------- */
  function setupRail(){
    const track = document.querySelector('[data-rail-track]');
    const inner = document.querySelector('[data-rail-inner]');
    if (!track || !inner) return;

    const distance = () => Math.max(0, inner.scrollWidth - track.clientWidth);

    gsap.to(inner, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 65%',
        end: () => `+=${distance() + 200}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
      }
    });
  }

  /* ---------- Cursor ---------- */
  function setupCursor(){
    const dot = document.querySelector('[data-cursor]');
    const ring = document.querySelector('[data-cursor-ring]');
    if (!dot || !ring) return;

    let tx=0,ty=0,rx=0,ry=0,mx=0,my=0;
    window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

    function loop(){
      tx += (mx - tx) * 0.9;
      ty += (my - ty) * 0.9;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    const sel = 'a, button, [data-hover-img], .index__row, .frame__media, .rail__card';
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('is-hover'); ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); });
    });
  }

  /* ---------- Index hover preview ---------- */
  function setupIndexHover(){
    const target = document.querySelector('[data-hover-target]');
    if (!target) return;
    const img = target.querySelector('img');
    let mx=0,my=0,tx=0,ty=0,active=false;

    window.addEventListener('mousemove', e => { mx = e.clientX + 28; my = e.clientY - 180; });

    document.querySelectorAll('[data-hover-img]').forEach(row => {
      row.addEventListener('mouseenter', () => {
        img.src = row.dataset.hoverImg;
        target.classList.add('is-on');
        active = true;
      });
      row.addEventListener('mouseleave', () => {
        target.classList.remove('is-on');
        active = false;
      });
    });

    function loop(){
      tx += (mx - tx) * 0.18;
      ty += (my - ty) * 0.18;
      if (active) target.style.transform = `translate(${tx}px, ${ty}px)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Marker pin (chapter title hold) ---------- */
  function setupMarkerPins(){
    if (reduceMotion) return;
    document.querySelectorAll('.marker').forEach(m => {
      ScrollTrigger.create({
        trigger: m,
        start: 'top top',
        end: '+=70%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });
    });
  }

  /* ---------- Frame: SVG distortion on hover ---------- */
  function setupFrameDistort(){
    const map = document.getElementById('distort-map');
    if (!map) return;
    document.querySelectorAll('.frame__media').forEach(media => {
      let target = 0, current = 0, raf = null;

      function tick(){
        current += (target - current) * 0.12;
        map.setAttribute('scale', current.toFixed(2));
        if (Math.abs(target - current) > 0.05) {
          raf = requestAnimationFrame(tick);
        } else {
          map.setAttribute('scale', String(target));
          raf = null;
        }
      }
      function start(){ if (!raf) raf = requestAnimationFrame(tick); }

      media.addEventListener('mouseenter', () => { target = 18; start(); });
      media.addEventListener('mouseleave', () => { target = 0;  start(); });
      media.addEventListener('mousemove', (e) => {
        const rect = media.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width/2)) / rect.width;
        const dy = (e.clientY - (rect.top + rect.height/2)) / rect.height;
        const dist = Math.min(1, Math.hypot(dx, dy) * 1.6);
        target = 8 + dist * 22;
        start();
      });
    });
  }

  /* ---------- Anchor link sweep transition ---------- */
  function setupSweep(){
    const sweep = document.querySelector('[data-sweep]');
    if (!sweep) return;

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        const tgt = document.querySelector(id);
        if (!tgt) return;
        e.preventDefault();

        const tl = gsap.timeline();
        tl.fromTo(sweep, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
          .add(() => { lenis.scrollTo(tgt, { immediate: true }); })
          .to(sweep, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, '+=0.15')
          .set(sweep, { yPercent: 100 });
      });
    });

    const top = document.querySelector('[data-top]');
    if (top){
      top.addEventListener('click', e => {
        e.preventDefault();
        const tl = gsap.timeline();
        tl.fromTo(sweep, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
          .add(() => { lenis.scrollTo(0, { immediate: true }); })
          .to(sweep, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, '+=0.15')
          .set(sweep, { yPercent: 100 });
      });
    }
  }

  /* ---------- Boot ---------- */
  function boot(){
    setupCursor();
    animateSplits();
    animateRules();
    animateFades();
    animateReveals();
    setupWords();
    setupRail();
    setupIndexHover();
    setupFrameDistort();
    setupMarkerPins();
    setupSweep();
    ScrollTrigger.refresh();

    // run preloader independently; reveal hero name when it finishes
    runPreloader().then(animateHero).catch(() => {
      const pre = document.querySelector('[data-pre]');
      if (pre) pre.style.display = 'none';
      animateHero();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
