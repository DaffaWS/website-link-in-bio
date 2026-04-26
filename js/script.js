/* =========================================
   SCRIPT.JS — Bio Link + Secret System
   ========================================= */

'use strict';

/* =========================================
   1. PARTICLE BACKGROUND
   ========================================= */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2
    };
  }

  function initParticleList() {
    particles = [];
    const count = Math.min(Math.floor(window.innerWidth * 0.06), 80);
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.pulse += 0.015;
      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 180, 255, ${alpha})`;
      ctx.fill();

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });

    // Draw faint connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 180, 255, ${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(drawParticles);
  }

  resize();
  initParticleList();
  drawParticles();

  window.addEventListener('resize', () => {
    resize();
    initParticleList();
  });
})();


/* =========================================
   2. PARALLAX BANNER (Bio Link only)
   ========================================= */
(function initParallax() {
  const banner = document.querySelector('.banner-img');
  if (!banner) return;

  function onScroll() {
    const scrollY = window.scrollY;
    banner.style.transform = `translateY(${scrollY * 0.35}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* =========================================
   3. SCROLL REVEAL
   ========================================= */
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
})();


/* =========================================
   4. SECRET CLICK SYSTEM — Tombol Refresh
   =========================================
   CARA KERJA (step-based pattern):
   ─────────────────────────────────
   Setiap sesi (setelah reload), user harus klik
   tombol sebanyak (step + 1) kali dalam 1 detik:

   Step 0 → klik 1x  → reload → step jadi 1
   Step 1 → klik 2x  → reload → step jadi 2
   Step 2 → klik 3x  → reload → step jadi 3
   Step 3 → klik 4x  → reload → step jadi 4
   Step 4 → klik 5x  → BERHASIL → redirect

   Klik salah jumlah → step reset ke 0
   Diam 15 detik     → step reset ke 0 (diam-diam)
   ========================================= */
(function initSecretSystem() {
  const btn = document.querySelector('.btn-refresh');
  if (!btn) return;

  // ---- Konstanta ----
  const STEP_KEY      = 'click_step';      // localStorage key untuk step
  const ACCESS_KEY    = 'access_granted';  // localStorage key akses
  const MAX_STEP      = 5;                 // total tahap (step 0–4, selesai di step 5)
  const CLICK_WINDOW  = 1000;             // ms — jendela waktu deteksi klik cepat
  const IDLE_TIMEOUT  = 15000;            // ms — reset jika idle 15 detik

  // ---- State ----
  let currentStep  = parseInt(localStorage.getItem(STEP_KEY) || '0');
  let clickBuffer  = 0;
  let clickTimer   = null;
  let idleTimer    = null;
  let isLocked     = false;

  /* ---- resetStep ---- */
  function resetStep() {
    currentStep = 0;
    clickBuffer = 0;
    localStorage.setItem(STEP_KEY, '0');
    clearTimeout(clickTimer);
    clearTimeout(idleTimer);
    clickTimer = null;
    idleTimer  = null;
  }

  /* ---- startIdleTimer: mulai hitung mundur 15 detik tanpa tampilan ---- */
  function startIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // Diam-diam reset jika tidak ada interaksi
      resetStep(true);
    }, IDLE_TIMEOUT);
  }

  /* ---- showLoadingAndRedirect: animasi lalu pindah ke halaman rahasia ---- */
  function showLoadingAndRedirect() {
    // Tandai akses diberikan
    localStorage.setItem(ACCESS_KEY, 'true');
    // Bersihkan step setelah berhasil
    localStorage.removeItem(STEP_KEY);

    // Tampilkan loading overlay
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.classList.add('active');

    // Redirect setelah animasi
    setTimeout(() => {
      window.location.href = 'x9k2m-create.html';
    }, 1800);
  }

  /* ---- doReload: animasi spin lalu reload ---- */
  function doReload() {
    isLocked = true;
    btn.classList.add('spinning');
    setTimeout(() => {
      location.reload();
    }, 380);
  }

  /* ---- processClickBuffer: dipanggil setelah jendela waktu habis ----
     Cek apakah jumlah klik = (step + 1) yang diharapkan               */
  function processClickBuffer() {
    if (isLocked) return;

    const required = currentStep + 1; // klik yang dibutuhkan di step ini

    if (clickBuffer === required) {
      // ✅ Klik sesuai pola
      currentStep++;
      localStorage.setItem(STEP_KEY, String(currentStep));
      clickBuffer = 0;

      if (currentStep >= MAX_STEP) {
        clearTimeout(idleTimer);
        showLoadingAndRedirect();
      } else {
        doReload();
      }

    } else {
      // ❌ Klik tidak sesuai → reset ke 0 + reload biasa
      resetStep(false);
      doReload();
    }
  }

  /* ---- INIT ---- */
  if (currentStep > 0) {
    startIdleTimer();
  }

  /* ---- EVENT LISTENER ---- */
  btn.addEventListener('click', function () {
    if (isLocked) return;

    // Tambah hitungan klik ke buffer
    clickBuffer++;

    // (Re)start idle timer — user masih aktif
    startIdleTimer();

    // Clear timer sebelumnya agar tidak proses terlalu cepat
    clearTimeout(clickTimer);

    // Set timer: proses buffer setelah CLICK_WINDOW ms tanpa klik baru
    // Ini yang membedakan single-click vs double-click vs triple-click dll.
    clickTimer = setTimeout(() => {
      processClickBuffer();
    }, CLICK_WINDOW);
  });

  /* ---- Pastikan tidak ada state kotor saat unload ---- */
  window.addEventListener('pagehide', () => {
    clearTimeout(clickTimer);
    clearTimeout(idleTimer);
  });

})();


/* =========================================
   5. LINK CARD INTERACTIONS (Bio Page)
   ========================================= */
(function initLinkCards() {
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.link-card');
    if (!card) return;

    // Animasi klik
    card.classList.remove('clicked');
    void card.offsetWidth; // reflow
    card.classList.add('clicked');
  });
})();


/* =========================================
   6. PASSWORD LOCK SYSTEM (Bio Page)
   ========================================= */
(function initPasswordSystem() {
  const overlay = document.getElementById('lock-overlay');
  if (!overlay) return;

  let currentTarget = null;
  let currentPassword = null;

  // Buka overlay
  document.addEventListener('click', function(e) {
    const card = e.target.closest('[data-locked="true"]');
    if (!card) return;
    e.preventDefault();

    currentTarget = card.getAttribute('data-href');
    currentPassword = card.getAttribute('data-password');

    const lockTitle = overlay.querySelector('.lock-title');
    if (lockTitle) lockTitle.textContent = card.querySelector('.link-card-title')?.textContent || 'Protected Link';

    const input = overlay.querySelector('.lock-input');
    if (input) input.value = '';

    const err = overlay.querySelector('.lock-error');
    if (err) err.textContent = '';

    overlay.classList.add('active');
    setTimeout(() => { if (input) input.focus(); }, 100);
  });

  // Submit password
  const submitBtn = overlay.querySelector('.lock-btn');
  const inputEl = overlay.querySelector('.lock-input');
  const errorEl = overlay.querySelector('.lock-error');

  function tryUnlock() {
    if (!inputEl) return;
    const val = inputEl.value;

    if (val === currentPassword) {
      overlay.classList.remove('active');
      if (currentTarget) {
        setTimeout(() => window.open(currentTarget, '_blank'), 200);
      }
    } else {
      if (errorEl) {
        errorEl.textContent = 'Password salah. Coba lagi.';
        inputEl.classList.add('shake');
        setTimeout(() => inputEl.classList.remove('shake'), 400);
      }
      inputEl.value = '';
      inputEl.focus();
    }
  }

  if (submitBtn) submitBtn.addEventListener('click', tryUnlock);
  if (inputEl) inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });

  const cancelEl = overlay.querySelector('.lock-cancel');
  if (cancelEl) {
    cancelEl.addEventListener('click', () => {
      overlay.classList.remove('active');
      currentTarget = null;
      currentPassword = null;
    });
  }

  // Close on backdrop click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
})();


/* =========================================
   TOAST HELPER (global)
   ========================================= */
window.showToast = function(msg, duration = 2000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
};


/* =============================
KODE ID nvstore (JS)
Animasi: shake
============================= */

(function() {
  const c = document.getElementById('nvstore');
  if (!c) return;
  c.addEventListener('click', function(e) {
    if (e.target.closest('.ripple-wave,.xp-dot')) return;
    this.classList.remove('clicked'); void this.offsetWidth; this.classList.add('clicked');
    setTimeout(() => window.open('https://www.youtube.com/@NeonVortexStore', '_blank', 'noopener,noreferrer'), 120);
  });
})();

/* Animasi ini murni CSS — tidak butuh JS tambahan. */

/* =============================
BATAS AKHIR KODE ID nvstore
============================= */
