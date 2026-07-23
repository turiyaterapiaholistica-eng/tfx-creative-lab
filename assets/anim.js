/* TFX Creative Lab — Motor de animação futurista 2030
   Lenis (scroll suave) + GSAP/ScrollTrigger (reveals) + Three.js (fundo) +
   cursor magnético + tilt 3D + contadores. Tudo offline-safe, sem CDN. */

(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. SCROLL SUAVE (Lenis) ---------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
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

    // Elementos .reveal passam a ser animados por GSAP (desliga o observer anterior)
    document.querySelectorAll('.reveal').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 60, filter: 'blur(8px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
    });

    // Hero: entrada em cascata
    const heroBits = document.querySelectorAll('header h1, header p, header .inline-flex, header .mt-10 a');
    gsap.from(heroBits, { opacity: 0, y: 40, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.2 });

    // Imagens com parallax leve
    document.querySelectorAll('img.object-cover').forEach((img) => {
      gsap.to(img, {
        yPercent: -12, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- 3. FUNDO WEBGL (Three.js) ---------- */
  function initWebGL() {
    if (!window.THREE || reduceMotion) return;
    const canvas = document.getElementById('bg-webgl');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2.4;

    // Malha distorcida (plane com shader de gradiente animado)
    const geo = new THREE.PlaneGeometry(14, 14, 64, 64);
    const uniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#8B5CF6') },
      uColorB: { value: new THREE.Color('#3B82F6') },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: `
        uniform float uTime; uniform vec2 uMouse;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          float w = sin(p.x * 1.5 + uTime) * 0.25 + cos(p.y * 1.5 + uTime * 0.8) * 0.25;
          p.z += w;
          p.z += sin(uMouse.x * 3.0 + p.x) * 0.15;
          p.z += cos(uMouse.y * 3.0 + p.y) * 0.15;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB;
        varying vec2 vUv;
        void main() {
          float g = smoothstep(0.0, 1.0, vUv.y + sin(vUv.x * 3.1415 + uTime) * 0.15);
          vec3 col = mix(uColorA, uColorB, g);
          float a = 0.18 + 0.12 * sin(vUv.x * 10.0 + uTime);
          gl_FragColor = vec4(col, a * 0.5);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2.6;
    scene.add(mesh);

    window.addEventListener('mousemove', (e) => {
      uniforms.uMouse.value.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    });
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    const clock = new THREE.Clock();
    (function loop() {
      uniforms.uTime.value = clock.getElapsedTime();
      mesh.rotation.z = Math.sin(uniforms.uTime.value * 0.1) * 0.1;
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    })();
  }
  initWebGL();

  /* ---------- 4. CURSOR GLOW + MAGNÉTICO ---------- */
  const glow = document.getElementById('cursor-glow');
  if (glow && !('ontouchstart' in window) && !reduceMotion) {
    let gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY; glow.style.opacity = '1';
    });
    (function follow() {
      gx += (tx - gx) * 0.15; gy += (ty - gy) * 0.15;
      glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
      requestAnimationFrame(follow);
    })();
    // Magnético em botões/links/cards
    document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * 0.2}px, ${my * 0.2}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 5. TILT 3D NOS CARDS ---------- */
  if (!('ontouchstart' in window) && !reduceMotion) {
    document.querySelectorAll('#services-grid > div, .group.relative').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 6. CONTADORES NOS PLANOS ---------- */
  function animateCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const dur = 1400; const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if (window.gsap && window.ScrollTrigger) {
    ScrollTrigger.create({ trigger: '#planos', start: 'top 80%', once: true, onEnter: animateCounters });
  } else { animateCounters(); }
})();
