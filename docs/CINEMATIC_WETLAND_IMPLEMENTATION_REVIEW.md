# Birdspot Signature — Cinematic Wetland (Implementation Review)

## Owner-approved visual direction
Match the previously selected LEFT image: flying owl / automatically
rotating species photography above, prominent golden stat buttons, a serene
reed marsh 9:16 background BEHIND Golden Hour, Weather, Monthly Observations
and My Hotspots. No separate 'De natuur staat nooit stil' promo card.

## Actual implementation (not an image / screenshot animation)
- Native <video muted playsinline loop> inserted as a decorative layer inside the
  real app. Artlist Kling 2.6 Pro generated one silent ten-second 9:16
  photographic marsh video in this request. **800 Artlist credits used**.
  Generation ID: 01a1a83d-3309-7ab7-b151-ca6de4f71708.
- The video source uses an Artlist asset-specific signed CDN URL. It is
  not an Artlist API key. URL is valid only while the CDN signs this particular
  asset; for long-term production use migrate to a first-party asset path.
- Video loads lazily only when the section is visible and can autoplay. It pauses
  when off-screen, hidden, or on reduced-motion / save-data settings.
- An always-available responsive 9:16 SVG with CSS 16–47s eased reed/water/
  mist/sun motion provides a soft, smooth offline fallback.
- The video is silent; no sound or user data uploaded.
- Dashboard texts/cards are separate interactive DOM elements above a contrast
  scrim and dark translucent cards. Animation never moves text or controls.
- Four KPI tiles are raised, warm-gold outlined, larger and clickable.
- Extra modules remain reachable via 'Meer ontdekken' disclosure.

## Birds / editorial hero
- No category dropdown, arrows, previous/next or 'switches every minute' labels.
- One bird changes every 60 seconds on a persisted wall clock (works logically
  across closed/reopened apps without running a background timer).
- Library expanded from 16 to more than 50 species using the built-in 120-species
  field-guide database, with scientific names, field marks and habitat hints.
- Species are deterministically shuffled per user so groups alternate visually.
- Sixteen already sourced Commons files keep linked photographer credits.
- New species image media selected lazily by Latin-name search on Wikimedia
  Commons; only exact-name matches with safe CC/Public-domain metadata accepted.
  If not available, a tasteful CSS fallback is shown, never a wrong bird.
- These are editorial images, not the user's own observation photos.

## Technical QA gate
- Tests: real video when CDN available, width/height and ~10s duration,
  media time progresses, pause/reduced-motion/offline fallback, layer contrast,
  no overflow at 320/360/390/430, species search/observation route regressions.
- Real Android/iOS device testing, mobile data use and actual generated bird-photo
  coverage over 50+ slides remain open acceptance checks.
- The signed remote video is not offline-cached; SVG fallback works offline.
  A first-party hosted MP4 is the desired follow-up before long-term public release.
- No merge to main without explicit owner approval. PR based on PR #15,
  which itself depends on PR #14. Production remains intact.
