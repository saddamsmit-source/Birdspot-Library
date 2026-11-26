/** De app start onder de welkomstvideo. Alleen de introvoorkeur wordt bewaard. */
(() => {
  'use strict';
  const splash = document.getElementById('birdspotSplash');
  if (!splash) return;

  const key = 'aviandra-welcome-video-seen';
  if (!navigator.onLine) {
    splash.remove();
    return;
  }
  try {
    if (localStorage.getItem(key) === '1') {
      splash.remove();
      return;
    }
  } catch (_) { /* Privéprofiel zonder opslag blijft bruikbaar. */ }
  const skip = splash.querySelector('#birdspotSplashSkip');
  const image = splash.querySelector('.birdspot-splash__art');
  const video = splash.querySelector('.birdspot-splash__video');
  const note = splash.querySelector('.birdspot-splash__loading-note');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = performance.now();
  let ready = false;
  let elapsed = false;
  let skipRequested = false;
  let closing = false;
  let introTimeout = setTimeout(endIntro, 5000);

  function finish() {
    if (video.hasAttribute('src')) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    try { localStorage.setItem(key, '1'); } catch (_) {}
    splash.remove();
    window.dispatchEvent(new CustomEvent('birdspot:splash-hidden', {
      detail: { elapsedMs: Math.round(performance.now() - startedAt) }
    }));
  }

  function maybeHide() {
    if (closing || !ready || (!elapsed && !skipRequested)) return;
    closing = true;
    clearTimeout(introTimeout);
    if (skipRequested || reducedMotion) {
      finish();
      return;
    }
    splash.classList.add('is-exiting');
    splash.setAttribute('aria-hidden', 'true');
    skip.disabled = true;
    setTimeout(finish, 350);
  }

  function endIntro() {
    elapsed = true;
    maybeHide();
  }

  window.addEventListener('birdspot:ready', () => {
    ready = true;
    maybeHide();
  }, { once: true });
  skip.addEventListener('click', () => {
    skipRequested = true;
    if (!ready) note.textContent = 'Aviandra wordt geopend…';
    maybeHide();
  });
  image.addEventListener('error', () => {
    splash.classList.add('image-unavailable');
    splash.querySelector('.birdspot-splash__fallback')?.removeAttribute('hidden');
  }, { once: true });

  if (!reducedMotion) {
    video.addEventListener('playing', () => {
      if (elapsed || skipRequested) return;
      splash.classList.add('is-video-playing');
      clearTimeout(introTimeout);
      // Geef de korte clip tijd om af te spelen, ook bij een trage start.
      introTimeout = setTimeout(endIntro, Math.max(0, 6500 - (performance.now() - startedAt)));
    }, { once: true });
    video.addEventListener('ended', endIntro, { once: true });
    video.src = video.dataset.src;
    video.play().catch(() => { /* De stilstaande foto blijft beschikbaar. */ });
  }

  setTimeout(() => {
    if (ready || closing) return;
    note.textContent = 'Opstarten duurt langer dan normaal. Controleer je verbinding.';
    skip.textContent = 'Opnieuw laden';
    skip.addEventListener('click', () => window.location.reload(), { once: true });
  }, 12000);
})();
