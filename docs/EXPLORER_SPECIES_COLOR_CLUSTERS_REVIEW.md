# Birdspot Explorer Map — Species and Color Clusters (REVIEW)

## Behavior and automatic pinning
Newly saved observations automatically appear on the map only if the record has valid latitude and longitude from GPS or explicit map pin. A place name alone is NOT geocoded or guessed. Existing unpinned observations remain listed.

## Visual map
- Search by recorded bird species (e.g., Koolmees). A partial name filters pins immediately.
- Filter species and evidence simultaneously.
- Seen: mint green (#2EBE96), eye glyph.
- Heard through Merlin Sound ID: violet (#A784E9), musical note.
- Seen and heard: amber (#DCAF63), combined glyph, even if Merlin is also noted.
- Heard without Merlin: blue (#57A9D5), note.
- Missing/legacy method: grey (#88939B), question mark; never counted as seen by assumption.
- Every marker represents an individual saved observation; distinct observations retain their original ID, coordinate, photo/video and metadata.
- Zoomed out: geographically nearby markers form clusters showing total count and proportional colored ring sections. Species and evidence filters affect both count and sections.
- Zoomed in: clustering radius reduces; individual colored markers appear, and overlapping same-coordinate sightings can spiderfy.
- Existing map details show the observation and identification information.

## Architecture and safety
- Pure classification/filter/gradient functions in src/features/map/visualization.js.
- No changes to observation storage schema, backups, photos, videos or Film Studio.
- No third-party geocoding, tracking or automatically invented pin locations.
- Color is accompanied by symbols/text to avoid color-only meaning.
- Offline tile availability is unchanged; offline manual coordinates remain possible.

## QA and evidence boundaries
- Playwright checks species+evidence filters, proportional cluster icon composition, zoom-split and mobile widths against synthetic local records, with deterministic Leaflet/MarkerCluster API stub.
- A simulated map API is not evidence of actual Leaflet CDN tile loading or physical device behavior.
- Regressions from previous phases and Merlin manual pins must pass before release.
- Large datasets, real phone visual acceptance, and exact-location privacy controls remain open.
- Leave PR open until explicit Project Owner merge approval.
