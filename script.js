/**
 * To My Forever - Anniversary Love Letter
 * Client interactivity: audio autoplay/toggle, scroll reveals & letter opening
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

  const letterOpenBtn = document.getElementById('letterOpenBtn');
  const letterBtnText = document.getElementById('letterBtnText');
  const loveLetter = document.getElementById('forever');

  let isPlaying = false;
  let isMutedState = false;
  let letterOpened = false;

  // 1. Scroll Reveal IntersectionObserver
  const revealElements = document.querySelectorAll('[data-reveal]');

  function revealAll() {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  if (typeof IntersectionObserver !== 'function') {
    window.requestAnimationFrame(revealAll);
  } else {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
    );

    revealElements.forEach(el => observer.observe(el));
    document.documentElement.classList.add('reveal-ready');

    const handleScroll = () => {
      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          el.classList.add('is-visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.requestAnimationFrame(handleScroll);
  }

  // 2. Audio playback & UI controls
  function updateMusicUI(playing, needsSoundTap = false) {
    isPlaying = playing;
    if (musicToggleBtn) {
      musicToggleBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      musicToggleBtn.title = playing ? 'Pause music' : needsSoundTap ? 'Turn sound on' : 'Play music';
      musicToggleBtn.setAttribute(
        'aria-label',
        playing ? 'Pause romantic music' : needsSoundTap ? 'Turn romantic music sound on' : 'Play romantic music'
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
      musicLabel.textContent = playing
        ? 'Pause the music'
        : needsSoundTap
        ? 'Tap for sound'
        : 'A little music?';
    }

    if (musicEqualizer) {
      if (playing) {
        musicEqualizer.classList.add('music-equalizer--playing');
      } else {
        musicEqualizer.classList.remove('music-equalizer--playing');
      }
    }
  }

  // Enhanced Autoplay & Immediate Gesture Unlock
  if (audio) {
    let hasUnlocked = false;

    const tryUnmutedPlay = async () => {
      if (hasUnlocked && isPlaying && !isMutedState) return true;
      try {
        audio.muted = false;
        await audio.play();
        hasUnlocked = true;
        isMutedState = false;
        updateMusicUI(true);
        removeUnlockEvents();
        return true;
      } catch (e) {
        return false;
      }
    };

    const handleAnyUserInteraction = () => {
      tryUnmutedPlay();
    };

    const unlockEvents = [
      'pointerdown', 'touchstart', 'touchend', 'touchmove',
      'mousemove', 'scroll', 'wheel', 'keydown', 'click', 'focus'
    ];

    const removeUnlockEvents = () => {
      unlockEvents.forEach(evt => {
        window.removeEventListener(evt, handleAnyUserInteraction, { passive: true, capture: true });
        document.removeEventListener(evt, handleAnyUserInteraction, { capture: true });
      });
    };

    unlockEvents.forEach(evt => {
      window.addEventListener(evt, handleAnyUserInteraction, { once: true, passive: true, capture: true });
      document.addEventListener(evt, handleAnyUserInteraction, { once: true, capture: true });
    });

    // 1. Try immediate unmuted play right away
    tryUnmutedPlay().then(success => {
      if (!success) {
        // 2. If unmuted was blocked by browser policy, start muted first to preload and keep audio hot
        audio.muted = true;
        audio.play().then(() => {
          isMutedState = true;
          updateMusicUI(true, true);
        }).catch(() => {
          audio.muted = false;
          updateMusicUI(false);
        });
      }
    });

    // 3. Retry on window load & DOMContentLoaded
    window.addEventListener('load', tryUnmutedPlay, { once: true });
    document.addEventListener('DOMContentLoaded', tryUnmutedPlay, { once: true });
  }

  // Toggle button click
  if (musicToggleBtn && audio) {
    musicToggleBtn.addEventListener('click', async () => {
      if (isPlaying && !isMutedState) {
        audio.pause();
        updateMusicUI(false);
        return;
      }

      try {
        audio.muted = false;
        await audio.play();
        isMutedState = false;
        updateMusicUI(true);
      } catch (err) {
        console.warn('Audio playback error', err);
        updateMusicUI(false);
      }
    });
  }

  // 3. Open Love Letter Action
  if (letterOpenBtn && loveLetter) {
    letterOpenBtn.addEventListener('click', () => {
      letterOpened = true;
      loveLetter.hidden = false;
      letterOpenBtn.setAttribute('aria-expanded', 'true');

      if (letterBtnText) {
        letterBtnText.textContent = 'READ IT AGAIN, MY LOVE';
      }

      window.setTimeout(() => {
        loveLetter.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 140);
    });
  }

})();
