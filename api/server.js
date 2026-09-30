/**
 * ============================================================================
 *  server.js - Express application entry point for the Charity Events API
 *  PROG2002 (Web Development II) - Assessment 2
 *  Student : Boyuan Liu (24832410)
 *
 *  Run with:   npm start       (production-ish)
 *              npm run dev     (auto-restart on file change, needs nodemon)
 *
 *  Base URL:   http://localhost:3000/api
 * ============================================================================
 */

'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./event_db');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

/* -------------------------------------------------------------------------- */
/*  Middleware (applied, in order, to every request)                           */
/* -------------------------------------------------------------------------- */

// 1. Security headers (XSS protection, MIME sniffing, frame options, ...).
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS - in Assessment 2 the client-side site is served from a different
//    origin (http://localhost:5500), so cross-origin reads must be allowed.
//    The allowed origin list is configurable through ALLOWED_ORIGINS in .env so
//    the API is not wide open once it is deployed.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500,http://localhost:8080,http://127.0.0.1:8080,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Requests with no Origin header (Postman, curl, server-to-server) are allowed.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ['GET', 'OPTIONS'],   // Assessment 2 only exposes read endpoints
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Request logging (short, coloured, development friendly).
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 4. Body parsers - included so the POST endpoints added in Assessment 3 work
//    without touching this file again.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 5. Basic abuse protection: one IP may not hammer the API.
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 300,                   // limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many requests from this IP, please try again later.' } }
}));

/* -------------------------------------------------------------------------- */
/*  Routes                                                                     */
/* -------------------------------------------------------------------------- */

// Simple health probe - useful for Postman and for the client's status badge.
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Charity Events API is running',
        version: '1.0.0',
        time: new Date().toISOString()
    });
});

// Everything else lives in routes/eventRoutes.js
app.use('/api', eventRoutes);

// Root route: a tiny self-documenting index so anyone opening
// http://localhost:3000 in a browser sees what the API offers.
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'PROG2002 A2 - Charity Events API',
        endpoints: [
            'GET /api/health',
            'GET /api/events?scope=upcoming|past|all&limit=50&sort=date|date-desc|progress|raised|name',
            'GET /api/events/featured?limit=3',
            'GET /api/events/search?q=&category=&location=&from=&to=&free=&sort=',
            'GET /api/events/:id',
            'GET /api/categories',
            'GET /api/organisations',
            'GET /api/stats'
        ]
    });
});

/* -------------------------------------------------------------------------- */
/*  404 + centralised error handling                                           */
/* -------------------------------------------------------------------------- */

// Unknown route -> JSON 404 (never an HTML page, this is an API).
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: { message: `Endpoint not found: ${req.method} ${req.originalUrl}` }
    });
});

// Any error passed to next() (or thrown inside an async handler) lands here.
// The stack trace is only exposed while developing.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    const isCorsError = err && /not allowed by CORS/.test(err.message);

    if (!isCorsError) {
        console.error('[server] Unhandled error:', err);
    }

    res.status(isCorsError ? 403 : 500).json({
        success: false,
        error: {
            message: isCorsError
                ? err.message
                : (process.env.NODE_ENV === 'production'
                    ? 'An internal server error occurred.'
                    : err.message)
        }
    });
});

/* -------------------------------------------------------------------------- */
/*  Start-up                                                                   */
/* -------------------------------------------------------------------------- */

async function start() {
    const connected = await db.testConnection();
    if (!connected) {
        console.error('[server] Exiting: could not reach the MySQL database.');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log('');
        console.log('  ============================================================');
        console.log('   PROG2002 A2 - Charity Events API');
        console.log(`   listening on http://localhost:${PORT}`);
        console.log(`   try:  http://localhost:${PORT}/api/events`);
        console.log('  ============================================================');
        console.log('');
    });
}

// Release the pool when the process is stopped with Ctrl+C.
process.on('SIGINT', async () => {
    console.log('\n[server] SIGINT received - closing database pool...');
    await db.closePool();
    process.exit(0);
});

start();

module.exports = app;
