(function() {
  'use strict';

  const ANIMATION_STEPS = [
    { step: 0, duration: 1000, name: 'setup' },
    { step: 1, duration: 1500, name: 'cursor-a-move' },
    { step: 2, duration: 1200, name: 'new-goal-typing' },
    { step: 3, duration: 1500, name: 'partner-approval' },
    { step: 4, duration: 2000, name: 'timeline-draw' },
    { step: 5, duration: 2500, name: 'crystallization' },
    { step: 6, duration: 3000, name: 'result-display' }
  ];

  const TOTAL_LOOP_DURATION = ANIMATION_STEPS.reduce((sum, s) => sum + s.duration, 0);

  let heroEl = null;
  let horizonToggle = null;
  let animationTimer = null;
  let currentStepIndex = 0;
  let prefersReducedMotion = false;

  function init() {
    try {
      heroEl = document.getElementById('hero');
      horizonToggle = document.getElementById('horizon-toggle');

      if (!heroEl) {
        console.warn('[hero-roadmap] Hero element not found');
        return;
      }

      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
        if (prefersReducedMotion) {
          stopAnimationLoop();
          showFinalState();
        } else {
          startAnimationLoop();
        }
      });

      initHorizonToggle();

      if (prefersReducedMotion) {
        showFinalState();
      } else {
        startAnimationLoop();
      }
    } catch (error) {
      console.warn('[hero-roadmap] Initialization error:', error);
    }
  }

  function initHorizonToggle() {
    if (!horizonToggle) {
      console.warn('[hero-roadmap] Horizon toggle not found');
      return;
    }

    const buttons = horizonToggle.querySelectorAll('.horizon-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => handleHorizonChange(btn));
      btn.addEventListener('keydown', (e) => handleHorizonKeydown(e, buttons));
    });
  }

  function handleHorizonChange(selectedBtn) {
    try {
      const horizonValue = selectedBtn.dataset.horizonValue;
      if (!horizonValue) return;

      heroEl.dataset.horizon = horizonValue;

      const buttons = horizonToggle.querySelectorAll('.horizon-btn');
      buttons.forEach((btn) => {
        const isSelected = btn === selectedBtn;
        btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        btn.setAttribute('tabindex', isSelected ? '0' : '-1');

        if (isSelected) {
          btn.classList.add('bg-green', 'text-white', 'shadow-lg', 'shadow-green/30');
          btn.classList.remove('text-blue-really-light/70');
        } else {
          btn.classList.remove('bg-green', 'text-white', 'shadow-lg', 'shadow-green/30');
          btn.classList.add('text-blue-really-light/70');
        }
      });
    } catch (error) {
      console.warn('[hero-roadmap] Error handling horizon change:', error);
    }
  }

  function handleHorizonKeydown(e, buttons) {
    const currentIndex = Array.from(buttons).indexOf(e.target);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex === buttons.length - 1 ? 0 : currentIndex + 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleHorizonChange(e.target);
        return;
      default:
        return;
    }

    buttons[nextIndex].focus();
    handleHorizonChange(buttons[nextIndex]);
  }

  function startAnimationLoop() {
    if (prefersReducedMotion) return;

    currentStepIndex = 0;
    runAnimationStep();
  }

  function runAnimationStep() {
    if (prefersReducedMotion || !heroEl) return;

    const stepConfig = ANIMATION_STEPS[currentStepIndex];
    heroEl.dataset.animStep = stepConfig.step.toString();

    animationTimer = setTimeout(() => {
      currentStepIndex++;

      if (currentStepIndex >= ANIMATION_STEPS.length) {
        heroEl.classList.add('hero-anim-complete');

        setTimeout(() => {
          resetAnimation();
          startAnimationLoop();
        }, 2000);
      } else {
        runAnimationStep();
      }
    }, stepConfig.duration);
  }

  function stopAnimationLoop() {
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }
  }

  function resetAnimation() {
    if (!heroEl) return;

    heroEl.classList.remove('hero-anim-complete');
    heroEl.dataset.animStep = '0';
    currentStepIndex = 0;
  }

  function showFinalState() {
    if (!heroEl) return;

    heroEl.classList.add('hero-anim-complete');
    heroEl.dataset.animStep = '6';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


