/**
 * ============================================================================
 *  eventRoutes.js - RESTful route definitions for the charity events API
 *  PROG2002 (Web Development II) - Assessment 2
 *  Student : Boyuan Liu (24832410)
 *
 *  All routes are mounted under /api by server.js.
 *  Route ordering matters: the literal paths (/api/events/featured,
 *  /api/events/search) must be declared BEFORE the parameterised
 *  /api/events/:id, otherwise "featured" would be parsed as an id.
 * ============================================================================
 */

'use strict';

const express = require('express');
const controller = require('../controllers/eventsController');

const router = express.Router();

/* ---------------------------- events collection ---------------------------- */

// GET /api/events?scope=upcoming|past|all&limit=50&sort=date
router.get('/events', controller.listEvents);

// GET /api/events/featured?limit=3
router.get('/events/featured', controller.listFeatured);

// GET /api/events/search?q=&category=&location=&from=&to=&free=&sort=
router.get('/events/search', controller.searchEvents);

// GET /api/events/:id
router.get('/events/:id', controller.getEventById);

/* --------------------------- supporting resources -------------------------- */

// GET /api/donations/recent?limit=12 - supporter ticker on the home page
router.get('/donations/recent', controller.listRecentDonations);

// GET /api/categories  - populates the search page category filter
router.get('/categories', controller.listCategories);

// GET /api/organisations - the charities behind the events
router.get('/organisations', controller.listOrganisations);

// GET /api/stats - headline impact figures
router.get('/stats', controller.getStats);

module.exports = router;
