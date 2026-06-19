'use strict';

/* ---- DATA ---- */
const GLOBE_SKILLS = [
  { name: 'Embedded C',   symbol: 'C',  color: '#00ff88', bg: 'rgba(0,255,136,0.15)'  },
  { name: 'Java',         symbol: '<i class="devicon-java-plain colored"></i>', color: '#f89820', bg: 'rgba(248,152,32,0.15)' },
  { name: 'Python',       symbol: '<i class="devicon-python-plain colored"></i>', color: '#4b8bbe', bg: 'rgba(75,139,190,0.15)' },
  { name: 'MATLAB',       symbol: 'M',  color: '#e16737', bg: 'rgba(225,103,55,0.15)' },
  { name: 'Multisim',     symbol: '≋',  color: '#ffd700', bg: 'rgba(255,215,0,0.15)'  },
  { name: 'Keil µVision', symbol: 'µV', color: '#cc3333', bg: 'rgba(204,51,51,0.15)'  },
  { name: 'Proteus',      symbol: 'P',  color: '#00aacc', bg: 'rgba(0,170,204,0.15)'  },
];

const TYPED_PHRASES = [
  'ECE Student',
  'Embedded Systems Enthusiast',
  'IoT Developer',
];

/* ---- 3D SKILLS GLOBE ---- */
(function initSkillsGlobe() {
  const container = document.getElementById('skills-globe');
  if (!container) return;

  const RADIUS = 150;
  const FOV    = 420;
  const SPEED  = 0.020;          /* radians per frame — auto rotation */
  const TILT   = 0.42;           /* fixed X-axis tilt (radians) */

  /* ---- Distribute skills evenly on sphere (Fibonacci) ---- */
  const golden = (1 + Math.sqrt(5)) / 2;
  const basePos = GLOBE_SKILLS.map((_, i) => {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / GLOBE_SKILLS.length);
    const theta = 2 * Math.PI * i / golden;
    return {
      x: RADIUS * Math.sin(phi) * Math.cos(theta),
      y: RADIUS * Math.sin(phi) * Math.sin(theta),
      z: RADIUS * Math.cos(phi),
    };
  });

  /* ---- Build DOM nodes ---- */
  const nodes = GLOBE_SKILLS.map((skill, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'globe-node';
    wrap.innerHTML = `
      <div class="globe-icon" style="background:${skill.bg};color:${skill.color};border-color:${skill.color}55;">
        ${skill.symbol}
      </div>
      <span class="globe-label">${skill.name}</span>`;
    container.appendChild(wrap);
    return { el: wrap, base: basePos[i] };
  });

  /* ---- Precompute X-tilt cos/sin ---- */
  const cosX = Math.cos(TILT), sinX = Math.sin(TILT);
  let angleY = 0;

  function frame() {
    angleY += SPEED;
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);

    /* Sort by depth so far items render under near items */
    const projected = nodes.map(({ el, base }) => {
      /* Rotate Y */
      let rx = base.x * cosY - base.z * sinY;
      let rz = base.x * sinY + base.z * cosY;
      let ry = base.y;
      /* Rotate X (tilt) */
      let fy = ry * cosX - rz * sinX;
      let fz = ry * sinX + rz * cosX;

      /* Perspective */
      const scale = FOV / (FOV + fz);
      const px    = rx * scale;
      const py    = fy * scale;

      /* Depth 0 (back) → 1 (front) */
      const depth = (fz + RADIUS) / (2 * RADIUS);

      return { el, px, py, depth, scale };
    });

    /* Apply styles */
    projected.forEach(({ el, px, py, depth }) => {
      const opacity  = 0.25 + depth * 0.75;
      const iconSize = 32 + depth * 26;          /* 32 → 58 px */
      const fontSize = iconSize * 0.38;

      el.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      el.style.opacity   = opacity;
      el.style.zIndex    = Math.round(depth * 100);

      const icon = el.querySelector('.globe-icon');
      icon.style.width        = iconSize + 'px';
      icon.style.height       = iconSize + 'px';
      icon.style.fontSize     = fontSize + 'px';
      icon.style.borderRadius = (iconSize * 0.26) + 'px';

      /* Label fades out toward back */
      const lbl = el.querySelector('.globe-label');
      lbl.style.opacity = depth > 0.55 ? (depth - 0.55) * 2.2 : 0;
    });

    requestAnimationFrame(frame);
  }

  frame();
})();

/* ---- TYPED EFFECT ---- */
(function initTyped() {
  const el = document.getElementById('typed-text');
  let phraseI = 0;
  let charI = 0;
  let deleting = false;

  function tick() {
    const phrase = TYPED_PHRASES[phraseI % TYPED_PHRASES.length];
    const current = deleting
      ? phrase.slice(0, --charI)
      : phrase.slice(0, ++charI);

    el.textContent = current;

    let delay = deleting ? 55 : 90;

    if (!deleting && charI === phrase.length) {
      delay = 1800;
      deleting = true;
    } else if (deleting && charI === 0) {
      deleting = false;
      phraseI++;
      delay = 400;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 900);
})();

/* ---- NAVBAR SCROLL EFFECT ---- */
(function initNavbar() {
  const header = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const sections = [...document.querySelectorAll('section[id]')];

  function onScroll() {
    // Scrolled class
    header.classList.toggle('scrolled', window.scrollY > 40);

    // Active link highlight
    const scrollMid = window.scrollY + window.innerHeight / 2;
    let active = sections[0];
    sections.forEach(s => {
      if (s.offsetTop <= scrollMid) active = s;
    });
    links.forEach(l => {
      const href = l.getAttribute('href').slice(1);
      l.classList.toggle('active', href === active.id);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- HAMBURGER ---- */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('nav-links');

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // Close on nav link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---- INTERSECTION OBSERVER (fade-in + skill bars) ---- */
(function initObserver() {
  const reveals = document.querySelectorAll('.reveal');
  const bars = document.querySelectorAll('.skill-bar-fill');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  reveals.forEach(el => revealObserver.observe(el));

  // Skill bars fill on entering viewport
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = fill.dataset.pct + '%';
          barObserver.unobserve(fill);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(b => barObserver.observe(b));
})();

/* ---- SCROLL PROGRESS BAR ---- */
(function initProgressBar() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---- PARTICLES ---- */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COUNT = 50;
  const DIST = 130;
  const CLR = '0,255,136';
  let W = 0, H = 0, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset = () => {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.r = Math.random() * 1.8 + 0.8;
      this.a = Math.random() * 0.4 + 0.15;
    };
    this.reset();
    this.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    };
    this.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CLR},${this.a})`;
      ctx.fill();
    };
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CLR},${(1 - d / DIST) * 0.22})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    connect();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    loop();
  }

  window.addEventListener('resize', () => {
    resize();
    particles.forEach(p => { if (p.x > W) p.x = Math.random() * W; if (p.y > H) p.y = Math.random() * H; });
  }, { passive: true });

  init();
})();

/* ---- DARK / LIGHT MODE TOGGLE ---- */
(function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const KEY = 'sg-theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      btn.textContent = '☀️';
      btn.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      root.removeAttribute('data-theme');
      btn.textContent = '🌙';
      btn.setAttribute('aria-label', 'Switch to light mode');
    }
    localStorage.setItem(KEY, theme);
  }

  /* Restore saved preference (default: dark) */
  applyTheme(localStorage.getItem(KEY) || 'dark');

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
})();

/* ---- PROJECT FILTER ---- */
(function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length || !cards.length) return;

  function filterCards(filter) {
    cards.forEach(card => {
      const tags = (card.dataset.tags || '').toLowerCase();
      const match = filter === 'all' || tags.includes(filter);

      if (match) {
        /* Reveal hidden card */
        card.classList.remove('card-hidden', 'card-hiding');
        card.classList.add('card-showing');
        setTimeout(() => card.classList.remove('card-showing'), 420);
      } else {
        /* Hide visible card with animation */
        if (!card.classList.contains('card-hidden')) {
          card.classList.add('card-hiding');
          setTimeout(() => {
            card.classList.add('card-hidden');
            card.classList.remove('card-hiding');
          }, 350);
        }
      }
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards(btn.dataset.filter);
    });
  });
})();

/* ---- BACK TO TOP ---- */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
