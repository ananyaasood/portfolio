/* ===================================================================
   ANTI-GRAVITY PORTFOLIO — Animations & Interactions
   =================================================================== */

(() => {
  'use strict';

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Prevent browser from restoring scroll position on refresh
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* ---------------------------------------------------------------
     1. LENIS SMOOTH SCROLL
     --------------------------------------------------------------- */
  /* ---------------------------------------------------------------
     1. LENIS SMOOTH SCROLL (Luxury Weight)
     --------------------------------------------------------------- */
  const lenis = new Lenis({
    duration: 1.1, /* Snappier but still smooth */
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    lerp: 0.12, /* Higher lerp = less lag, more responsive */
  });

  // Integrate Lenis with GSAP's ticker
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------------------------------------------------------------
     2. THREE.JS HERO BACKGROUND (Interactive Particles)
     --------------------------------------------------------------- */
  function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Interaction System
    const particles = [];
    const particleCount = 150;
    const connectionDistance = 4.5;
    const mouseRepelRadius = 8;

    // Geometry for particles (simple points)
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      // Spread particles across a wide area
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 30;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Random slow drift velocity
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
        origX: x,
        origY: y,
        origZ: z
      });

      particles.push({
        x: x, y: y, z: z,
        vx: velocities[i].x, vy: velocities[i].y, vz: velocities[i].z
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      color: 0x39FF14, // Accent Green
      size: 0.15,
      transparent: true,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    // Line segments for connections
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00D4FF, // Accent Blue
      transparent: true,
      opacity: 0.15
    });

    const linesGeometry = new THREE.BufferGeometry();
    const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(linesMesh);

    // Mouse tracking (normalized -1 to 1) for Raycasting/Repulsion
    let mouse = new THREE.Vector2(-9999, -9999); // Start off-screen
    let targetMouse = new THREE.Vector2(-9999, -9999);

    // Convert screen mouse to world text for repulsion logic logic approximation
    let worldMouse = new THREE.Vector3(0, 0, 0);

    // Raycaster for precise 3D mouse tracking
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Logic plane at Z=0

    document.addEventListener('mousemove', (e) => {
      // Normalized device coordinates
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(planeZ, worldMouse);
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    // Sync Three.js to GSAP ticker (single RAF loop, no double-frame overhead)
    function animate() {
      const posAttribute = geometry.attributes.position;
      const linePositions = [];

      for (let i = 0; i < particleCount; i++) {
        let px = posAttribute.getX(i);
        let py = posAttribute.getY(i);
        let pz = posAttribute.getZ(i);

        let v = velocities[i];

        // Base drift
        px += v.x;
        py += v.y;
        pz += v.z;

        // Mouse Repulsion
        const dx = px - worldMouse.x;
        const dy = py - worldMouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < mouseRepelRadius * mouseRepelRadius) {
          const dist = Math.sqrt(distSq);
          const force = (mouseRepelRadius - dist) / mouseRepelRadius;
          px += (dx / dist) * force * 0.5;
          py += (dy / dist) * force * 0.5;
        }

        if (px > 30) px = -30;
        if (px < -30) px = 30;
        if (py > 20) py = -20;
        if (py < -20) py = 20;

        posAttribute.setXYZ(i, px, py, pz);

        for (let j = i + 1; j < particleCount; j++) {
          let p2x = posAttribute.getX(j);
          let p2y = posAttribute.getY(j);
          let p2z = posAttribute.getZ(j);
          const d2 = (px - p2x) ** 2 + (py - p2y) ** 2 + (pz - p2z) ** 2;
          if (d2 < connectionDistance * connectionDistance) {
            linePositions.push(px, py, pz, p2x, p2y, p2z);
          }
        }
      }

      posAttribute.needsUpdate = true;
      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      particlesMesh.rotation.y += 0.0005;
      linesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }

    // Use GSAP ticker instead of raw rAF — stays in sync with Lenis + GSAP
    gsap.ticker.add(animate);
  }

  /* ---------------------------------------------------------------
   5. NICHE LOADING BAR (GSAP)
   --------------------------------------------------------------- */
  /* ---------------------------------------------------------------
   5. NICHE LOADING BAR (GSAP) -> SCRAMBLE TEXT INIT
   --------------------------------------------------------------- */
  /* ---------------------------------------------------------------
   5. NICHE LOADING BAR (GSAP) -> SCRAMBLE TEXT INIT
   --------------------------------------------------------------- */
  function initLoader() {
    const overlay = document.querySelector('.loader-overlay');
    const textEl = document.querySelector('.loader-text');
    const barEl = document.querySelector('.loader-bar');


    if (!overlay || !textEl) return;

    // Disable scrolling
    document.body.style.overflow = 'hidden';

    const targetText = "ANANYA SOOD";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const duration = 2.0;

    // Animation state
    const state = { progress: 0 };
    const tl = gsap.timeline();

    // Animate Bar Width
    if (barEl) {
      tl.to(barEl, {
        width: '100%',
        duration: duration,
        ease: "power2.inOut"
      }, 0);
    }

    // Scramble Effect ("ANANYA SOOD") — "SOOD" in red
    const redStart = 7; // Index where "SOOD" starts
    tl.to(state, {
      progress: 1,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const progress = state.progress;
        const len = targetText.length;
        const lockedCount = Math.floor(progress * len);

        let output = "";

        for (let i = 0; i < len; i++) {
          const char = i < lockedCount
            ? targetText[i]
            : chars[Math.floor(Math.random() * chars.length)];

          if (i === redStart) output += '<span style="color:#FF1A1A">';
          output += char;
        }
        if (len > redStart) output += '</span>';

        textEl.innerHTML = output;
      }
    }, 0); // Sync with bar animation

    // Hold for a moment after fully resolved
    tl.to({}, { duration: 0.4 });

    // --- EXIT SEQUENCE: Zoom Up + Fade ---
    tl.call(() => {
      // Prepare Intro Overlay behind loader
      const introOverlay = document.querySelector('.intro-overlay');
      if (introOverlay) {
        gsap.set(introOverlay, { visibility: 'visible', opacity: 1, zIndex: 9998 });
      }

      // Zoom up the name text
      const exitTl = gsap.timeline();

      // Fade out the bottom bar first
      exitTl.to('.loader-bottom', {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });

      // Zoom up the text — scale massively until it fills the screen, then fade
      exitTl.to(textEl, {
        scale: 8,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.2,
        ease: "power2.in"
      }, "-=0.1");

      // Fade out the entire overlay
      exitTl.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          overlay.remove();
          playIntroAnimation();
        }
      }, "-=0.3");
    });
  }

  /* ---------------------------------------------------------------
   6. INTRO MOTION GRAPHIC (LOOP: "HELLO" -> "HOLA" -> "NAMASTE")
   --------------------------------------------------------------- */
  function playIntroAnimation() {
    const overlay = document.querySelector('.intro-overlay');
    const container = document.querySelector('.intro-container');
    const mainDot = document.querySelector('.main-dot');
    const subDots = document.querySelectorAll('.sub-dot');
    const techLines = document.querySelectorAll('.tech-line');
    const techAnchors = document.querySelectorAll('.tech-circle');
    const swipeIndicator = document.querySelector('.intro-swipe-indicator');

    // Words
    const wordHello = document.querySelector('.word-hello');
    const wordHola = document.querySelector('.word-hola');
    const wordNamaste = document.querySelector('.word-namaste');
    const wordBonjour = document.querySelector('.word-bonjour');
    const wordCiao = document.querySelector('.word-ciao'); // Kept for safety if needed, but we use Punjabi
    const wordPunjabi = document.querySelector('.word-punjabi');

    if (!overlay) return;

    // Ensure visible
    gsap.set(overlay, { visibility: 'visible', opacity: 1, zIndex: 10000 });
    gsap.set(subDots, { x: 0, y: 0, scale: 0 });
    gsap.set([wordHello, wordHola, wordPunjabi, wordBonjour, wordCiao], { visibility: 'hidden', opacity: 0 });
    gsap.set(swipeIndicator, { visibility: 'visible', opacity: 0, y: 20 });

    // Activate pulse wave after 3 seconds
    const pulseWave = document.querySelector('.pulse-wave');
    if (pulseWave) {
      setTimeout(() => {
        pulseWave.classList.add('active');
      }, 3500);
    }

    // Master Timeline (Repeat -1 for infinite loop)
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0 });

    // --- SCROLL UNLOCK LOGIC ---
    let output = { triggered: false };

    function unlockSite() {
      if (output.triggered) return;
      output.triggered = true;

      // Kill Loop
      tl.pause();
      tl.kill();
      // gsap.killTweensOf("*"); // REMOVED: Kills pending ScrollTriggers for main content
      gsap.killTweensOf(".intro-word"); // Only kill intro words

      // Swift Exit Animation
      const exitTl = gsap.timeline({
        onComplete: () => {
          window.scrollTo(0, 0); // Force scroll to top to prevent jumping
          document.body.style.overflow = '';
          overlay.remove();

          // REVEAL HERO
          gsap.fromTo('.console-container',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out', delay: 0.1 }
          );
          gsap.fromTo('.hero__display-title',
            { y: 100, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 1.8, ease: 'power3.out', delay: 0.2 }
          );
        }
      });

      // "Whoosh" up
      exitTl.to(overlay, { y: '-100%', duration: 0.8, ease: "power4.inOut" });
      exitTl.to('.intro-text-container', { y: -100, opacity: 0, duration: 0.5 }, "<");
    }

    // Event Listeners
    window.addEventListener('wheel', (e) => {
      if (e.deltaY > 10 && !output.triggered) unlockSite(); // Scroll Down (or Up depending on trackpad) - let's say any significant scroll
    });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; });
    window.addEventListener('touchmove', (e) => {
      if (touchStartY - e.touches[0].clientY > 50 && !output.triggered) unlockSite(); // Swipe Up
    });


    // --- INTRO SEQUENCE (LOOP) ---
    // Start with hello (already initialized manually below)

    // First run initialization (outside loop)
    gsap.set(mainDot, { scale: 0 }); // Hide main, we use subdots for swarm

    // --- SLEEK BLUR-SLIDE TRANSITION ---
    // Apple-style vertical slide with motion blur
    function playSleekTransition(current, next) {
      const tl = gsap.timeline();

      // OUTGOING (Slide Up + Blur Out)
      if (current) {
        tl.to(current, {
          yPercent: -100,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.39,
          ease: "power4.in"
        });
      }

      // INCOMING (Slide Up from Bottom + Unblur)
      if (next) {
        // Set initial state
        tl.set(next, {
          visibility: 'visible',
          yPercent: 100,
          opacity: 0,
          filter: "blur(20px)"
        }, "<"); // Start same time

        // Animate In
        tl.to(next, {
          yPercent: 0, // Center
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.52,
          ease: "power4.out"
        }, "-=0.13"); // Overlap slightly
      }

      return tl;
    }

    // --- BUILD LOOP SEQUENCE ---
    // Initial Reveal of Namaste manually
    const tInit = gsap.timeline();
    // No more particles to animate
    tInit.set(wordNamaste, { visibility: 'visible', opacity: 0, yPercent: 100, filter: "blur(20px)" });
    tInit.to(wordNamaste, { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.65, ease: "power3.out" });
    tInit.to(swipeIndicator, { opacity: 1, y: 0, duration: 0.52 }, "+=0.2");

    // Hold Duration: 0.81s (35% faster)
    const hold = "+=0.81";

    // Delay the tl timeline so it waits for the initial Namaste fade-in
    tl.delay(0.65);

    // Loop
    tl.add(playSleekTransition(wordNamaste, wordHello), hold);
    tl.add(playSleekTransition(wordHello, wordHola), hold);
    tl.add(playSleekTransition(wordHola, wordPunjabi), hold);
    tl.add(playSleekTransition(wordPunjabi, wordBonjour), hold);
    tl.add(playSleekTransition(wordBonjour, wordNamaste), hold);
  }


  // Initializers
  if (!prefersReducedMotion) {
    // Use a slight timeout to ensure fonts load before starting
    window.addEventListener('load', () => {
      initLoader();
      initHeroScene();
      initHeroMorph();
    });
  } else {
    // reduced motion fallback
    document.body.classList.add('loaded');
  }

  /* ---------------------------------------------------------------
   HERO MORPH ANIMATION (R + EALITIES -> R + FLXNS)
   --------------------------------------------------------------- */
  /* ---------------------------------------------------------------
   HERO MORPH ANIMATION (R + EALITIES -> R + FLXNS)
   --------------------------------------------------------------- */
  function initHeroMorph() {
    const word1 = document.querySelector('.word-1'); // EALITIES
    const word2 = document.querySelector('.word-2'); // FLXNS
    if (!word1 || !word2) return;

    // Use a master timeline with repeatRefresh to ensure context is always fresh
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });

    // CONSTANTS
    const morphDuration = 1.0; // Faster switch to avoid gap
    const holdDuration = 3.5;  // Increased for balance

    // Initial State
    gsap.set(word1, { y: 0, opacity: 1, filter: 'blur(0px)', visibility: 'visible' });
    gsap.set(word2, { y: 30, opacity: 0, filter: 'blur(8px)', visibility: 'hidden' });

    // 1. Hold EALITIES
    tl.to({}, { duration: holdDuration });

    // 2. Transition: EALITIES -> FLXNS (Overlapping)
    tl.add("startMorph1");
    // Word 1 exits up
    tl.to(word1, {
      y: -30,
      opacity: 0,
      filter: 'blur(8px)',
      duration: morphDuration
    }, "startMorph1");

    // Word 2 enters from bottom (Concurrent with exit)
    tl.fromTo(word2,
      { y: 30, opacity: 0, filter: 'blur(8px)', visibility: 'visible' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: morphDuration },
      "startMorph1+=0.1" // Small offset to ensure overlap
    );

    // 3. Hold FLXNS
    tl.to({}, { duration: holdDuration });

    // 4. Transition: FLXNS -> EALITIES (Overlapping)
    tl.add("startMorph2");
    // Word 2 exits up
    tl.to(word2, {
      y: -30,
      opacity: 0,
      filter: 'blur(8px)',
      duration: morphDuration
    }, "startMorph2");

    // Word 1 enters from bottom (Concurrent with exit)
    tl.fromTo(word1,
      { y: 30, opacity: 0, filter: 'blur(8px)', visibility: 'visible' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: morphDuration },
      "startMorph2+=0.1" // Small offset to ensure overlap
    );
  }
  /* ---------------------------------------------------------------
     3. SPLIT TEXT (Section Headings)
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.innerHTML = text
      .split(' ')
      .map((word) => `<span class="word"><span class="word-inner">${word}</span></span>`)
      .join('');
  });

  /* ---------------------------------------------------------------
     4. GSAP SCROLL ANIMATIONS (Cinematic Slow)
     --------------------------------------------------------------- */
  gsap.registerPlugin(ScrollTrigger);

  // Set initial hidden states via GSAP (not CSS) so content is visible without JS

  // --- Section heading word reveals ---
  document.querySelectorAll('.section__heading').forEach((heading) => {
    const words = heading.querySelectorAll('.word-inner');
    if (!words.length) return;

    gsap.to(words, {
      y: 0,
      duration: 1.0,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- Hero content ---
  const heroTimeline = gsap.timeline({ delay: 0.5 });

  const heroWords = document.querySelectorAll('.hero__title .word-inner');
  if (heroWords.length) {
    heroTimeline.to(heroWords, {
      y: 0,
      duration: 1.4,
      stagger: 0.06,
      ease: 'power4.out',
    });
  }

  // --- Generic [data-reveal] elements ---
  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    if (el.closest('.hero')) return;

    // Use the parent section as trigger so tall sections animate when entering
    const section = el.closest('.section');
    const siblings = section ? Array.from(section.querySelectorAll('[data-reveal]')) : [];
    const index = siblings.indexOf(el);

    gsap.fromTo(
      el,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        delay: index * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section || el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Work Cards (Editorial Reveal) ---
  document.querySelectorAll('.work__card').forEach((card, i) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 70 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Badges float in ---
  document.querySelectorAll('.badge[data-ag]').forEach((badge, i) => {
    gsap.fromTo(
      badge,
      { opacity: 0, y: 20, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        delay: i * 0.03,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: badge.closest('.capabilities__group'),
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Achievements staggered reveal ---
  document.querySelectorAll('.achievements__item').forEach((item, i) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Focus items fade-lift ---
  document.querySelectorAll('.focus__item').forEach((item, i) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- Philosophy line-by-line cinematic reveal ---
  const philSection = document.querySelector('.philosophy');
  document.querySelectorAll('.philosophy__line').forEach((line, i) => {
    gsap.fromTo(
      line,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: i * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: philSection || line,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // --- About Section Reveals (Integrated from about.html) ---
  document.querySelectorAll('.about-reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // --- Keywords stagger ---
  const keywords = document.querySelectorAll('.keyword');
  if (keywords.length) {
    gsap.to(keywords, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: keywords[0].parentElement,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  // --- Background cards stagger ---
  const bgCards = document.querySelectorAll('.background-card');
  if (bgCards.length) {
    gsap.to(bgCards, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bgCards[0].parentElement,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ---------------------------------------------------------------
     5. CURSOR-REACTIVE TILT ON CARDS
     --------------------------------------------------------------- */
  document.querySelectorAll('.ag-card').forEach((card) => {
    if (prefersReducedMotion) return;

    const xTo = gsap.quickTo(card, 'rotateY', { duration: 0.3, ease: 'power3.out' });
    const yTo = gsap.quickTo(card, 'rotateX', { duration: 0.3, ease: 'power3.out' });

    gsap.set(card, { transformPerspective: 800, transformOrigin: 'center center' });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      xTo(((y - centerY) / centerY) * -4);
      yTo(((x - centerX) / centerX) * 4);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });

  /* ---------------------------------------------------------------
     6. CARD EXPAND / COLLAPSE
     --------------------------------------------------------------- */
  document.querySelectorAll('.work__card').forEach((card) => {
    card.addEventListener('click', () => {
      const wasExpanded = card.classList.contains('expanded');

      // Close all
      document.querySelectorAll('.work__card.expanded').forEach((c) => c.classList.remove('expanded'));

      // Toggle clicked
      if (!wasExpanded) {
        card.classList.add('expanded');
      }
    });
  });

  /* ---------------------------------------------------------------
     7. PARALLAX HERO SHAPES ON SCROLL
     --------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    gsap.to('.hero__shape--1', {
      y: -100,
      rotation: 90,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });

    gsap.to('.hero__shape--2', {
      y: -140,
      scale: 0.6,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });

  }

  /* ---------------------------------------------------------------
     8. MAGNETIC BUTTON EFFECT (Contact links)
     --------------------------------------------------------------- */
  document.querySelectorAll('.contact__link').forEach((link) => {
    if (prefersReducedMotion) return;

    const xTo = gsap.quickTo(link, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(link, 'y', { duration: 0.4, ease: 'power3.out' });

    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      xTo(x * 0.1);
      yTo(y * 0.1 - 12);
    }, { passive: true });

    link.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });

})();
