/**
 * ============================================================================
 *  ui.js - shared DOM helpers used by all three pages
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  Contains: formatting helpers, the reusable event card renderer, the toast
 *  and modal system, the live countdown ticker, the scroll-reveal observer,
 *  the theme switch and the navigation behaviour (hamburger + active state).
 *
 *  Everything here is vanilla JavaScript + DOM manipulation - no framework.
 * ============================================================================
 */

'use strict';

const UI = (() => {

    /* ======================== tiny DOM shortcuts ========================== */
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    /* ========================== formatting ================================= */

    /** Escapes text before it is injected with innerHTML (XSS safety). */
    function escapeHtml(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** 105490 -> "$105,490" */
    function money(value) {
        const n = Number(value || 0);
        return '$' + n.toLocaleString('en-AU', { maximumFractionDigits: 0 });
    }

    /** "2026-10-11 06:00:00" -> a real Date (manual parse = safe in all browsers) */
    function parseDate(value) {
        if (!value) return null;
        const [d, t = '00:00:00'] = String(value).split(' ');
        const [y, m, day] = d.split('-').map(Number);
        const [hh, mm, ss] = t.split(':').map(Number);
        return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, ss || 0);
    }

    /** -> "Sun 11 Oct 2026" */
    function dateLabel(value) {
        const date = parseDate(value);
        if (!date) return 'TBC';
        return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    /** -> "11 Oct 2026, 6:00 am" */
    function dateTimeLabel(value) {
        const date = parseDate(value);
        if (!date) return 'TBC';
        return date.toLocaleString('en-AU', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    }

    /** -> "6:00 am – 11:00 am" (empty string when there is no end time) */
    function timeRange(start, end) {
        const fmt = (v) => {
            const d = parseDate(v);
            return d ? d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
        };
        const a = fmt(start);
        const b = end ? fmt(end) : '';
        return b ? `${a} – ${b}` : a;
    }

    /* ============================ colour =================================== */

    /** '#FF5F6D' -> { h, s, l } so we can build a matching gradient. */
    function hexToHsl(hex) {
        let clean = String(hex || '#6366F1').replace('#', '');
        if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
        const r = parseInt(clean.slice(0, 2), 16) / 255;
        const g = parseInt(clean.slice(2, 4), 16) / 255;
        const b = parseInt(clean.slice(4, 6), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        const delta = max - min;
        if (delta !== 0) {
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
            if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0));
            else if (max === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;
            h *= 60;
        }
        return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    /**
     * Builds the two-stop gradient used on banners, progress bars and the
     * details hero. The second stop is the category colour rotated 32° and
     * darkened, which gives every category its own recognisable look.
     */
    function gradientFor(hex) {
        const { h, s, l } = hexToHsl(hex);
        const h2 = (h + 32) % 360;
        return `linear-gradient(135deg, hsl(${h} ${Math.min(s + 8, 96)}% ${Math.min(l + 6, 72)}%) 0%, hsl(${h2} ${s}% ${Math.max(l - 14, 26)}%) 100%)`;
    }

    /** Stable pastel avatar colour derived from a donor's name. */
    function avatarColour(name = '') {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        const h = Math.abs(hash) % 360;
        return `linear-gradient(135deg, hsl(${h} 78% 58%), hsl(${(h + 40) % 360} 74% 46%))`;
    }

    /** First letter(s) for an avatar bubble. */
    function initials(name = '?') {
        return String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    }

    /* ============================ toasts =================================== */

    function toast(message, type = 'info') {
        let host = $('.toast-host');
        if (!host) {
            host = document.createElement('div');
            host.className = 'toast-host';
            document.body.appendChild(host);
        }
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;
        host.appendChild(el);
        setTimeout(() => el.remove(), 3800);
    }

    /* ============================= modal =================================== */

    /**
     * Shows the shared modal. Used by the Register button; its message states
     * the feature is currently unavailable.
     */
    function showModal({ icon = 'broom', title = 'Coming soon', text = '', actionLabel = 'Got it' } = {}) {
        let backdrop = $('.modal-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';
            backdrop.innerHTML = `
                <div class="modal" role="dialog" aria-modal="true">
                    <div class="big"></div>
                    <h3></h3>
                    <p></p>
                    <button class="btn" data-close type="button"></button>
                </div>`;
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop || e.target.hasAttribute('data-close')) hideModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') hideModal();
            });
            document.body.appendChild(backdrop);
        }
        $('.modal .big', backdrop).innerHTML = Icons.ui(icon);
        $('.modal h3', backdrop).textContent = title;
        $('.modal p', backdrop).textContent = text;
        $('[data-close]', backdrop).textContent = actionLabel;
        backdrop.classList.add('show');
    }

    function hideModal() {
        const backdrop = $('.modal-backdrop');
        if (backdrop) backdrop.classList.remove('show');
    }

    /* =========================== countdowns ================================ */

    const countdownTimers = [];

    /** "16d 4h" / "4h 12m" / "12m 30s" / "Happening now" / "Finished" */
    function countdownText(target) {
        const diff = target - Date.now();
        if (Number.isNaN(diff)) return '';
        if (diff <= 0) return diff > -6 * 60 * 60 * 1000 ? 'Happening now' : 'Event finished';
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        if (days > 0) return `${days}d ${hours}h ${mins}m until start`;
        if (hours > 0) return `${hours}h ${mins}m ${secs}s until start`;
        return `${mins}m ${secs}s until start`;
    }

    /** Refreshes every [data-countdown] element once per second. */
    function mountCountdowns(root = document) {
        $$('[data-countdown]', root).forEach((el) => {
            const target = parseDate(el.dataset.date);
            if (!target) return;
            el.textContent = countdownText(target.getTime());
        });
    }

    function startCountdownTicker() {
        if (countdownTimers.length) return;             // start once per page
        mountCountdowns(document);
        countdownTimers.push(setInterval(() => mountCountdowns(document), APP_CONFIG.countdownTick));
    }

    /* ============================ reveal =================================== */

    const revealObserver = ('IntersectionObserver' in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 })
        : null;

    function observeReveal(root = document) {
        $$('.reveal', root).forEach((el) => {
            if (revealObserver) revealObserver.observe(el);
            else el.classList.add('in');
        });
    }

    /* ======================== animated progress ============================ */

    const progressObserver = ('IntersectionObserver' in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const bar = entry.target;
                bar.style.width = Math.min(Number(bar.dataset.pct || 0), 100) + '%';
                progressObserver.unobserve(bar);
            });
        }, { threshold: 0.25 })
        : null;

    function animateBars(root = document) {
        $$('.bar > i', root).forEach((bar) => {
            if (progressObserver) progressObserver.observe(bar);
            else bar.style.width = Math.min(Number(bar.dataset.pct || 0), 100) + '%';
        });
    }

    /* =========================== event card ================================ */

    /**
     * Builds one event card. `live` marks the cards that get a countdown.
     * Returns a DOM element so the caller can append it (no innerHTML for
     * data coming from the database, which keeps the page injection-safe).
     */
    function createEventCard(event, { reveal = true } = {}) {
        const gradient = gradientFor(event.category_colour);
        const isPast = event.event_status === 'past';
        const isFree = Number(event.is_free) === 1;
        const pct = Math.min(Number(event.progress_pct || 0), 100);

        const article = document.createElement('article');
        article.className = 'event-card' + (reveal ? ' reveal' : '');
        article.style.setProperty('--c-gradient', gradient);
        article.dataset.category = event.category_slug;
        article.dataset.status = event.event_status;

        const link = `event.html?id=${encodeURIComponent(event.event_id)}`;
        const badge = isPast
            ? '<span class="card-badge past">Past event</span>'
            : (isFree
                ? '<span class="card-badge free">Free entry</span>'
                : (Number(event.days_remaining) <= 14
                    ? '<span class="card-badge soon">Only ' + Number(event.days_remaining) + ' days left</span>'
                    : ''));

        const photo = event.image_url
            ? `<img class="card-photo" src="${escapeHtml(event.image_url)}" alt="" loading="lazy">`
            : '';

        article.innerHTML = `
            <a class="card-banner${photo ? ' has-photo' : ''}" href="${link}" aria-label="View ${escapeHtml(event.event_name)}">
                ${photo}
                <span class="card-icon">${Icons.category(event.category_slug)}</span>
                <span class="card-cat">${escapeHtml(event.category_name)}</span>
                ${badge}
            </a>
            <div class="card-body">
                <h3><a href="${link}">${escapeHtml(event.event_name)}</a></h3>
                <div class="card-meta">
                    <span>${Icons.ui('calendar')} ${escapeHtml(dateLabel(event.event_date))}</span>
                    <span>${Icons.ui('pin')} ${escapeHtml(event.suburb)}, ${escapeHtml(event.city)}</span>
                </div>
                <p class="card-summary">${escapeHtml(event.summary)}</p>
                <div class="progress">
                    <div class="progress-top">
                        <span><b>${money(event.raised_amount)}</b> raised of ${money(event.goal_amount)}</span>
                        <span>${pct}%</span>
                    </div>
                    <div class="bar"><i data-pct="${pct}" style="width:0%"></i></div>
                </div>
                <div class="card-meta" style="font-size:12.5px">
                    <span>${Icons.ui('charity')} ${escapeHtml(event.organisation_name)}</span>
                    <span>${Icons.ui('users')} ${event.supporter_count} supporter${event.supporter_count == 1 ? '' : 's'}</span>
                </div>
            </div>
            <div class="card-foot">
                <div class="price ${isFree ? 'free' : ''}">
                    ${isFree ? 'Free' : money(event.ticket_price) + ' <small>/ ticket</small>'}
                </div>
                <span class="countdown" data-countdown data-date="${escapeHtml(event.event_date)}"></span>
            </div>`;

        return article;
    }

    /** Renders a list of events into a grid container. */
    function renderCards(container, events, { reveal = true } = {}) {
        container.innerHTML = '';
        events.forEach((event) => container.appendChild(createEventCard(event, { reveal })));
        animateBars(container);
        observeReveal(container);
        mountCountdowns(container);
    }

    /* =========================== skeletons ================================= */

    function showSkeletons(container, count = 6) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'skeleton-card';
            div.innerHTML = '<div class="sk-banner sk-line" style="margin:0"></div>'
                + '<div class="sk-line w60"></div><div class="sk-line w40"></div><div class="sk-line"></div>';
            frag.appendChild(div);
        }
        container.innerHTML = '';
        container.appendChild(frag);
    }

    /** Empty / error states rendered straight into the grid. */
    function renderMessage(container, { icon = 'compass', title, text, variant = 'empty', actionLabel = null, onAction = null } = {}) {
        const div = document.createElement('div');
        div.className = variant === 'error' ? 'error-state' : 'empty-state';
        div.innerHTML = `<div class="state-icon">${Icons.ui(icon)}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p>`;
        container.innerHTML = '';
        container.appendChild(div);

        if (actionLabel && onAction) {
            const btn = document.createElement('button');
            btn.className = 'btn';
            btn.textContent = actionLabel;
            btn.addEventListener('click', onAction);
            div.appendChild(btn);
        }
        return div;
    }

    /* ======================= animated counters ============================= */

    /** Counts a number up from 0 when the element scrolls into view. */
    function countUp(el, target, { prefix = '', suffix = '', decimals = 0 } = {}) {
        const duration = 1400;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = prefix + value.toLocaleString('en-AU', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function mountCounters(root = document) {
        const nodes = $$('[data-counter]', root);
        if (!nodes.length) return;

        // Older browsers without IntersectionObserver simply get the final number.
        if (!('IntersectionObserver' in window)) {
            nodes.forEach((el) => countUp(el, Number(el.dataset.counter), {
                prefix: el.dataset.prefix || '',
                suffix: el.dataset.suffix || ''
            }));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                countUp(el, Number(el.dataset.counter), {
                    prefix: el.dataset.prefix || '',
                    suffix: el.dataset.suffix || ''
                });
                io.unobserve(el);
            });
        }, { threshold: 0.4 });
        nodes.forEach((el) => io.observe(el));
    }

    /* ===================== ambience (Guangxi atmosphere) =================== */

    const calmMotion = () => !!(window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /**
     * Builds the moving layers behind every page: the day/night sky, the two
     * drifting karst ridges and the particles - osmanthus blossom by day, and
     * fireflies over the water at night. Purely decorative, and skipped
     * entirely for visitors who ask for reduced motion.
     */
    function initAmbience() {
        if (calmMotion() || $('.atmos')) return;        // mount once per page

        let html = '<div class="atmos-sky"></div>'
                 + '<div class="atmos-luminary"></div>'
                 + '<div class="atmos-karst k1"></div>'
                 + '<div class="atmos-karst k2"></div>';

        for (let i = 0; i < 18; i++) {                  // blossom, drifting down
            const left  = (Math.random() * 100).toFixed(2);
            const dur   = (11 + Math.random() * 12).toFixed(1);
            const delay = (-Math.random() * 18).toFixed(1);
            const drift = (Math.random() * 160 - 80).toFixed(0);
            const size  = (9 + Math.random() * 8).toFixed(1);
            html += '<span class="atmos-petal" style="left:' + left + '%;top:-8vh;'
                  + 'animation-duration:' + dur + 's;animation-delay:' + delay + 's;'
                  + '--drift:' + drift + 'px;width:' + size + 'px;height:' + size + 'px"></span>';
        }
        for (let i = 0; i < 22; i++) {                  // fireflies, wandering
            const left  = (Math.random() * 100).toFixed(2);
            const top   = (10 + Math.random() * 78).toFixed(2);
            const dur   = (9 + Math.random() * 11).toFixed(1);
            const delay = (-Math.random() * 16).toFixed(1);
            html += '<span class="atmos-fly" style="left:' + left + '%;top:' + top + '%;'
                  + 'animation-duration:' + dur + 's;animation-delay:' + delay + 's"></span>';
        }

        const atmos = document.createElement('div');
        atmos.className = 'atmos';
        atmos.setAttribute('aria-hidden', 'true');
        atmos.innerHTML = html;
        document.body.appendChild(atmos);
    }

    /** A soft water ripple under the pointer - a small reward for every click. */
    function initRipple() {
        if (calmMotion()) return;
        document.addEventListener('pointerdown', (e) => {
            const dot = document.createElement('span');
            dot.className = 'ripple';
            dot.style.left = e.clientX + 'px';
            dot.style.top  = e.clientY + 'px';
            document.body.appendChild(dot);
            setTimeout(() => dot.remove(), 800);
        });
    }

    /* ========================= page chrome ================================= */

    function initChrome() {
        /* --- every [data-icon] placeholder in the markup becomes its SVG - */
        $$('[data-icon]').forEach((el) => { el.innerHTML = Icons.ui(el.dataset.icon); });

        /* --- atmosphere: sky, karst ridges, blossom / fireflies, ripples -- */
        initAmbience();
        initRipple();

        /* --- theme switch (persisted in localStorage) ---
           "?theme=dark" / "?theme=light" also forces a mood, which is handy for
           a demo and lets a link open straight into the night-time version. */
        const forced = new URLSearchParams(location.search).get('theme');
        if (forced === 'dark' || forced === 'light') localStorage.setItem('theme', forced);

        const saved = localStorage.getItem('theme');
        if (saved) document.documentElement.dataset.theme = saved;

        const themeBtn = $('#themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                document.documentElement.dataset.theme = next;
                localStorage.setItem('theme', next);
                themeBtn.innerHTML = Icons.ui(next === 'dark' ? 'sun' : 'moon');
                toast(next === 'dark' ? 'Nightfall over the Li River' : 'Morning mist returns', 'success');
            });
            themeBtn.innerHTML = Icons.ui(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon');
        }

        /* --- mobile menu --- */
        const burger = $('#navToggle');
        const links = $('#navLinks');
        if (burger && links) {
            burger.addEventListener('click', () => {
                links.classList.toggle('open');
                burger.setAttribute('aria-expanded', String(links.classList.contains('open')));
            });
            links.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') links.classList.remove('open');
            });
        }

        /* --- shadow once the page scrolls --- */
        const nav = $('.nav');
        if (nav) {
            const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        /* --- highlight the current page in the menu --- */
        const page = document.body.dataset.page;
        $$('#navLinks a').forEach((a) => {
            a.classList.toggle('active', a.dataset.nav === page);
        });

        /* --- footer year --- */
        const year = $('#year');
        if (year) year.textContent = new Date().getFullYear();

        /* --- brand strings from config --- */
        $$('[data-org-email]').forEach((el) => { el.textContent = APP_CONFIG.org.email; });
        $$('[data-org-phone]').forEach((el) => { el.textContent = APP_CONFIG.org.phone; });
        $$('[data-org-address]').forEach((el) => { el.textContent = APP_CONFIG.org.address; });
        $$('[data-org-name]').forEach((el) => { el.textContent = APP_CONFIG.org.name; });

        /* --- live countdowns start ticking --- */
        startCountdownTicker();

        /* --- connection badge: proves the site really is talking to the API --- */
        const badge = $('#apiStatus');
        if (badge) {
            ApiClient.health()
                .then(() => {
                    badge.innerHTML = '<span class="dot"></span> API online';
                    badge.classList.add('online');
                })
                .catch(() => {
                    badge.innerHTML = '<span class="dot"></span> API offline';
                    badge.classList.add('offline');
                });
        }

        /* --- scroll reveal for anything already in the markup --- */
        observeReveal(document);
        mountCounters(document);
    }

    /* ============================ exports =================================== */
    return {
        $, $$, escapeHtml, money, parseDate, dateLabel, dateTimeLabel, timeRange,
        gradientFor, avatarColour, initials,
        toast, showModal, hideModal,
        mountCountdowns, observeReveal, animateBars,
        createEventCard, renderCards, showSkeletons, renderMessage,
        countUp, mountCounters, initChrome
    };
})();

/* Boot the shared chrome as soon as the DOM is ready. */
document.addEventListener('DOMContentLoaded', () => UI.initChrome());
