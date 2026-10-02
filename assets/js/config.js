/**
 * ============================================================================
 *  config.js - single place where the client-side site is configured
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  The website is a pure client-side application: it never touches MySQL
 *  directly, it only reads the RESTful API built in Part 2. If the API runs on
 *  another machine or port, change `apiBaseUrl` here (or set it in the browser
 *  console with: localStorage.setItem('apiBaseUrl','http://host:port/api')).
 * ============================================================================
 */

'use strict';

/**
 * Where is the API?
 *  - Default: the API running on this machine, port 3000.
 *  - If the page is opened from ANOTHER computer (e.g. http://172.24.133.176:5500),
 *    "localhost" would mean that other computer, so we automatically talk to the
 *    same host that served the page, on port 3000.
 *  - Anything can still be forced from the browser console:
 *        localStorage.setItem('apiBaseUrl','http://192.168.1.20:3000/api')
 */
function resolveApiBaseUrl() {
    const override = localStorage.getItem('apiBaseUrl');
    if (override) return override;

    const host = (location && location.hostname) ? location.hostname : 'localhost';
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
        return 'http://localhost:3000/api';
    }
    return `http://${host}:3000/api`;
}

const APP_CONFIG = {
    // Base URL of the Express API (see ../api/server.js)
    apiBaseUrl: resolveApiBaseUrl(),

    // Abort a request if the server does not answer within this many ms
    requestTimeout: 15000,

    // How often the live countdown labels refresh (milliseconds)
    countdownTick: 1000,

    // Site-wide branding strings (static content, hard-coded on purpose)
    org: {
        name: 'Guangxi Charity Events',
        tagline: 'Together we keep the mountains green and our neighbours cared for',
        email: 'events@guangxicharity.org.cn',
        phone: '+86 771 5588 200',
        address: 'Room 1206, 18 Minzu Avenue, Qingxiu District, Nanning, Guangxi 530028',
        abn: 'Registration no. 51450100MJY1234567'
    }
};
