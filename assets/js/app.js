/* =====================================================
   PORTFOLIO — Main App (GSAP + Interactions)
   ===================================================== */

gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* =====================================================
   HELPER — safe onEnter reveal (never hides elements by default)
   ===================================================== */
function onEnterReveal(triggerEl, fromVars, targets) {
  const t = targets || triggerEl;
  if (!document.querySelector(typeof t === 'string' ? t : triggerEl)) return;
  ScrollTrigger.create({
    trigger: triggerEl,
    start: 'top 85%',
    once: true,
    onEnter() {
      gsap.from(t, { ...fromVars, clearProps: 'all' });
    }
  });
}

/* =====================================================
   LOADER
   ===================================================== */
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loader-fill');
  const pct    = document.getElementById('loader-pct');
  let count    = 0;

  const step = () => {
    if (count >= 100) {
      fill.style.width = '100%';
      pct.textContent  = '100%';
      setTimeout(() => {
        gsap.to(loader, {
          opacity: 0, duration: 0.6, ease: 'power2.inOut',
          onComplete() {
            loader.style.display = 'none';
            document.body.classList.remove('is-loading');
            initHeroAnimations();
          }
        });
      }, 300);
      return;
    }
    count = Math.min(100, count + Math.random() * 8 + 3);
    fill.style.width = count + '%';
    pct.textContent  = Math.floor(count) + '%';
    setTimeout(step, 40 + Math.random() * 55);
  };
  setTimeout(step, 150);
})();

/* =====================================================
   CUSTOM CURSOR  (desktop only)
   ===================================================== */
(function initCursor() {
  const dot  = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;

  let rx = -100, ry = -100, dx = -100, dy = -100;

  document.addEventListener('mousemove', e => {
    dx = e.clientX; dy = e.clientY;
    gsap.set(dot, { x: dx, y: dy });
  });

  gsap.ticker.add(() => {
    rx += (dx - rx) * 0.12;
    ry += (dy - ry) * 0.12;
    gsap.set(ring, { x: rx, y: ry });
  });

  const hoverEls = 'a, button, .filter-btn, .t-dot, .cl-card, .proj-card, .svc-card, .skill-cat';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(dot,  { scale: 2.5, background: 'var(--purple)', duration: 0.2 });
      gsap.to(ring, { scale: 1.8, opacity: 0.4, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(dot,  { scale: 1, background: 'var(--cyan)', duration: 0.2 });
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.2 });
    });
  });
})();

/* =====================================================
   SCROLL PROGRESS BAR
   ===================================================== */
(function initScrollBar() {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  }, { passive: true });
})();

/* =====================================================
   NAVBAR
   ===================================================== */
(function initNavbar() {
  const nav   = document.getElementById('navbar');
  const ham   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  const navAs = document.querySelectorAll('.nav-link');
  const btt   = document.getElementById('btt');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 60);
    if (btt) btt.classList.toggle('visible', scrollY > 300);

    let current = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (scrollY >= s.offsetTop - 120) current = s.id;
    });
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }, { passive: true });

  ham?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open);
  });

  navAs.forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    ham?.classList.remove('open');
    ham?.setAttribute('aria-expanded', false);
  }));

  btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* =====================================================
   HERO ANIMATIONS  (called after loader)
   ===================================================== */
function initHeroAnimations() {
  gsap.timeline({ delay: 0.1 })
    .from('.hero-eyebrow',   { y: 24, opacity: 0, duration: 0.55 })
    .from('.hero-name',      { y: 36, opacity: 0, duration: 0.65 }, '-=0.25')
    .from('.hero-role-line', { y: 18, opacity: 0, duration: 0.5  }, '-=0.3')
    .from('.hero-bio',       { y: 18, opacity: 0, duration: 0.5  }, '-=0.2')
    .from('.hero-btns',      { y: 18, opacity: 0, duration: 0.45 }, '-=0.2')
    .from('.hero-socials',   { y: 14, opacity: 0, duration: 0.4  }, '-=0.15')
    .from('.hero-visual',    { x: 50, opacity: 0, duration: 0.75, ease: 'power3.out' }, 0.3)
    .from('.avail-badge',    { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.25')
    .from('.h-float',        { scale: 0, opacity: 0, stagger: 0.12, ease: 'back.out(2)', duration: 0.45 }, '-=0.3')
    .from('.scroll-hint',    { opacity: 0, y: 8, duration: 0.4 }, '-=0.1');

  initTyping();
}

/* =====================================================
   TYPING EFFECT
   ===================================================== */
function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const words = ['WordPress Sites', 'Custom Plugins', 'PHP Applications', 'WooCommerce Stores', 'Shopify Stores', 'React Apps'];
  let wi = 0, ci = 0, deleting = false;

  (function type() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);

    if (!deleting && ci > word.length)       { deleting = true; setTimeout(type, 1800); return; }
    if (deleting && ci < 0)                  { deleting = false; wi = (wi + 1) % words.length; ci = 0; }

    setTimeout(type, deleting ? 50 : 85);
  })();
}

/* =====================================================
   SCROLL ANIMATIONS  — onEnter pattern (never hides elements on load)
   ===================================================== */
(function initScrollAnims() {

  /* ---- ABOUT ---- */
  onEnterReveal('.about-img-wrap', { x: -50, opacity: 0, duration: 0.75 });
  onEnterReveal('.about-text-col', { x:  40, opacity: 0, duration: 0.75, stagger: 0 }, '.about-p');
  onEnterReveal('.about-details',  { y: 20, opacity: 0, stagger: 0.08, duration: 0.5 }, '.detail');
  onEnterReveal('.stats-row',      { y: 20, opacity: 0, scale: 0.92, stagger: 0.09, duration: 0.5 }, '.stat-chip');

  /* Counter animation */
  document.querySelectorAll('.stat-chip').forEach(chip => {
    const numEl  = chip.querySelector('.s-num');
    const target = parseInt(chip.dataset.count);
    const suffix = chip.dataset.suffix || '';
    if (!numEl || isNaN(target)) return;
    ScrollTrigger.create({
      trigger: chip, start: 'top 88%', once: true,
      onEnter() {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.8, ease: 'power2.out',
          onUpdate() { numEl.textContent = Math.round(obj.v) + suffix; }
        });
      }
    });
  });

  /* ---- SKILLS ---- */
  onEnterReveal('.skills-grid', { y: 40, opacity: 0, stagger: 0.12, duration: 0.65 }, '.skill-cat');

  ScrollTrigger.create({
    trigger: '.skills-grid', start: 'top 75%', once: true,
    onEnter() {
      document.querySelectorAll('.sk-fill').forEach(bar => {
        const lv = (bar.style.getPropertyValue('--lv') || bar.getAttribute('data-level') || '0%').trim();
        gsap.fromTo(bar, { width: 0 }, { width: lv, duration: 1.3, ease: 'power2.out', delay: 0.15 });
      });
    }
  });

  /* ---- SERVICES ---- */
  onEnterReveal('.services-grid', { y: 48, opacity: 0, stagger: 0.1, duration: 0.6 }, '.svc-card');

  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top)  + 'px');
    });
  });

  /* ---- PROJECTS ---- */
  onEnterReveal('#projects-grid', { y: 48, opacity: 0, stagger: 0.1, duration: 0.6 }, '.proj-card');

  /* ---- EXPERIENCE ---- */
  onEnterReveal('.timeline', { y: 40, opacity: 0, stagger: 0.18, duration: 0.65 }, '.tl-card');

  ScrollTrigger.create({
    trigger: '.timeline', start: 'top 70%', end: 'bottom 55%', scrub: 1.5,
    onUpdate(self) {
      const prog = document.getElementById('tl-progress');
      if (prog) prog.style.height = (self.progress * 100) + '%';
    }
  });

  /* ---- CLIENTS ---- */
  onEnterReveal('.marquee-wrap', { opacity: 0, duration: 0.65 });

  /* ---- TESTIMONIALS ---- */
  onEnterReveal('.t-slider', { y: 36, opacity: 0, duration: 0.65 });

  /* ---- CONTACT ---- */
  onEnterReveal('.contact-grid', { x: -40, opacity: 0, duration: 0.65 }, '.contact-info-col');
  onEnterReveal('.contact-grid', { x:  40, opacity: 0, duration: 0.65 }, '.contact-form-col');

  /* ---- FOOTER ---- */
  onEnterReveal('.footer-grid', { y: 28, opacity: 0, stagger: 0.1, duration: 0.55 }, '.footer-grid > *');

  /* ---- Generic section headers ---- */
  document.querySelectorAll('.sec-header').forEach(el => {
    onEnterReveal(el, { y: 36, opacity: 0, duration: 0.65 });
  });

})();

/* =====================================================
   MAGNETIC BUTTONS
   ===================================================== */
(function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width/2) * 0.3, y: (e.clientY - r.top - r.height/2) * 0.3, duration: 0.35, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1,0.5)' });
    });
  });
})();

/* =====================================================
   PROJECT FILTER  — Task #2 fix: initialize visible state first
   ===================================================== */
(function initProjectFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const grid  = document.getElementById('projects-grid');
  if (!btns.length || !grid) return;

  const allCards = () => grid.querySelectorAll('.proj-card');

  /* ---- Set every card visible on init ---- */
  allCards().forEach(c => {
    c.classList.remove('proj-hidden');
    gsap.set(c, { opacity: 1, y: 0, scale: 1, display: '' });
  });

  function applyFilter(filter) {
    allCards().forEach(card => {
      const cats     = (card.dataset.cat || '').split(' ');
      const match    = filter === 'all' || cats.includes(filter);
      const isHidden = card.classList.contains('proj-hidden');

      if (match && isHidden) {
        /* Reveal a hidden card */
        card.classList.remove('proj-hidden');
        gsap.fromTo(card,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0,  scale: 1, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
        );
      } else if (!match && !isHidden) {
        /* Hide a visible card */
        gsap.to(card, {
          opacity: 0, y: -10, scale: 0.95, duration: 0.25,
          onComplete() {
            card.classList.add('proj-hidden');
            gsap.set(card, { clearProps: 'all' });
          }
        });
      }
      /* Already in the correct state — no animation needed */
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });
})();

/* =====================================================
   TESTIMONIALS SLIDER
   ===================================================== */
(function initTestimonials() {
  const cards = document.querySelectorAll('.t-card');
  const dots  = document.querySelectorAll('.t-dot');
  const prev  = document.getElementById('t-prev');
  const next  = document.getElementById('t-next');
  if (!cards.length) return;

  let current = 0, timer;

  function show(idx) {
    const prev_idx = current;
    current = ((idx % cards.length) + cards.length) % cards.length;
    if (prev_idx === current) return;

    cards[prev_idx].classList.remove('t-active');
    dots[prev_idx]?.classList.remove('t-dot-active');
    cards[current].classList.add('t-active');
    dots[current]?.classList.add('t-dot-active');
  }

  function autoPlay() {
    clearTimeout(timer);
    timer = setTimeout(() => { show(current + 1); autoPlay(); }, 5000);
  }

  prev?.addEventListener('click', () => { show(current - 1); autoPlay(); });
  next?.addEventListener('click', () => { show(current + 1); autoPlay(); });
  dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.i); autoPlay(); }));

  autoPlay();
})();

/* =====================================================
   CONTACT FORM
   ===================================================== */
(function initContactForm() {
  const form   = document.getElementById('contact-form');
  const msgBox = document.getElementById('form-msg');
  const subBtn = document.getElementById('submit-btn');
  if (!form) return;

  function setErr(id, msg) {
    const input = document.getElementById(id);
    const err   = input?.closest('.form-group')?.querySelector('.ferr');
    if (err)   err.textContent = msg;
    if (input) input.classList.toggle('error', !!msg);
    return !!msg;
  }

  function validate(name, email, subject, message) {
    let invalid = false;
    if (setErr('f-name',    name.trim().length < 2))              invalid = true;
    if (setErr('f-email',   !/^\S+@\S+\.\S+$/.test(email.trim()))) invalid = true;
    if (setErr('f-subject', subject.trim().length < 3))           invalid = true;
    if (setErr('f-message', message.trim().length < 20))          invalid = true;
    return !invalid;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = document.getElementById('f-name')?.value    || '';
    const email   = document.getElementById('f-email')?.value   || '';
    const subject = document.getElementById('f-subject')?.value || '';
    const message = document.getElementById('f-message')?.value || '';
    const hp      = form.querySelector('.hp')?.value;

    form.querySelectorAll('.ferr').forEach(e => e.textContent = '');
    form.querySelectorAll('input, textarea').forEach(i => i.classList.remove('error'));

    if (hp) return;
    if (!validate(name, email, subject, message)) return;

    subBtn.classList.add('sending');
    subBtn.disabled = true;
    msgBox.className = 'form-msg';

    const body = new FormData();
    body.append('name', name);
    body.append('email', email);
    body.append('subject', subject);
    body.append('message', message);

    try {
      const res  = await fetch('contact.php', { method: 'POST', body });
      const data = await res.json();
      if (data.success) {
        msgBox.textContent = data.message || "Message sent! I'll get back to you soon.";
        msgBox.className   = 'form-msg success show';
        form.reset();
        gsap.from(msgBox, { y: 8, opacity: 0, duration: 0.35 });
      } else {
        throw new Error(data.message || 'Something went wrong.');
      }
    } catch (err) {
      const isNetworkErr = err.message === 'Failed to fetch' || err.message.includes('JSON');
      msgBox.textContent = isNetworkErr
        ? 'contact.php not available locally. On your server it will work. Email directly: dograsourabh91@gmail.com'
        : (err.message || 'Failed to send. Please try again.');
      msgBox.className = 'form-msg error show';
    } finally {
      subBtn.classList.remove('sending');
      subBtn.disabled = false;
    }
  });
})();

/* =====================================================
   HERO VISUAL PARALLAX
   ===================================================== */
(function initHeroParallax() {
  const visual = document.querySelector('.hero-visual');
  if (!visual) return;
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate(s) { gsap.set(visual, { y: s.progress * 70 }); }
  });
})();
