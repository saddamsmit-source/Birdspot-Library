# Birdspot — Signature Edition / Fase 1 REVIEW

## Scope
- Visual system: premium forest, champagne and teal, responsive motion.
- Home: cinematic photo slideshow using only personal photo data, atmospheric CSS fallback and four new shortcuts.
- Map: Explorer UI around existing Leaflet markers. No artificial GPS points.
- Media Studio: real local IndexedDB photo/video gallery, filters and image viewer. Film rendering/export is NOT included.
- Journal: timeline and milestones calculated from existing sightings, no duplicated datastore.
- Existing five-item navigation, observation entry, backups and schema remain unchanged.
- Service worker precaches new files, version bumped.

## Verification
- New Playwright test tests routes, empty states, 360/390/430 viewports, journal from real localStorage and preserved IDs.
- GitHub Actions workflow runs on the PR and uploads screenshots.
- Runtime outcomes remain NOT TESTED until CI provides evidence.
- Real-device performance, dark mode, offline and actual photo-heavy testing remain open.
- No merge/live deployment without explicit Project Owner approval.

## Follow-up
Develop more detailed species/media experiences, photo-led hotspot cards with privacy controls,
journal milestones and optional video export after feasibility tests.
