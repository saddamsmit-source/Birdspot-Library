# Birdspot — Mobile Field QA & Bijzondere Vogels (REVIEW)

## Scope
Base: PR #14 (splash image + Explorer dropdown) is pending review. Work on a new feature branch from its approved candidate head to avoid touching production or losing the splash.

### 1. Mobile observations
- Existing add/edit observation sheet becomes a safe-area-aware mobile panel (fixed header/footer, independently scrollable content, single-column quantity/certainty on phones, three equal-width method choices).
- No change to canonical observation fields, IndexedDB or ZIP format.
- Safari/Android 320/360/390/430 viewport CSS constraints.
- Focus, save, date, media, map pin and Merlin choices remain functional.

### 2. Species: seen/heard/both/Merlin
- Species detail now offers four direct registration buttons.
- Every button opens the SAME complete sighting form, with the bird preselected.
- Method presets: seen, heard, both, or heard+Merlin suggestion. Merlin defaults to Possible until independently verified.
- Quick action creates an observation with separate date/location/media, not an unsupported species-level seen assertion.
- The old seen check is retained for backward compatibility but distinct from actual sightings.

### 3. Editorial featured bird photographs
- 16 curated species across eight birding groups: songbirds, reed birds, waders, raptors, owls, gulls, herons and colorful guests.
- 60 seconds per slide, category selector and manual next/previous.
- Dutch and Latin names, general habitat/location guidance, photographer and source/license link.
- Pictures are third-party Creative Commons Wikimedia Commons references; NOT personal observations. Attribution and license per slide are visible, original source page linked. Display uses CSS crop/fit.
- The gallery only requests the visible image. On network/photo failure, it shows an elegant local CSS fallback; no stock image is fabricated.
- When the PWA is hidden/closed, it does NOT run timers (mobile OS constraint). A wall-clock index ensures that reopening shows the corresponding bird as if the timeline had progressed; this does not mean actual background processing.

### 4. Living Habitat by Golden Hour
- Implemented: silent, low-overhead, custom animated CSS nature card with subtle flying silhouettes, reeds and glow. Scroll/visibility and reduced-motion pause, manual pause control.
- No actual film/music created; Artlist credits remain untouched.
- Alternative later: A 6-10 second licensed Artlist wildlife loop, muted and poster-backed; higher visual impact but increased size/battery needs.
- Alternative: user-owned bird clips from sightings; fully personal, but quality/format/permissions differ.
- Product suggestion: start with CSS motion for reliable offline performance; selectively add one real silent film only after real-device performance check.

## QA and release
- Playwright asserts mobile overflow, header/footer bounds at 320, 360, 390, 430 widths, all method controls; species -> Merlin prefilled observation -> saved record; curated categories, 60s clock progression and attribution; ambient pause.
- Existing Signature, Species, Journal, Film Studio, manual pin/Merlin and Explorer Map tests must remain PASS.
- External Commons photo resolution/network availability and real Android/iOS viewport remain to be verified on device.
- Release: separate PR, NO MERGE without owner approval.
