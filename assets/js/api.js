/**
 * ============================================================================
 *  api.js - thin wrapper around window.fetch for every API call
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  WHY THIS FILE EXISTS
 *  --------------------
 *  Every page needs the same three things when it talks to the server:
 *     1. build the URL with query-string parameters
 *     2. survive network failures / slow responses (AbortController)
 *     3. normalise the server's { success, data, error } envelope
 *  Putting that in one module keeps the page scripts focused on the DOM.
 *
 *  All functions return Promises, which is what the unit requires
 *  (Modules 1-4: Promises, not callbacks, not AngularJS).
 * ============================================================================
 */

'use strict';

const ApiClient = (() => {

    /**
     * Builds a URL such as  http://localhost:3000/api/events/search?q=run
     * Null / empty values are dropped so the server sees a clean query string.
     */
    function buildUrl(path, params = {}) {
        const url = new URL(APP_CONFIG.apiBaseUrl.replace(/\/$/, '') + '/' + String(path).replace(/^\//, ''));
        Object.keys(params).forEach((key) => {
            const value = params[key];
            if (value === null || value === undefined || value === '') return;
            if (Array.isArray(value)) {
                value.forEach((v) => url.searchParams.append(key, v));
            } else {
                url.searchParams.append(key, value);
            }
        });
        return url.toString();
    }

    /**
     * Performs the HTTP GET and returns the parsed JSON body.
     *
     * @param {string} path   e.g. 'events/search'
     * @param {Object} params query-string parameters
     * @returns {Promise<Object>} the full envelope { success, count, data }
     * @throws {Error} with a human readable message when anything goes wrong
     */
    function get(path, params = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), APP_CONFIG.requestTimeout);

        return fetch(buildUrl(path, params), {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal
        })
            .then((response) => {
                clearTimeout(timer);
                return response.json().catch(() => null).then((body) => {
                    if (!response.ok) {
                        const message = (body && body.error && body.error.message)
                            || `Server responded with status ${response.status}`;
                        throw new Error(message);
                    }
                    if (!body) throw new Error('The server returned an empty response.');
                    return body;
                });
            })
            .catch((error) => {
                clearTimeout(timer);
                if (error.name === 'AbortError') {
                    throw new Error(`The request timed out after ${APP_CONFIG.requestTimeout / 1000}s. Is the API running on ${APP_CONFIG.apiBaseUrl}?`);
                }
                if (error instanceof TypeError) {
                    throw new Error(`Cannot reach the API at ${APP_CONFIG.apiBaseUrl}. Start it with "npm start" inside the api folder.`);
                }
                throw error;
            });
    }

    /* --------------------------- endpoint helpers -------------------------- */

    return {
        get,

        /** GET /api/events  - home page feed */
        listEvents: (params) => get('events', params),

        /** GET /api/events/featured - hero carousel */
        featured: (limit = 3) => get('events/featured', { limit }),

        /** GET /api/events/search - search page */
        search: (params) => get('events/search', params),

        /** GET /api/events/:id - event details page */
        eventById: (id) => get(`events/${id}`),

        /** GET /api/donations/recent - supporter ticker */
        recentDonations: (limit = 12) => get('donations/recent', { limit }),

        /** GET /api/categories - filters + chips */
        categories: () => get('categories'),

        /** GET /api/organisations - charity profiles */
        organisations: () => get('organisations'),

        /** GET /api/stats - impact counters */
        stats: () => get('stats'),

        /** GET /api/health - used by the connection badge */
        health: () => get('health')
    };
})();
