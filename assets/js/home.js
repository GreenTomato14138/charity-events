/**
 * ============================================================================
 *  home.js - behaviour of the Home page (index.html)
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  Data flow
 *  ---------
 *   GET /api/stats       -> hero counters + impact band
 *   GET /api/events/featured -> hero carousel
 *   GET /api/categories  -> filter chips
 *   GET /api/events      -> the dynamic event listing (must come from the API)
 *   GET /api/donations/recent -> supporter marquee
 *
 *  Every call is a Promise chain; nothing here touches MySQL directly.
 * ============================================================================
 */

'use strict';

(function () {

    const { $, $$ } = UI;

    const gridEl = $('#eventGrid');
    const trackEl = $('#featuredTrack');
    const dotsEl = $('#carouselDots');
    const chipsEl = $('#categoryChips');

    /** All events currently held in memory (used by the category chips). */
    let cachedEvents = [];
    let activeCategory = 'all';
    let activeScope = 'upcoming';

    /* ====================================================================== */
    /*  1. Statistics                                                          */
    /* ====================================================================== */
    function loadStats() {
        return ApiClient.stats()
            .then((res) => {
                const s = res.data;

                // Hero counters (animated by UI.mountCounters)
                $('#statUpcoming').dataset.counter = s.upcoming_events;
                $('#statRaised').dataset.counter = s.total_raised;
                $('#statSupporters').dataset.counter = s.total_supporters;

                // Impact band
                $('#impactRaised').dataset.counter = s.total_raised;
                $('#impactSupporters').dataset.counter = s.total_supporters;
                $('#impactEvents').dataset.counter = s.total_events;
                $('#impactOrgs').dataset.counter = s.total_organisations;

                // Floating hero card: total raised against a $3.0m season goal
                const seasonGoal = 3000000;
                const pct = Math.min(Math.round((s.total_raised / seasonGoal) * 100), 100);
                UI.countUp($('#heroCardAmount'), s.total_raised, { prefix: '$' });
                $('#heroCardEvents').textContent = s.total_events;
                $('#heroCardPct').textContent = pct + '%';
                const bar = $('#heroCardBar');
                bar.dataset.pct = pct;
                setTimeout(() => { bar.style.width = pct + '%'; }, 300);

                UI.mountCounters(document);
            })
            .catch(() => {
                // A failure of the stats endpoint must not break the event list.
                $$('[data-counter]').forEach((el) => { el.textContent = '–'; });
            });
    }

    /* ====================================================================== */
    /*  2. Featured carousel                                                   */
    /* ====================================================================== */
    let slideIndex = 0;
    let slideTimer = null;

    function buildSlide(event) {
        const gradient = UI.gradientFor(event.category_colour);
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.background = 'var(--surface)';

        const pct = Math.min(Number(event.progress_pct || 0), 100);

        const photo = event.image_url
            ? `<img class="slide-photo" src="${UI.escapeHtml(event.image_url)}" alt="" loading="lazy">`
            : '';

        slide.innerHTML = `
            <div class="slide-art${photo ? ' has-photo' : ''}" style="background:${gradient}">
                ${photo}
                <div class="slide-copy">
                    <div class="big-icon">${Icons.category(event.category_slug)}</div>
                    <h3>${UI.escapeHtml(event.event_name)}</h3>
                    <div class="meta">${UI.escapeHtml(event.category_name)} · ${UI.escapeHtml(event.organisation_name)}</div>
                </div>
                <div class="hero-tags">
                    <span>${Icons.ui('calendar')} ${UI.escapeHtml(UI.dateLabel(event.event_date))}</span>
                    <span>${Icons.ui('pin')} ${UI.escapeHtml(event.suburb)}</span>
                    <span>${Icons.ui('ticket')} ${Number(event.is_free) === 1 ? 'Free entry' : UI.money(event.ticket_price)}</span>
                </div>
            </div>
            <div class="slide-body">
                <span class="chip active" style="align-self:flex-start">Featured event</span>
                <p class="summary">${UI.escapeHtml(event.summary)}</p>
                <div class="row">
                    <span>${Icons.ui('compass')} <b class="countdown" data-countdown data-date="${UI.escapeHtml(event.event_date)}"></b></span>
                    <span>${Icons.ui('spark')} ${UI.money(event.goal_amount)} goal</span>
                    <span>${Icons.ui('users')} ${event.supporter_count} supporters</span>
                </div>
                <div class="progress">
                    <div class="progress-top">
                        <span><b>${UI.money(event.raised_amount)}</b> raised</span><span>${pct}%</span>
                    </div>
                    <div class="bar"><i data-pct="${pct}" style="width:0"></i></div>
                </div>
                <a class="btn" href="event.html?id=${encodeURIComponent(event.event_id)}" style="align-self:flex-start">
                    View event details →
                </a>
            </div>`;
        return slide;
    }

    function renderCarousel(events) {
        trackEl.innerHTML = '';
        dotsEl.innerHTML = '';
        if (!events.length) {
            $('#featuredCarousel').style.display = 'none';
            return;
        }

        events.forEach((event) => trackEl.appendChild(buildSlide(event)));

        events.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsEl.appendChild(dot);
        });

        goToSlide(0);
        startAutoplay();
    }

    function goToSlide(index) {
        const total = trackEl.children.length;
        if (!total) return;
        slideIndex = (index + total) % total;
        trackEl.style.transform = `translateX(-${slideIndex * 100}%)`;
        $$('#carouselDots button').forEach((d, i) => d.classList.toggle('active', i === slideIndex));
        UI.animateBars(trackEl);
    }

    function startAutoplay() {
        stopAutoplay();
        slideTimer = setInterval(() => goToSlide(slideIndex + 1), 6500);
    }

    function stopAutoplay() {
        if (slideTimer) clearInterval(slideTimer);
        slideTimer = null;
    }

    function loadFeatured() {
        return ApiClient.featured(3)
            .then((res) => renderCarousel(res.data))
            .catch((err) => UI.toast('Featured events unavailable: ' + err.message, 'error'));
    }

    /* ====================================================================== */
    /*  3. Categories + event listing                                          */
    /* ====================================================================== */
    function loadCategories() {
        return ApiClient.categories()
            .then((res) => {
                res.data.forEach((cat) => {
                    const chip = document.createElement('span');
                    chip.className = 'chip';
                    chip.dataset.category = cat.slug;
                    chip.innerHTML = `${Icons.category(cat.slug)} ${UI.escapeHtml(cat.category_name)}
                                      <span class="count">${cat.event_count}</span>`;
                    chipsEl.appendChild(chip);
                });
            })
            .catch(() => { /* chips are progressive enhancement - ignore failure */ });
    }

    function applyCategoryFilter() {
        const cards = $$('.event-card', gridEl);
        let visible = 0;
        cards.forEach((card) => {
            const match = activeCategory === 'all' || card.dataset.category === activeCategory;
            card.style.display = match ? '' : 'none';
            if (match) visible++;
        });

        // Empty state for a category with no events in the current scope
        let notice = $('#filterNotice');
        if (!visible && cards.length) {
            if (!notice) {
                notice = document.createElement('div');
                notice.id = 'filterNotice';
                notice.className = 'empty-state';
                gridEl.parentNode.insertBefore(notice, gridEl.nextSibling);
            }
            notice.innerHTML = `<div class="state-icon">${Icons.ui('folder')}</div>
                <h3>No ${UI.escapeHtml(activeCategory)} events in this view</h3>
                <p>Try another category, or switch the scope filter to “All events”.</p>`;
        } else if (notice) {
            notice.remove();
        }
    }

    function loadEvents(scope) {
        activeScope = scope;
        UI.showSkeletons(gridEl, 6);

        return ApiClient.listEvents({ scope, limit: 50, sort: 'date' })
            .then((res) => {
                cachedEvents = res.data;
                if (!cachedEvents.length) {
                    UI.renderMessage(gridEl, {
                        icon: 'mail',
                        title: 'No events in this view',
                        text: 'There are no events matching this scope right now. Check back soon — new events are published every week.'
                    });
                    return;
                }
                UI.renderCards(gridEl, cachedEvents);
                applyCategoryFilter();
            })
            .catch((err) => {
                UI.renderMessage(gridEl, {
                    icon: 'plug',
                    variant: 'error',
                    title: 'Could not load events',
                    text: err.message + ' — start the API with “npm start” in the api folder, then retry.',
                    actionLabel: 'Retry',
                    onAction: () => loadEvents(activeScope)
                });
            });
    }

    /* ====================================================================== */
    /*  4. Supporter marquee                                                   */
    /* ====================================================================== */
    function loadDonors() {
        return ApiClient.recentDonations(14)
            .then((res) => {
                const track = $('#donorTrack');
                if (!res.data.length) {
                    $('#donorMarquee').style.display = 'none';
                    return;
                }
                const items = res.data.map((d) =>
                    `<span>${UI.escapeHtml(d.donor_name)} donated <b>${UI.money(d.amount)}</b> to ${UI.escapeHtml(d.event_name)}</span>`
                );
                // duplicated so the CSS -50% translation loops seamlessly
                track.innerHTML = items.join('') + items.join('');
            })
            .catch(() => { $('#donorMarquee').style.display = 'none'; });
    }

    /* ====================================================================== */
    /*  5. Interactions                                                        */
    /* ====================================================================== */
    function wireInteractions() {
        // scope chips (upcoming / past / all)
        $('#scopeChips').addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            $$('#scopeChips .chip').forEach((c) => c.classList.toggle('active', c === chip));
            loadEvents(chip.dataset.scope);
        });

        // category chips (client-side filter over the API result set)
        chipsEl.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            activeCategory = chip.dataset.category;
            $$('#categoryChips .chip').forEach((c) => c.classList.toggle('active', c === chip));
            applyCategoryFilter();
        });

        // carousel controls
        $('#carouselPrev').addEventListener('click', () => { goToSlide(slideIndex - 1); startAutoplay(); });
        $('#carouselNext').addEventListener('click', () => { goToSlide(slideIndex + 1); startAutoplay(); });
        $('#featuredCarousel').addEventListener('mouseenter', stopAutoplay);
        $('#featuredCarousel').addEventListener('mouseleave', startAutoplay);

        // newsletter - client side validation demo
        const form = $('#newsletterForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = $('#newsletterEmail');
            const error = $('#newsletterError');
            const value = input.value.trim();
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

            input.classList.toggle('invalid', !valid);
            if (!valid) {
                error.textContent = 'Please enter a valid email address.';
                error.classList.add('show');
                UI.toast('That email address does not look right.', 'error');
                return;
            }
            error.classList.remove('show');
            input.classList.remove('invalid');
            input.value = '';
            UI.toast('Thanks! We will email you when new events go live.', 'success');
            UI.showModal({
                icon: 'mail',
                title: 'You are on the list',
                text: 'This feature is currently under construction.',
                actionLabel: 'Great'
            });
        });
    }

    /* ====================================================================== */
    /*  6. Boot                                                                */
    /* ====================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        wireInteractions();
        loadStats();
        loadFeatured();
        loadCategories().then(() => loadEvents('upcoming'));
        loadDonors();
    });

})();
