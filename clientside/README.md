# Charity Events — client-side website — PROG2002 Assessment 2 (Part 3)

Pure **HTML + CSS + vanilla JavaScript** (DOM, `fetch`, Promises). No framework, no AngularJS,
no build step. Student: **Boyuan Liu (24832410)**.

## 1. Run it

```bash
npm start          # zero dependencies — http://localhost:5500
#   or:  node server.js        (PORT=5501 node server.js if 5500 is busy)
```

> The website reads its data from the API, so **start `project/api` first** (`npm start` → port 3000).
> The API base URL is set in `assets/js/config.js` (or override in the browser console with
> `localStorage.setItem('apiBaseUrl','http://localhost:3000/api')`).

## 2. Pages

| Page | File | Data source | Highlights |
| --- | --- | --- | --- |
| Home | `index.html` | `/api/stats`, `/api/events/featured`, `/api/categories`, `/api/events`, `/api/donations/recent` | animated counters, featured carousel, category chips, upcoming / past / all switch, supporter ticker, impact band |
| Search | `search.html` | `/api/categories`, `/api/events/search` | keyword + date range + location + multi-select categories + sort + free-only, **Clear Filters**, inline validation, debounced live search, empty state |
| Event details | `event.html?id=7` | `/api/events/:id`, `/api/events/search` | gradient hero, live countdown, animated SVG progress ring, ticket panel, organiser card, updates timeline, recent supporters, related events, **Register → "This feature is currently under construction."** |

## 3. Files

```
index.html  search.html  event.html
assets/css/style.css          design tokens, dark theme, all components
assets/img/*.jpg              one real photograph per event, + favicon.svg
assets/js/config.js           API base URL + organisation details
assets/js/icons.js            hand-built SVG icon set (6 category emblems + interface icons + brand mark)
assets/js/api.js              fetch wrapper (Promises, timeout, error normalising)
assets/js/ui.js               shared DOM helpers: cards, toasts, modal, countdown, reveal, theme
assets/js/home.js             home page behaviour
assets/js/search.js           search page behaviour (validation + filtering)
assets/js/event.js            detail page behaviour
server.js                     zero-dependency static file server
```

## 4. Interaction with the API (data flow)

1. A page script calls e.g. `ApiClient.search({ category: ['fun-run'], sort: 'date' })`.
2. `api.js` builds the URL and issues `fetch()` with an `AbortController` timeout.
3. The Express API queries MySQL and answers with `{ success, count, data }`.
4. The Promise resolves and `UI.createEventCard()` turns each object into DOM nodes.
5. Cards are appended to the grid; progress bars animate on scroll and countdowns tick every second.
6. Any failure shows a toast plus a retry panel instead of a blank page.

## 5. Features beyond the minimum

Live countdown timers · skeleton loading cards · scroll-reveal animations · animated counters ·
category colour system generated from the database · light / dark theme (persisted) ·
shareable search URLs · "API online/offline" badge in the navigation · responsive layout down to
360 px · `prefers-reduced-motion` support.
