/* TFX Creative Lab — Motor de animação (leve, sem WebGL)
   Lenis (scroll suave) + GSAP/ScrollTrigger (reveals) + cursor magnético + tilt + contadores.
   Sem Three.js: o fundo usa gradiente CSS (body::before), sem custo de GPU no scroll. */

(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* ---------- 1. SCROLL SUAVE (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- 2. REVEALS CINEMATOGRÁFICOS (GSAP) ---------- */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.reveal').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 50, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    const heroBits = document.querySelectorAll('header h1, header p, header .inline-flex, header .mt-10 a');
    gsap.from(heroBits, { opacity: 0, y: 30, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
    // Parallax leve só em desktop (evita reflow em mobile)
    if (!isMobile) {
      document.querySelectorAll('img.object-cover').forEach((img) => {
        gsap.to(img, { yPercent: -10, ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
  }

  /* ---------- 3. CURSOR GLOW + MAGNÉTICO (só desktop) ---------- */
  const glow = document.getElementById('cursor-glow');
  if (glow && !isMobile && !reduceMotion) {
    let gx = 0, gy = 0, tx = 0, ty = 0, visible = false;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; if (!visible) { visible = true; glow.style.opacity = '1'; } });
    (function follow() {
      gx += (tx - gx) * 0.15; gy += (ty - gy) * 0.15;
      glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 4. TILT 3D NOS CARDS (só desktop) ---------- */
  if (!isMobile && !reduceMotion) {
    document.querySelectorAll('#services-grid > div, .group.relative').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 5. CONTADORES ---------- */
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const dur = 1200, start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }
  if (window.gsap && window.ScrollTrigger) {
    ScrollTrigger.create({ trigger: '#planos', start: 'top 80%', once: true, onEnter: animateCounters });
  } else { animateCounters(); }
})();
