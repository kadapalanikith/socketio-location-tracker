/* ══════════════════════════════════════════
   TrackSphere — Landing Page JavaScript
   Particle Network · Globe · Counters · Reveals
══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     1. PARTICLE CANVAS NETWORK
  ───────────────────────────────────── */
  const canvas  = document.getElementById('particle-canvas');
  const ctx     = canvas.getContext('2d');
  let W, H, particles;
  const PARTICLE_COUNT = 90;
  const MAX_DIST       = 140;
  const MOUSE          = { x: -9999, y: -9999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -8;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = Math.random() * 0.3 + 0.1;
      this.r  = Math.random() * 1.6 + 0.6;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.hue = Math.random() > 0.6 ? 190 : 270; // cyan vs purple
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Mouse repulsion
      const dx = this.x - MOUSE.x;
      const dy = this.y - MOUSE.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        const force = (100 - d) / 100;
        this.vx += (dx / d) * force * 0.15;
        this.vy += (dy / d) * force * 0.15;
      }
      // Dampen velocity
      this.vx *= 0.99;
      this.vy *= 0.99;
      if (this.y > H + 8 || this.x < -8 || this.x > W + 8) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.18;
          const hue   = particles[i].hue === 190 ? '0,245,255' : '124,58,237';
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${hue}, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; });
  window.addEventListener('mouseleave', () => { MOUSE.x = -9999; MOUSE.y = -9999; });

  resize();
  initParticles();
  loop();


  /* ─────────────────────────────────────
     2. NAVBAR SCROLL EFFECT
  ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });


  /* ─────────────────────────────────────
     3. HAMBURGER MENU
  ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('mobile-open');
      hamburger.setAttribute('aria-expanded', open);
      // Animate hamburger spans
      const spans = hamburger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(l => {
      l.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }



  /* ─────────────────────────────────────
     5. ANIMATED COUNTERS
  ───────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const dur    = 2000;
    const start  = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased    = 1 - Math.pow(1 - progress, 4); // ease-out quart
      const val      = Math.round(eased * target);
      el.textContent = val.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Hero proof counters start immediately
  document.querySelectorAll('.hero-counter').forEach(el => {
    setTimeout(() => animateCounter(el), 600);
  });


  /* ─────────────────────────────────────
     6. SCROLL REVEAL (Intersection Observer)
  ───────────────────────────────────── */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealIO.unobserve(entry.target);

          // Trigger counters when stats tile enters view
          entry.target.querySelectorAll('.counter').forEach(c => animateCounter(c));

          // Animate stat bars
          entry.target.querySelectorAll('.stat-fill').forEach(bar => {
            setTimeout(() => bar.classList.add('animated'), 200);
          });
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));


  /* ─────────────────────────────────────
     7. SMOOTH ANCHOR SCROLL
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ─────────────────────────────────────
     8. MOBILE NAV STYLES (injected)
  ───────────────────────────────────── */
  const mobileStyle = document.createElement('style');
  mobileStyle.textContent = `
    @media (max-width: 768px) {
      #navLinks.mobile-open {
        display: flex !important;
        flex-direction: column;
        position: fixed;
        top: 72px; left: 0; right: 0;
        background: rgba(4,4,15,0.97);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding: 16px 20px 24px;
        gap: 4px;
        z-index: 999;
      }
      #navLinks.mobile-open .nav-link {
        padding: 12px 16px;
        font-size: 1rem;
        border-radius: 10px;
      }
    }
  `;
  document.head.appendChild(mobileStyle);


  /* ─────────────────────────────────────
     9. CTA BUTTON CLICK RIPPLE
  ───────────────────────────────────── */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        border-radius:50%;
        background:rgba(255,255,255,0.3);
        top:${e.clientY - rect.top - size/2}px;
        left:${e.clientX - rect.left - size/2}px;
        transform:scale(0);
        animation:rippleAnim 0.6s ease-out forwards;
        pointer-events:none;
        z-index:10;
      `;
      if (!document.querySelector('#rippleKF')) {
        const ks = document.createElement('style');
        ks.id = 'rippleKF';
        ks.textContent = `@keyframes rippleAnim { to { transform:scale(1); opacity:0; } }`;
        document.head.appendChild(ks);
      }
      this.style.position = 'relative';
      this.style.overflow  = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });


  /* ─────────────────────────────────────
     10. PARALLAX (globe floats on scroll)
  ───────────────────────────────────── */
  const globeScene = document.querySelector('.globe-scene');
  if (globeScene) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const shift   = scrollY * 0.2;
      globeScene.style.transform = `translateY(${shift}px)`;
    }, { passive: true });
  }

})();
