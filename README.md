# Charity Events Hub — PROG2002 Web Development II, Assessment 2

**Student:** Boyuan Liu (刘博源) · **Student ID:** 24832410
**Case study:** a dynamic website that lets the public discover, filter and read the full details
of charity events (fun runs, gala dinners, silent auctions, benefit concerts, community walks and
food festivals) hosted by charities on the Gold Coast.

Built with **MySQL 8 + Node.js/Express (REST API)** on the server and **HTML, CSS and vanilla
JavaScript (DOM, `fetch`, Promises)** on the client. No framework, no AngularJS.

---

## Repository layout

```
project/
  api/                     Part 1 + 2 — database connection and RESTful API
    event_db.js            MySQL connection pool (required file name)
    server.js              Express application entry point
    routes/eventRoutes.js  resource-based route definitions
    controllers/           request handlers + input validation
    database/charityevents_db.sql   full database export (schema + 14 sample events)
  clientside/              Part 3 — the website
    index.html             home page
    search.html            search / filter page
    event.html             event details page (?id=7)
    assets/css/style.css   design tokens, components, dark theme
    assets/js/             api.js (fetch wrapper), ui.js (DOM helpers), home/search/event.js
    server.js              zero-dependency static file server
documents/                 project report and demo video script (not part of the zip submission)
submissions/               the two zip packages required by the brief
start-project.bat          one-click launcher (starts both servers and opens the browser)
```

## How to run

```bash
# 1 — database: import project/api/database/charityevents_db.sql into MySQL
#     (or: mysql -u root -p < project/api/database/charityevents_db.sql)

# 2 — API
cd project/api && npm install && npm start      # http://localhost:3000

# 3 — website (second terminal, keep the first one running)
cd project/clientside && npm start              # http://localhost:5500
```

Or simply double-click `start-project.bat`.

Credentials live in `project/api/.env` (copy `.env.example` first). Only `.env.example` is
committed — real secrets are not.

## API endpoints (all GET — Assessment 2 is read-only)

| Endpoint | Used by |
| --- | --- |
| `/api/health` | connection probe / "API online" badge |
| `/api/events?scope=upcoming\|past\|all&limit=50&sort=date` | home page listing |
| `/api/events/featured?limit=3` | home page carousel |
| `/api/events/search?q=&category=&location=&from=&to=&free=&sort=` | search page |
| `/api/events/:id` | event details page |
| `/api/categories` | search filters + chips |
| `/api/organisations` | about / organiser cards |
| `/api/donations/recent?limit=12` | supporter ticker |
| `/api/stats` | impact counters |

Suspended events are excluded from every public endpoint (`/api/events/14` returns 404).

## Commit history

The repository is committed in the order the work was actually produced:

1. database schema + sample data
2. `event_db.js` connection pool
3. Express server and middleware
4. RESTful routes and controllers
5. home page
6. search page
7. event details page
8. documentation, report and launcher
