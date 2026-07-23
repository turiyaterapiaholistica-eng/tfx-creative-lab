/* TFX Creative Lab — Motor de animação futurista 2030 (versão estável)
   Lenis + GSAP/ScrollTrigger + Three.js (com pausa/blindagem) + cursor + tilt + contadores.
   Otimizado para NÃO travar: WebGL pausa fora de vista, geometria leve, fallback CSS. */

(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4;

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
    document.querySelectorAll('img.object-cover').forEach((img) => {
      gsap.to(img, { yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- 3. FUNDO WEBGL (Three.js) COM PAUSA E BLINDAGEM ---------- */
  // Só roda WebGL em desktop e se não for reduced-motion nem low-power
  const webglOn = window.THREE && !reduceMotion && !isMobile && !lowPower;

  function initWebGL() {
    const canvas = document.getElementById('bg-webgl');
    if (!canvas) return;
    if (!webglOn) { canvas.style.display = 'none'; return; } // fallback CSS assume

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch (err) {
      canvas.style.display = 'none';
      return; // sem WebGL -> fallback CSS
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2.4;

    const geo = new THREE.PlaneGeometry(14, 14, 32, 32);
    const uniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#8B5CF6') },
      uColorB: { value: new THREE.Color('#3B82F6') },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms, transparent: true,
      vertexShader: `
        uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;
        void main() {
          vUv = uv; vec3 p = position;
          float w = sin(p.x * 1.5 + uTime) * 0.2 + cos(p.y * 1.5 + uTime * 0.8) * 0.2;
          p.z += w + sin(uMouse.x * 3.0 + p.x) * 0.1 + cos(uMouse.y * 3.0 + p.y) * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB; varying vec2 vUv;
        void main() {
          float g = smoothstep(0.0, 1.0, vUv.y + sin(vUv.x * 3.1415 + uTime) * 0.15);
          vec3 col = mix(uColorA, uColorB, g);
          float a = 0.15 + 0.1 * sin(vUv.x * 10.0 + uTime);
          gl_FragColor = vec4(col, a * 0.45);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2.6;
    scene.add(mesh);

    // throttle do mouse
    let mx = 0, my = 0, pending = false;
    window.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = -((e.clientY / window.innerHeight) * 2 - 1);
      if (!pending) { pending = true; requestAnimationFrame(() => { uniforms.uMouse.value.set(mx, my); pending = false; }); }
    });
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; });

    const clock = new THREE.Clock();
    let running = true;
    function loop() {
      if (!running) return;
      uniforms.uTime.value = clock.getElapsedTime();
      mesh.rotation.z = Math.sin(uniforms.uTime.value * 0.1) * 0.1;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    }
    let rafId = requestAnimationFrame(loop);

    // PAUSA quando aba oculta ou canvas fora da tela
    function pause() { running = false; cancelAnimationFrame(rafId); }
    function resume() { if (!running) { running = true; clock.getDelta(); loop(); } }
    document.addEventListener('visibilitychange', () => { document.hidden ? pause() : resume(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((ents) => { ents[0].isIntersecting ? resume() : pause(); }, { threshold: 0 })
        .observe(canvas);
    }
  }
  initWebGL();

  /* ---------- 4. CURSOR GLOW + MAGNÉTICO (só desktop) ---------- */
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

  /* ---------- 5. TILT 3D NOS CARDS (só desktop) ---------- */
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

  /* ---------- 6. CONTADORES ---------- */
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
