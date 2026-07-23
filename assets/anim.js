/* TFX Creative Lab — Animações leves (sem rAF no scroll, sem blur, sem Lenis)
   Só: cursor magnético (CSS transform no mousemove), tilt 3D no hover, contadores (1x).
   Reveal via CSS transition (classe .active) — sem custo de scroll. */

(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* Cursor glow: segue o mouse via transform (transition CSS, sem loop rAF) */
  const glow = document.getElementById('cursor-glow');
  if (glow && !isMobile && !reduceMotion) {
    let shown = false;
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      if (!shown) { shown = true; glow.style.opacity = '1'; }
    });
    document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* Tilt 3D nos cards (só no hover, não no scroll) */
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

  /* Contadores (disparam 1x ao entrar na tela, sem custo contínuo) */
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
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((ents, o) => {
      ents.forEach((e) => { if (e.isIntersecting) { animateCounters(); o.disconnect(); } });
    }, { threshold: 0.3 });
    const planos = document.querySelector('#planos');
    if (planos) obs.observe(planos); else animateCounters();
  } else { animateCounters(); }
})();
