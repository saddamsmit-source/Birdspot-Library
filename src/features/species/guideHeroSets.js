/** FOT-02 (24-11-2026) — optionele extra hoofdfoto's per soort.
 *
 * Een soort toont standaard één hoofdfoto. Hier kan per soort een korte, bewust gekozen reeks
 * staan (maximaal drie inclusief de huidige hoofdfoto), uitsluitend met beeldpaden die al als
 * gidsfoto van dezelfde soort in field-guide-media.json staan, met maker en licentie.
 * guideHeroPhotos() in detailSections.js weigert alles daarbuiten, dubbele opnames en te lange reeksen.
 *
 * Bewust leeg: extra hoofdfoto's worden alleen na een eigenaarbesluit per soort ingevuld.
 * Geen nieuwe of ongeverifieerde afbeeldingen via deze lijst.
 *
 * Vorm: { sp019: ['/assets/species/plumage/sp019-female-ground.webp', ...] }
 */
export const GUIDE_HERO_SETS = {};
export const MAX_HERO_PHOTOS = 3;
