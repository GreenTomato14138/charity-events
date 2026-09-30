# Charity Events API — PROG2002 Assessment 2 (Part 1 + Part 2)

RESTful API layer for the *Charity Events* case study, built with **Node.js + Express + MySQL**.
Student: **Boyuan Liu (24832410)**.

```
Browser  ──fetch()──▶  Express API  ──SQL──▶  MySQL (charityevents_db)
                     (this folder)          (database/charityevents_db.sql)
```

## 1. Files

| File | Purpose |
| --- | --- |
| `event_db.js` | MySQL connection pool + `query()` / `queryOne()` / `testConnection()` helpers. All credentials come from `.env`. |
| `server.js` | Express application: middleware (helmet, CORS, morgan, rate limit), routes, 404 handler, central error handler, start-up. |
| `routes/eventRoutes.js` | All `/api` route definitions. |
| `controllers/eventsController.js` | Request handlers: validation, SQL, JSON envelope. |
| `database/charityevents_db.sql` | Complete export of `charityevents_db` (schema + view + seed data). |
| `.env.example` | Template for the environment file. |

## 2. Setup

```bash
# 1) dependencies
npm install

# 2) environment
cp .env.example .env          # then set DB_USER / DB_PASSWORD
#   DB_HOST=localhost   DB_PORT=3306   DB_USER=root
#   DB_PASSWORD=*****   DB_NAME=charityevents_db

# 3) database (MySQL Workbench: Server ▸ Data Import, or command line)
mysql -u root -p < database/charityevents_db.sql

# 4) run
npm start                     # http://localhost:3000
```

If your MySQL listens on a different port (e.g. 3307), change `DB_PORT` in `.env`.

## 3. Endpoints

| Method | Endpoint | Used by | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | – | status probe |
| GET | `/api/events` | Home page | `?scope=upcoming\|past\|all`, `?limit=1..50`, `?sort=date\|date-desc\|progress\|raised\|name` |
| GET | `/api/events/featured` | Home carousel | `?limit=3` |
| GET | `/api/events/search` | Search page | `?q=&category=&location=&from=&to=&free=&sort=` |
| GET | `/api/events/:id` | Detail page | returns event + recent donations + updates |
| GET | `/api/categories` | Filters & chips | includes upcoming event count |
| GET | `/api/organisations` | About / footer | includes event count |
| GET | `/api/donations/recent` | Home ticker | `?limit=12` |
| GET | `/api/stats` | Impact counters | headline totals |

Quick checks:

```bash
curl http://localhost:3000/api/health
curl "http://localhost:3000/api/events?scope=upcoming&limit=5"
curl "http://localhost:3000/api/events/search?category=fun-run&category=walk&sort=date"
curl http://localhost:3000/api/events/1
curl http://localhost:3000/api/stats
```

## 4. Response envelope

Success:

```json
{ "success": true, "count": 4, "filters": { "...": "..." }, "data": [ ... ] }
```

Failure:

```json
{ "success": false, "error": { "message": "Invalid 'from' date. Expected format YYYY-MM-DD." } }
```

Status codes: `200` ok (empty result is *not* an error) · `400` invalid input · `403` blocked by CORS ·
`404` unknown route / unknown or suspended event · `429` rate limited · `500` server error.

## 5. Notes on design

* **Only GET** endpoints are exposed; create/update/delete operations are out of scope for this stage of the project.
* Suspended events are filtered out in SQL (`status = 'active'` in every read), so a policy breach can
  never be published.
* `raised_amount` is aggregated from `donations`, never stored redundantly on `events`.
* The past / upcoming decision is made by the view `vw_event_list` using `CURDATE()`.
* Security: helmet headers, CORS whitelist, rate limiting, parameterised SQL only, secrets in `.env`.
