'use strict';

/* ---- DATA ---- */
const SKILLS = [
  { name: 'Embedded C', pct: 88 },
  { name: 'Java', pct: 75 },
  { name: 'Python', pct: 80 },
  { name: 'MATLAB', pct: 70 },
  { name: 'Multisim', pct: 72 },
  { name: 'Keil µVision', pct: 82 },
  { name: 'Proteus', pct: 78 },
];

const TYPED_PHRASES = [
  'ECE Student',
  'Embedded Systems Enthusiast',
  'IoT Developer',
];

/* ---- SKILLS RENDER ---- */
(function renderSkills() {
  const grid = document.querySelector('.skills-grid');
  if (!grid) return;

  SKILLS.forEach((s, i) => {
    const delay = i < 5 ? `reveal-delay-${i + 1}` : '';
    const html = `
      <div class="skill-item reveal ${delay}" role="group" aria-label="${s.name} skill">
        <div class="skill-header">
          <span class="skill-name">${s.name}</span>
          <span class="skill-pct" aria-label="${s.pct} percent">${s.pct}%</span>
        </div>
        <div class="skill-bar-track" role="progressbar" aria-valuenow="${s.pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="skill-bar-fill" data-pct="${s.pct}"></div>
        </div>
      </div>`;
    grid.insertAdjacentHTML('beforeend', html);
  });
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
