/**
 * ============================================================================
 *  icons.js - the hand-built icon set for the Guangxi Charity Events site
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  Why this file exists
 *  --------------------
 *  The site used to fall back on operating-system emoji for every icon, which
 *  looks different on every machine and never matches the brand. This file
 *  replaces them with one coherent set drawn from scratch as inline SVG:
 *
 *    - six category emblems  (fun run, gala dinner, silent auction,
 *      benefit concert, community walk, food festival)
 *    - the site emblem       (a heart whose lower half is a breaking wave,
 *      with a gold spark - the "karst and river" idea)
 *    - small interface icons (calendar, place, charity, supporters, ticket,
 *      search, sun, moon, menu, compass, alert, connection, mail, folder)
 *
 *  Design language - one family, so nothing looks borrowed:
 *    - 24 x 24 grid, 1.8 stroke, round caps and joins
 *    - every glyph carries a small wave or arc motif (the coastal idea)
 *    - icons inherit `currentColor`, so each category picks up its own colour
 *
 *  Everything is plain JavaScript string building - no framework, no sprite
 *  file, no external request.
 * ============================================================================
 */

'use strict';

const Icons = (() => {

    /** Shared wrapper: one viewBox, one stroke style, currentColor. */
    function svg(body, cls = 'ico') {
        return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
               `stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    }

    /** A filled part (heads, dots) inside an otherwise stroked icon. */
    const solid = (d) => `<path d="${d}" fill="currentColor" stroke="none"/>`;

    /* ===================== the six category emblems ======================= */

    const CATEGORY = {

        /* A runner mid-stride with speed lines, finished with a small wave. */
        'fun-run': svg(
            `<path d="M14.7 8.3 L12.2 11.7"/>` +
            `<path d="M12.2 11.7 L15.0 13.7 L13.3 19.2"/>` +
            `<path d="M12.2 11.7 L8.3 14.0"/>` +
            `<path d="M14.7 8.3 L18.1 9.7 L19.7 7.0"/>` +
            `<path d="M15.0 13.7 L18.4 17.0"/>` +
            `<path d="M4.4 9.3 H7.6"/><path d="M3.4 12.7 H6.6"/>` +
            solid('M15.9 6.9 m-2.5 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0')
        ),

        /* A goblet with a spark: the gala dinner table. */
        'gala-dinner': svg(
            `<path d="M7.9 3.3 h8.2 v3.9 a4.1 4.1 0 0 1 -8.2 0 z"/>` +
            `<path d="M12 11.3 V17.6"/>` +
            `<path d="M7.8 20.7 a4.2 4.2 0 0 1 8.4 0"/>` +
            solid('M18.3 2.9 l1.3 1.3 -1.3 1.3 -1.3 -1.3 z') +
            `<path d="M4.6 17.9 a2.2 2.2 0 0 0 3.1 0"/>`
        ),

        /* An auctioneer's gavel resting on the block, with a lot tag. */
        'auction': svg(
            `<rect x="9.2" y="2.7" width="9.4" height="5.4" rx="1.5" transform="rotate(45 13.9 5.4)"/>` +
            `<path d="M10.3 9.3 L4.1 15.5"/>` +
            `<path d="M5.9 19.6 h12.2"/>` +
            `<path d="M18.2 12.4 v3.4 a1.6 1.6 0 0 1 -1.6 1.6 h-1.2"/>` +
            `<circle cx="15.4" cy="14.1" r="0.9" fill="currentColor" stroke="none"/>`
        ),

        /* A stage equaliser: sound travelling out over a wave. */
        'concert': svg(
            `<path d="M4.3 10.2 v3.6"/>` +
            `<path d="M8.3 7.1 v9.8"/>` +
            `<path d="M12.3 4.2 v15.6"/>` +
            `<path d="M16.3 8.4 v7.2"/>` +
            `<path d="M20.3 11.0 v2.0"/>` +
            `<path d="M3.4 18.6 a2.6 2.6 0 0 0 3.6 0 a2.6 2.6 0 0 0 3.6 0" opacity=".55"/>` +
            `<path d="M13.4 18.6 a2.6 2.6 0 0 0 3.6 0 a2.6 2.6 0 0 0 3.6 0" opacity=".55"/>`
        ),

        /* Two walkers on a shared path - a community, not a single athlete. */
        'walk': svg(
            `<path d="M8.4 7.7 v4.9"/>` +
            `<path d="M8.4 12.6 L6.5 18.9"/><path d="M8.4 12.6 L10.9 18.9"/>` +
            `<path d="M8.4 9.6 L5.9 11.7"/>` +
            solid('M8.4 5.1 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0') +
            `<path d="M16.0 9.1 v4.2"/>` +
            `<path d="M16.0 13.3 L14.4 18.9"/><path d="M16.0 13.3 L18.2 18.9"/>` +
            `<path d="M16.0 10.8 L18.5 12.7"/>` +
            solid('M16.0 6.7 m-1.7 0 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0') +
            `<path d="M6.2 20.9 h11.6" opacity=".5"/>`
        ),

        /* A market marquee with a pennant and a serving hatch. */
        'festival': svg(
            `<path d="M3.3 9.9 L5.4 4.3 h13.2 l2.1 5.6"/>` +
            `<path d="M3.3 9.9 a2.2 2.2 0 0 0 4.4 0 a2.2 2.2 0 0 0 4.4 0 a2.2 2.2 0 0 0 4.4 0 a2.2 2.2 0 0 0 4.4 0"/>` +
            `<path d="M5.1 11.4 V19.7 h13.8 V11.4"/>` +
            `<path d="M9.5 19.7 v-4.5 h5 v4.5"/>` +
            `<path d="M17.4 4.3 V1.9 l2.1.9 -2.1.9" fill="currentColor" stroke="none"/>`
        ),

        /* A heart cradled in two open hands, above a small wave. */
        'volunteer': svg(
            `<path d="M12 11.4C9.9 9.7 8.4 8.3 8.4 6.7A2.3 2.3 0 0 1 12 5.1a2.3 2.3 0 0 1 3.6 1.6c0 1.6-1.5 3-3.6 4.7Z" fill="currentColor" stroke="none"/>` +
            `<path d="M4.2 13.6 v3.6 a3.4 3.4 0 0 0 3.4 3.4 h8.8 a3.4 3.4 0 0 0 3.4 -3.4 v-3.6"/>` +
            `<path d="M6.6 20.6 a2.6 2.6 0 0 0 3.6 0 a2.6 2.6 0 0 0 3.6 0 a2.6 2.6 0 0 0 3.6 0" opacity=".5"/>`
        ),

        /* A market awning over a woven basket with a handle. */
        'market': svg(
            `<path d="M3.4 8.6 L4.8 4.4 h14.4 l1.4 4.2"/>` +
            `<path d="M3.4 8.6 a2.1 2.1 0 0 0 4.2 0 a2.1 2.1 0 0 0 4.2 0 a2.1 2.1 0 0 0 4.2 0 a2.1 2.1 0 0 0 4.2 0"/>` +
            `<path d="M6.4 12.2 h11.2 l-1.1 7.4 a1.7 1.7 0 0 1 -1.7 1.5 h-5.6 a1.7 1.7 0 0 1 -1.7 -1.5 z"/>` +
            `<path d="M9.4 12.2 a2.6 2.6 0 0 1 5.2 0"/>` +
            `<path d="M8.6 15.4 h6.8" opacity=".5"/>`
        )
    };

    /* ======================= interface mini icons ========================= */

    const UI = {
        calendar: svg(
            `<rect x="3.4" y="5.2" width="17.2" height="15.4" rx="2.4"/>` +
            `<path d="M3.4 10.0 h17.2"/>` +
            `<path d="M8.1 3.3 v3.4"/><path d="M15.9 3.3 v3.4"/>` +
            `<circle cx="9.1" cy="14.4" r="1.1" fill="currentColor" stroke="none"/>`
        ),
        pin: svg(
            `<path d="M12 21.2 c4.3 -4.9 6.6 -8.2 6.6 -11.1 A6.6 6.6 0 0 0 5.4 10.1 c0 2.9 2.3 6.2 6.6 11.1 z"/>` +
            `<circle cx="12" cy="10.0" r="2.5"/>`
        ),
        charity: svg(
            `<path d="M3.4 20.6 h17.2"/>` +
            `<path d="M5.4 20.6 V10.4 l6.6 -4.8 6.6 4.8 v10.2"/>` +
            `<path d="M9.8 20.6 v-5.4 h4.4 v5.4"/>` +
            `<path d="M12 9.2 v2.6 M10.7 10.5 h2.6" opacity=".6"/>`
        ),
        users: svg(
            `<path d="M2.9 19.8 a5.2 5.2 0 0 1 10.4 0"/>` +
            solid('M8.1 7.2 m-3.2 0 a3.2 3.2 0 1 0 6.4 0 a3.2 3.2 0 1 0 -6.4 0') +
            `<path d="M16.4 19.8 a4.4 4.4 0 0 1 4.7 -4.4"/>` +
            `<path d="M15.6 4.2 a3.0 3.0 0 0 1 0 5.8"/>`
        ),
        ticket: svg(
            `<path d="M3.2 8.2 a2 2 0 0 1 2 -2 h13.6 a2 2 0 0 1 2 2 v2.1 a2.1 2.1 0 0 0 0 3.6 v2.1 a2 2 0 0 1 -2 2 H5.2 a2 2 0 0 1 -2 -2 v-2.1 a2.1 2.1 0 0 0 0 -3.6 z"/>` +
            `<path d="M13.6 6.6 v10.8" stroke-dasharray="2.2 2.2"/>`
        ),
        search: svg(
            `<circle cx="10.6" cy="10.6" r="6.4"/>` +
            `<path d="M15.4 15.4 L20.4 20.4"/>` +
            `<path d="M8.2 10.6 a2.4 2.4 0 0 1 2.4 -2.4" opacity=".55"/>`
        ),
        sun: svg(
            `<circle cx="12" cy="12" r="4.4"/>` +
            `<path d="M12 2.6 v2.4"/><path d="M12 19.0 v2.4"/>` +
            `<path d="M2.6 12 h2.4"/><path d="M19.0 12 h2.4"/>` +
            `<path d="M5.4 5.4 l1.7 1.7"/><path d="M16.9 16.9 l1.7 1.7"/>` +
            `<path d="M18.6 5.4 l-1.7 1.7"/><path d="M7.1 16.9 l-1.7 1.7"/>`
        ),
        moon: svg(
            `<path d="M20.2 14.6 A8.6 8.6 0 0 1 9.4 3.8 a8.6 8.6 0 1 0 10.8 10.8 z"/>` +
            `<path d="M16.4 5.6 l.7 1.7 1.7.7 -1.7.7 -.7 1.7 -.7 -1.7 -1.7 -.7 1.7 -.7 z" fill="currentColor" stroke="none" opacity=".7"/>`
        ),
        menu: svg(
            `<path d="M4.2 7.4 h15.6"/><path d="M4.2 12 h11.2"/><path d="M4.2 16.6 h15.6"/>`
        ),
        compass: svg(
            `<circle cx="12" cy="12" r="8.6"/>` +
            `<path d="M15.4 8.6 l-2.1 4.7 -4.7 2.1 2.1 -4.7 z" fill="currentColor" stroke="none" opacity=".85"/>`
        ),
        alert: svg(
            `<path d="M12 3.6 L21.2 19.6 H2.8 z"/>` +
            `<path d="M12 9.4 v4.4"/>` +
            `<circle cx="12" cy="16.6" r="1.0" fill="currentColor" stroke="none"/>`
        ),
        plug: svg(
            `<path d="M9.2 3.4 v4.4"/><path d="M14.8 3.4 v4.4"/>` +
            `<path d="M6.6 7.8 h10.8 v3.0 a5.4 5.4 0 0 1 -10.8 0 z"/>` +
            `<path d="M12 16.2 v4.4"/>`
        ),
        mail: svg(
            `<rect x="2.9" y="5.0" width="18.2" height="14.0" rx="2.4"/>` +
            `<path d="M3.6 6.8 L12 12.6 L20.4 6.8"/>` +
            solid('M18.4 4.0 l1.1 1.1 -1.1 1.1 -1.1 -1.1 z')
        ),
        phone: svg(
            `<path d="M7.2 3.6 h3.1 l1.4 3.6 -1.9 1.4 a10.4 10.4 0 0 0 4.6 4.6 l1.4 -1.9 3.6 1.4 v3.1 a1.8 1.8 0 0 1 -2.0 1.8 A14.6 14.6 0 0 1 5.4 5.6 1.8 1.8 0 0 1 7.2 3.6 z"/>`
        ),
        link: svg(
            `<path d="M10.2 13.8 a3.6 3.6 0 0 0 5.1 0 l3.2 -3.2 a3.6 3.6 0 0 0 -5.1 -5.1 l-1.4 1.4"/>` +
            `<path d="M13.8 10.2 a3.6 3.6 0 0 0 -5.1 0 l-3.2 3.2 a3.6 3.6 0 0 0 5.1 5.1 l1.4 -1.4"/>`
        ),
        spark: svg(
            `<path d="M12 3.2 l1.9 5.3 5.3 1.9 -5.3 1.9 -1.9 5.3 -1.9 -5.3 -5.3 -1.9 5.3 -1.9 z" fill="currentColor" stroke="none"/>` +
            `<path d="M18.6 16.4 l.8 2.1 2.1.8 -2.1.8 -.8 2.1 -.8 -2.1 -2.1 -.8 2.1 -.8 z" fill="currentColor" stroke="none" opacity=".6"/>`
        ),
        folder: svg(
            `<path d="M3.2 7.0 a2 2 0 0 1 2 -2 h3.6 l2.1 2.4 h7.9 a2 2 0 0 1 2 2 v8.6 a2 2 0 0 1 -2 2 H5.2 a2 2 0 0 1 -2 -2 z"/>` +
            `<path d="M3.2 11.0 h17.6" opacity=".55"/>`
        ),
        broom: svg(
            `<path d="M13.4 3.4 L20.6 10.6"/>` +
            `<path d="M11.4 5.4 l7.2 7.2"/>` +
            `<path d="M10.4 12.4 l-6.9 6.9 1.2 1.2 6.9 -6.9 z" fill="currentColor" stroke="none" opacity=".85"/>` +
            `<path d="M3.5 19.3 l1.2 1.2"/>`
        ),
        news: svg(
            `<path d="M4.7 5.2 h10.6 a1.9 1.9 0 0 1 1.9 1.9 v10.4 a2.1 2.1 0 0 0 2.1 2.1 H6.8 a2.1 2.1 0 0 1 -2.1 -2.1 z"/>` +
            `<path d="M7.0 8.6 h7.2"/><path d="M7.0 11.7 h7.2"/><path d="M7.0 14.8 h4.4"/>` +
            `<path d="M17.2 8.4 h2.0 v9.1 a2.1 2.1 0 0 1 -2.1 2.1" opacity=".55"/>`
        )
    };

    /* ========================= the site emblem ============================ */

    /**
     * The brand mark: a heart whose lower half is a breaking wave, with a gold
     * spark at the crest. Used in the navigation bar and as the favicon.
     */
    function brand(size = 28) {
        return `<svg class="brand-svg" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">` +
            `<path d="M24 41.5C12.2 33.4 5.6 25.6 6.1 18.6 6.6 12.1 12.7 8.3 18.3 10.4 21.2 11.5 23.2 13.4 24 15.2 24.8 13.4 26.8 11.5 29.7 10.4 35.3 8.3 41.4 12.1 41.9 18.6 42.4 25.6 35.8 33.4 24 41.5Z" ` +
            `fill="url(#brandGrad)"/>` +
            `<defs><linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">` +
            `<stop offset="0%" stop-color="#FF7A85"/><stop offset="100%" stop-color="#D62839"/>` +
            `</linearGradient></defs>` +
            `<path d="M9.4 26.4c3.4 2.6 6.8 2.6 10.2 0 3.4-2.6 6.8-2.6 10.2 0 3.4 2.6 6.8 2.6 10.2 0" ` +
            `fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" opacity=".92"/>` +
            `<circle cx="36.6" cy="13.6" r="3.4" fill="#FFC94D"/>` +
            `</svg>`;
    }

    /** Same emblem as a data URI, for <link rel="icon">. */
    const FAVICON = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
        '<path d="M24 41.5C12.2 33.4 5.6 25.6 6.1 18.6 6.6 12.1 12.7 8.3 18.3 10.4 21.2 11.5 23.2 13.4 24 15.2 24.8 13.4 26.8 11.5 29.7 10.4 35.3 8.3 41.4 12.1 41.9 18.6 42.4 25.6 35.8 33.4 24 41.5Z" fill="#E03B4C"/>' +
        '<path d="M9.4 26.4c3.4 2.6 6.8 2.6 10.2 0 3.4-2.6 6.8-2.6 10.2 0 3.4 2.6 6.8 2.6 10.2 0" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/>' +
        '<circle cx="36.6" cy="13.6" r="3.6" fill="#FFC94D"/></svg>'
    );

    /* ============================ public API ============================== */

    /** Category emblem for a slug; falls back to the spark. */
    function category(slug) {
        return CATEGORY[slug] || UI.spark;
    }

    /** Mini interface icon by name; falls back to the spark. */
    function ui(name) {
        return UI[name] || UI.spark;
    }

    return { category, ui, brand, FAVICON, list: () => Object.keys(CATEGORY) };
})();
