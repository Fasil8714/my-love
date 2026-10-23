/**
 * To My Forever - Anniversary Love Letter
 * Client interactivity: audio autoplay/gate, mobile animations & floating particles
 */

(function () {
  'use strict';

  // DOM Elements
  const audio = document.getElementById('romanticAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicPauseIcon = document.getElementById('musicPauseIcon');
  const musicPlayIcon = document.getElementById('musicPlayIcon');
  const musicLabel = document.getElementById('musicLabel');
  const musicEqualizer = document.getElementById('musicEqualizer');

  const loveGate = document.getElementById('loveGate');
  const gateOpenBtn = document.getElementById('gateOpenBtn');

  const letterOpenBtn = document.getElementById('letterOpenBtn');
  const letterBtnText = document.getElementById('letterBtnText');
  const loveLetter = document.getElementById('forever');

  let isPlaying = false;
  let hasUnlocked = false;

  const SESSION_KEY = 'anniversary_love_letter_entered';
  const alreadyEntered = sessionStorage.getItem(SESSION_KEY) === 'true';

  /* ==========================================================================
     1. Romantic Audio Controls & Autoplay Management
     ========================================================================== */

  function updateMusicUI(playing) {
    isPlaying = playing;
    if (musicToggleBtn) {
      musicToggleBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      musicToggleBtn.title = playing ? 'Pause music' : 'Play music';
      musicToggleBtn.setAttribute(
        'aria-label',
        playing ? 'Pause romantic music' : 'Play romantic music'
      );
    }

    if (musicPauseIcon && musicPlayIcon) {
      if (playing) {
        musicPauseIcon.classList.remove('hidden');
        musicPlayIcon.classList.add('hidden');
      } else {
        musicPauseIcon.classList.add('hidden');
        musicPlayIcon.classList.remove('hidden');
      }
    }

    if (musicLabel) {
      musicLabel.textContent = playing ? 'Pause the music' : 'Play the music';
    }

    if (musicEqualizer) {
      if (playing) {
        musicEqualizer.classList.add('music-equalizer--playing');
      } else {
        musicEqualizer.classList.remove('music-equalizer--playing');
      }
    }
  }

  const dismissLoveGate = () => {
    if (loveGate && !loveGate.classList.contains('love-gate--dismissed')) {
      loveGate.classList.add('love-gate--dismissed');
      window.setTimeout(() => {
        loveGate.style.display = 'none';
      }, 850);
    }
  };

  const tryPlayMusic = async () => {
    if (!audio) return false;
    try {
      audio.muted = false;
      await audio.play();
      hasUnlocked = true;
      updateMusicUI(true);
      return true;
    } catch (err) {
      console.warn('Autoplay wait for gesture:', err.message);
      return false;
    }
  };

  const unlockAudioAndEnter = (e) => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    const clickX = e && typeof e.clientX === 'number' && e.clientX > 0 ? e.clientX : window.innerWidth / 2;
    const clickY = e && typeof e.clientY === 'number' && e.clientY > 0 ? e.clientY : window.innerHeight / 2;
    
    if (window.spawnHeartBurst) {
      window.spawnHeartBurst(clickX, clickY);
    }

    tryPlayMusic();
    dismissLoveGate();
  };

  if (gateOpenBtn) {
    gateOpenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      unlockAudioAndEnter(e);
    });
  }

  if (loveGate) {
    loveGate.addEventListener('click', (e) => {
      unlockAudioAndEnter(e);
    });
  }

  // Floating music toggle button
  if (musicToggleBtn && audio) {
    musicToggleBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (isPlaying) {
        audio.pause();
        updateMusicUI(false);
      } else {
        try {
          audio.muted = false;
          await audio.play();
          updateMusicUI(true);
        } catch (err) {
          console.warn('Audio play error:', err);
          updateMusicUI(false);
        }
      }
    });
  }

  // If user already visited in this session, resume smoothly
  if (alreadyEntered) {
    dismissLoveGate();
    tryPlayMusic();
  } else {
    // Preload audio so it's instantly ready the moment they tap
    if (audio) {
      try {
        audio.load();
      } catch (e) {}
    }
  }

  // Global gesture fallback: any tap/click on window ensures music starts
  const handleAnyWindowGesture = (e) => {
    if (!hasUnlocked) {
      tryPlayMusic();
      dismissLoveGate();
    }
  };
  ['pointerdown', 'touchstart', 'click'].forEach(evt => {
    window.addEventListener(evt, handleAnyWindowGesture, { passive: true, capture: true });
  });

  /* ==========================================================================
     2. Mobile-Optimized Scroll Reveal System
     ========================================================================== */

  const revealElements = document.querySelectorAll('[data-reveal]');

  function checkScrollReveals() {
    const viewHeight = window.innerHeight || document.documentElement.clientHeight;
    revealElements.forEach(el => {
      if (el.classList.contains('is-visible')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= viewHeight * 0.95 && rect.bottom >= 0) {
        el.classList.add('is-visible');
      }
    });
  }

  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.02, rootMargin: '60px 0px 60px 0px' }
    );

    revealElements.forEach(el => observer.observe(el));
    document.documentElement.classList.add('reveal-ready');
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // Mobile scroll & touch handlers to guarantee reveal triggers
  window.addEventListener('scroll', checkScrollReveals, { passive: true });
  window.addEventListener('touchmove', checkScrollReveals, { passive: true });
  window.addEventListener('resize', checkScrollReveals, { passive: true });
  window.addEventListener('orientationchange', checkScrollReveals, { passive: true });

  window.requestAnimationFrame(() => {
    checkScrollReveals();
    window.setTimeout(checkScrollReveals, 200);
    window.setTimeout(checkScrollReveals, 600);
  });

  /* ==========================================================================
     3. Open Love Letter Action
     ========================================================================== */

  if (letterOpenBtn && loveLetter) {
    letterOpenBtn.addEventListener('click', () => {
      loveLetter.hidden = false;
      letterOpenBtn.setAttribute('aria-expanded', 'true');

      if (letterBtnText) {
        letterBtnText.textContent = 'READ IT AGAIN, MY LOVE';
      }

      window.setTimeout(() => {
        loveLetter.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    });
  }

  /* ==========================================================================
     4. Floating Romantic Hearts & Touch Sparkle Particle Engine
     ========================================================================== */

  const canvas = document.getElementById('loveParticlesCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = window.innerWidth <= 768;
    const maxParticles = isMobile ? 22 : 36;
    const particles = [];
    const burstParticles = [];

    const heartColors = [
      'rgba(244, 156, 178, ',
      'rgba(255, 182, 193, ',
      'rgba(229, 176, 120, ',
      'rgba(168, 36, 73, ',
      'rgba(255, 248, 240, '
    ];

    function drawHeart(c, x, y, size, color, alpha, rotateAngle) {
      c.save();
      c.translate(x, y);
      c.rotate(rotateAngle);
      c.scale(size / 20, size / 20);
      c.fillStyle = color + alpha + ')';
      c.beginPath();
      c.moveTo(0, 5);
      c.bezierCurveTo(-10, -5, -18, 5, 0, 20);
      c.bezierCurveTo(18, 5, 10, -5, 0, 5);
      c.fill();
      c.restore();
    }

    function drawSparkle(c, x, y, size, color, alpha) {
      c.save();
      c.translate(x, y);
      c.fillStyle = color + alpha + ')';
      c.beginPath();
      c.arc(0, 0, size, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    class Particle {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : height + Math.random() * 40;
        this.size = Math.random() * 8 + (isMobile ? 7 : 9);
        this.speedY = Math.random() * 0.7 + 0.35;
        this.baseX = this.x;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayDistance = Math.random() * 30 + 15;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.alpha = Math.random() * 0.45 + 0.25;
        this.rotation = (Math.random() - 0.5) * 0.6;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
        this.isHeart = Math.random() > 0.35;
      }

      update() {
        this.y -= this.speedY;
        this.swayOffset += this.swaySpeed;
        this.x = this.baseX + Math.sin(this.swayOffset) * this.swayDistance;
        this.rotation += this.rotationSpeed;

        if (this.y < -30) {
          this.reset(false);
        }
      }

      draw() {
        if (this.isHeart) {
          drawHeart(ctx, this.x, this.y, this.size, this.color, this.alpha, this.rotation);
        } else {
          drawSparkle(ctx, this.x, this.y, this.size * 0.25, this.color, this.alpha);
        }
      }
    }

    class BurstParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1.2;
        this.size = Math.random() * 10 + 8;
        this.alpha = 1;
        this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gentle gravity
        this.alpha -= 0.02;
        this.rotation += this.rotSpeed;
      }

      draw() {
        if (this.alpha <= 0) return;
        drawHeart(ctx, this.x, this.y, this.size, this.color, Math.max(0, this.alpha), this.rotation);
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle(true));
    }

    window.spawnHeartBurst = (x, y) => {
      const count = isMobile ? 8 : 14;
      for (let i = 0; i < count; i++) {
        burstParticles.push(new BurstParticle(x, y));
      }
    };

    // Burst hearts on tap/click anywhere
    window.addEventListener('pointerdown', (e) => {
      if (e.clientX && e.clientY) {
        window.spawnHeartBurst(e.clientX, e.clientY);
      }
    }, { passive: true });

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function animate() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }

        for (let i = burstParticles.length - 1; i >= 0; i--) {
          burstParticles[i].update();
          burstParticles[i].draw();
          if (burstParticles[i].alpha <= 0) {
            burstParticles.splice(i, 1);
          }
        }
      }
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });
  }

})();
