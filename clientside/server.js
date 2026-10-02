/**
 * ============================================================================
 *  server.js - tiny ZERO-DEPENDENCY static file server for the client-side site
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  Why this file exists
 *  --------------------
 *  The client-side website is plain HTML/CSS/JS, so it needs nothing more than
 *  a web server that hands the files to the browser. Using Node's built-in
 *  `http` + `fs` modules means the client-side folder has NO npm dependencies
 *  at all - you can simply run:
 *
 *      node server.js          (or: npm start)
 *      open http://localhost:5500
 *
 *  A server (rather than opening index.html directly from the file system) is
 *  required because the Fetch API refuses file:// requests (CORS), so the API
 *  calls would fail.
 * ============================================================================
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.PORT) || 5500;
const ROOT = __dirname;

/** File extension -> Content-Type header. */
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.map': 'application/json'
};

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url);
    let pathname = decodeURIComponent(parsed.pathname);

    if (pathname === '/' || pathname === '') pathname = '/index.html';

    // Resolve inside ROOT only - blocks path traversal like ../../secret
    const filePath = path.join(ROOT, path.normalize(pathname).replace(/^([/\\])+/, ''));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Unknown path -> serve index.html so deep links keep working
            return fs.readFile(path.join(ROOT, 'index.html'), (e, data) => {
                if (e) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    return res.end('404 - page not found');
                }
                res.writeHead(200, { 'Content-Type': MIME['.html'] });
                res.end(data);
            });
        }

        const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': type,
            'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('  ============================================================');
    console.log('   PROG2002 A2 - Charity Events (client-side website)');
    console.log(`   serving  http://localhost:${PORT}`);
    console.log(`   remember : the API must also be running on port 3000`);
    console.log('  ============================================================');
    console.log('');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try:  PORT=5501 node server.js`);
    } else {
        console.error(err);
    }
    process.exit(1);
});
