/** De welkomstintro is optioneel. De app kan ondertussen zelfstandig starten. */
(() => {
  'use strict';
  const splash = document.getElementById('birdspotSplash');
  if (!splash) return;

  const key = 'aviandra-welcome-video-seen';
  const revision = '2';
  let seen = false;
  try { seen = localStorage.getItem(key) === revision; } catch (_) {}
  if (seen || !navigator.onLine) {
    splash.remove();
    return;
  }

  const app = document.getElementById('app');
  const skip = splash.querySelector('#birdspotSplashSkip');
  const image = splash.querySelector('.birdspot-splash__art');
  const video = splash.querySelector('.birdspot-splash__video');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = performance.now();

  let deadline = setTimeout(() => finish(reducedMotion), reducedMotion ? 1200 : 1800);
  app.inert = true;
  splash.hidden = false;
  skip.focus({ preventScroll: true });
  skip.addEventListener('click', () => finish(true));
  splash.addEventListener('keydown', event => {
    if (event.key === 'Escape') finish(true);
  });
  window.addEventListener('offline', abandon);

  function abandon() {
    finish(false);
  }

  function finish(completed) {
    if (!splash.isConnected) return;
    clearTimeout(deadline);
    window.removeEventListener('offline', abandon);
    if (completed) {
      try { localStorage.setItem(key, revision); } catch (_) {}
    }
    const restoreFocus = splash.contains(document.activeElement);
    splash.remove();
    app.inert = false;
    if (restoreFocus) document.getElementById('main-view').focus({ preventScroll: true });
    if (video.hasAttribute('src')) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    window.dispatchEvent(new CustomEvent('birdspot:splash-hidden', {
      detail: { elapsedMs: Math.round(performance.now() - startedAt) }
    }));
  }

  function showStillFallback() {
    splash.classList.add('image-unavailable');
    splash.querySelector('.birdspot-splash__fallback').hidden = false;
  }

  if (image.complete && !image.naturalWidth) showStillFallback();
  image.addEventListener('error', showStillFallback, { once: true });
  if (reducedMotion) return;

  function showVideo() {
    if (!splash.isConnected || video.currentTime <= 0) return;
    video.removeEventListener('timeupdate', showVideo);
    splash.classList.add('is-video-playing');
    clearTimeout(deadline);
    deadline = setTimeout(abandon, 5600);
  }

  video.addEventListener('timeupdate', showVideo);
  video.addEventListener('ended', () => finish(true), { once: true });
  video.addEventListener('error', abandon, { once: true });
  video.src = video.dataset.src;
  video.play().catch(abandon);
})();
