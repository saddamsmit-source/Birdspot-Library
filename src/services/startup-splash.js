/** De app start zelfstandig terwijl de welkomstintro afspeelt. */
(() => {
  'use strict';
  const splash = document.getElementById('birdspotSplash');
  if (!splash) return;

  const app = document.getElementById('app');
  const main = document.getElementById('main-view');
  const skip = splash.querySelector('#birdspotSplashSkip');
  const image = splash.querySelector('.birdspot-splash__art');
  const video = splash.querySelector('.birdspot-splash__video');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const standalone = matchMedia('(display-mode: standalone)');
  const STILL_MS = 1200;
  const FIRST_FRAME_MS = 3000;
  const PLAYBACK_LIMIT_MS = 5700;
  const REOPEN_AFTER_MS = 30_000;
  let finishIntro;
  let hiddenAt;

  function showStillFallback() {
    splash.classList.add('image-unavailable');
    splash.querySelector('.birdspot-splash__fallback').hidden = false;
  }

  if (image.complete && !image.naturalWidth) showStillFallback();
  image.addEventListener('error', showStillFallback, { once: true });

  function playIntro() {
    if (!navigator.onLine || finishIntro) return;
    const startedAt = performance.now();
    const previousFocus = document.activeElement;
    const listeners = new AbortController();
    const { signal } = listeners;
    let deadline;

    function finish() {
      if (signal.aborted) return;
      clearTimeout(deadline);
      listeners.abort();
      finishIntro = undefined;
      const restoreFocus = splash.contains(document.activeElement);
      splash.remove();
      app.inert = false;
      if (restoreFocus) {
        const target = previousFocus?.isConnected && previousFocus !== document.body ? previousFocus : main;
        target.focus({ preventScroll: true });
      }
      splash.classList.remove('is-video-playing');
      if (video.hasAttribute('src')) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      window.dispatchEvent(new CustomEvent('birdspot:splash-hidden', {
        detail: { elapsedMs: Math.round(performance.now() - startedAt) }
      }));
    }

    function useStill() {
      if (signal.aborted) return;
      video.removeEventListener('timeupdate', showVideo);
      splash.classList.remove('is-video-playing');
      clearTimeout(deadline);
      deadline = setTimeout(finish, Math.max(0, STILL_MS - (performance.now() - startedAt)));
    }

    function showVideo() {
      if (video.currentTime <= 0) return;
      video.removeEventListener('timeupdate', showVideo);
      splash.classList.add('is-video-playing');
      clearTimeout(deadline);
      deadline = setTimeout(finish, PLAYBACK_LIMIT_MS);
    }

    finishIntro = finish;
    if (!splash.isConnected) app.before(splash);
    app.inert = true;
    splash.hidden = false;
    skip.focus({ preventScroll: true });
    skip.addEventListener('click', finish, { signal });
    splash.addEventListener('keydown', event => {
      if (event.key === 'Escape') finish();
    }, { signal });
    window.addEventListener('offline', finish, { signal });

    if (reducedMotion.matches) {
      deadline = setTimeout(finish, STILL_MS);
      return;
    }

    deadline = setTimeout(finish, FIRST_FRAME_MS);
    video.addEventListener('timeupdate', showVideo, { signal });
    video.addEventListener('ended', finish, { signal });
    video.addEventListener('error', useStill, { signal });
    video.src = video.dataset.src;
    video.play().catch(useStill);
  }

  function onVisibilityChange() {
    if (document.hidden) {
      hiddenAt = Date.now();
      finishIntro?.();
      return;
    }
    const awayFor = hiddenAt === undefined ? 0 : Date.now() - hiddenAt;
    hiddenAt = undefined;
    if (!(standalone.matches || navigator.standalone) || awayFor < REOPEN_AFTER_MS) return;
    if (!document.getElementById('screen-home') || app.inert) return;
    const dialogs = document.querySelectorAll('[aria-modal="true"]:not([hidden], [inert])');
    if ([...dialogs].some(dialog => dialog.getClientRects().length)) return;
    playIntro();
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  if (navigator.onLine && !document.hidden) playIntro();
  else splash.remove();
})();
