/**
 * ============================================================================
 *  event.js - behaviour of the Event Details page (event.html)
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  How the page knows which event to show
 *  --------------------------------------
 *  The Home and Search pages link here with a query string:  event.html?id=7
 *  The id is read with URLSearchParams, sent to GET /api/events/:id, and the
 *  whole page is rendered from the response. The id is also remembered in
 *  localStorage so the "Event Details" menu item reopens the last event.
 *
 *  The Register button opens a modal that states, verbatim:
 *      "This feature is currently under construction."
 * ============================================================================
 */

'use strict';

(function () {

    const { $, $$ } = UI;
    const root = $('#detailContent');

    /** Reads ?id= from the URL, falling back to the last viewed event. */
    function resolveEventId() {
        const fromUrl = new URLSearchParams(location.search).get('id');
        if (fromUrl && /^\d+$/.test(fromUrl)) {
            localStorage.setItem('lastEventId', fromUrl);   // remember for next time
            return Number(fromUrl);
        }
        const remembered = Number(localStorage.getItem('lastEventId'));
        return remembered || null;
    }

    /* ========================== related events ============================= */

    function loadRelated(event) {
        ApiClient.search({ category: event.category_slug, sort: 'date' })
            .then((res) => {
                const others = res.data.filter((e) => e.event_id !== event.event_id).slice(0, 3);
                if (!others.length) return;
                $('#relatedBlock').style.display = '';
                UI.renderCards($('#relatedGrid'), others);
            })
            .catch(() => { /* related events are a nice-to-have */ });
    }

    /* ============================ rendering ================================ */

    function renderEvent(event) {
        document.title = `${event.event_name} | Guangxi Charity Events`;
        $('#crumbName').textContent = event.event_name;

        const gradient = UI.gradientFor(event.category_colour);
        const pct = Math.min(Number(event.progress_pct || 0), 100);
        const isPast = event.event_status === 'past';
        const isFree = Number(event.is_free) === 1;

        // --- donation ring geometry ------------------------------------------
        const radius = 62;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - pct / 100);

        const updates = (event.updates || []).map((u) => `
            <li>
                <time>${UI.escapeHtml(UI.dateLabel(u.posted_at))}</time>
                <b>${UI.escapeHtml(u.title)}</b>
                <span>${UI.escapeHtml(u.body)}</span>
            </li>`).join('') || '<li><b>No updates yet</b><span>Check back closer to the event date.</span></li>';

        const donors = (event.recent_donations || []).map((d) => `
            <div class="donor">
                <div class="avatar" style="background:${UI.avatarColour(d.donor_name)}">${UI.escapeHtml(UI.initials(d.donor_name))}</div>
                <div>
                    <b>${UI.escapeHtml(d.donor_name)}</b>
                    <span>${UI.escapeHtml(UI.dateLabel(d.donated_at))}${d.message ? ' · “' + UI.escapeHtml(d.message) + '”' : ''}</span>
                </div>
                <span class="amt">${UI.money(d.amount)}</span>
            </div>`).join('') || '<p style="color:var(--muted);font-size:14px">Be the first to support this event.</p>';

        root.innerHTML = `
            <!-- ============================ HERO ============================ -->
            <div class="detail-hero${event.image_url ? ' has-photo' : ''}" style="--c-gradient:${gradient}">
                ${event.image_url ? `<img class="detail-photo" src="${UI.escapeHtml(event.image_url)}" alt="" loading="lazy">` : ''}
                <div class="hero-tags">
                    <span>${Icons.category(event.category_slug)} ${UI.escapeHtml(event.category_name)}</span>
                    <span>${Icons.ui('charity')} ${UI.escapeHtml(event.organisation_name)}</span>
                    <span>${isPast ? Icons.ui('calendar') + ' Past event' : Icons.ui('compass') + ' Upcoming'}</span>
                    ${isFree ? '<span>' + Icons.ui('ticket') + ' Free entry</span>' : ''}
                </div>
                <h1>${UI.escapeHtml(event.event_name)}</h1>
                <p style="font-size:17px;max-width:70ch;margin:0">${UI.escapeHtml(event.summary)}</p>
                <div class="hero-tags" style="margin-top:18px">
                    <span>${Icons.ui('calendar')} ${UI.escapeHtml(UI.dateTimeLabel(event.event_date))}</span>
                    <span>${Icons.ui('pin')} ${UI.escapeHtml(event.venue)}, ${UI.escapeHtml(event.suburb)}</span>
                    <span>${Icons.ui('compass')} ${UI.escapeHtml(UI.timeRange(event.event_date, event.end_date))}</span>
                    <span class="countdown" data-countdown data-date="${UI.escapeHtml(event.event_date)}"
                          style="background:rgba(255,255,255,.32)"></span>
                </div>
            </div>

            <!-- ============================ BODY ============================ -->
            <div class="detail-grid">

                <!-- ---------------------- main column ---------------------- -->
                <div>
                    <div class="card reveal">
                        <h3>About this event</h3>
                        <p style="white-space:pre-line">${UI.escapeHtml(event.full_description)}</p>
                    </div>

                    <div class="card reveal">
                        <h3>${Icons.ui('spark')} Goal vs progress</h3>
                        <div class="ring-wrap">
                            <div class="ring">
                                <svg width="148" height="148" viewBox="0 0 148 148" aria-hidden="true">
                                    <defs>
                                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#6366f1"/>
                                            <stop offset="55%" stop-color="#ec4899"/>
                                            <stop offset="100%" stop-color="#f59e0b"/>
                                        </linearGradient>
                                    </defs>
                                    <circle class="track" cx="74" cy="74" r="${radius}"></circle>
                                    <circle class="fill" cx="74" cy="74" r="${radius}"
                                            stroke-dasharray="${circumference.toFixed(1)}"
                                            stroke-dashoffset="${circumference.toFixed(1)}"
                                            data-target="${offset.toFixed(1)}"></circle>
                                </svg>
                                <div class="pct">${pct}%</div>
                            </div>
                            <div class="ring-stats">
                                <div><b>${UI.money(event.raised_amount)}</b><span>raised so far</span></div>
                                <div style="margin-top:12px"><b>${UI.money(event.goal_amount)}</b><span>fundraising goal</span></div>
                                <div style="margin-top:12px"><b>${event.supporter_count}</b><span>supporters</span></div>
                            </div>
                        </div>
                        <div class="progress" style="margin-top:22px">
                            <div class="progress-top"><span>Progress to goal</span><span>${pct}%</span></div>
                            <div class="bar"><i data-pct="${pct}" style="width:0"></i></div>
                        </div>
                        ${pct >= 100 ? `<p style="margin-top:14px;color:var(--ok);font-weight:700">${Icons.ui('spark')} Goal reached — extra funds go to the next event in this program.</p>` : ''}
                    </div>

                    <div class="card reveal">
                        <h3>${Icons.ui('news')} Latest updates</h3>
                        <ul class="timeline">${updates}</ul>
                    </div>

                    <div class="card reveal">
                        <h3>${Icons.ui('users')} Recent supporters</h3>
                        ${donors}
                    </div>
                </div>

                <!-- --------------------- side column ----------------------- -->
                <div>
                    <div class="card reveal" style="position:sticky;top:calc(var(--nav-h) + 18px)">
                        <h3>${Icons.ui('ticket')} Tickets</h3>
                        <div class="ticket">
                            <div>
                                <div class="price ${isFree ? 'free' : ''}">${isFree ? 'Free' : UI.money(event.ticket_price)}</div>
                                <small style="color:var(--muted)">${isFree ? 'No cost to attend' : 'per person · 100% is a donation'}</small>
                            </div>
                            <div>${Icons.ui('ticket')}</div>
                        </div>

                        <ul class="fact-list" style="margin-top:18px">
                            <li class="fact"><span class="ic">${Icons.ui('calendar')}</span><div><b>${UI.escapeHtml(UI.dateLabel(event.event_date))}</b><span>${UI.escapeHtml(UI.timeRange(event.event_date, event.end_date))}</span></div></li>
                            <li class="fact"><span class="ic">${Icons.ui('pin')}</span><div><b>${UI.escapeHtml(event.venue)}</b><span>${UI.escapeHtml(event.address)}, ${UI.escapeHtml(event.suburb)} ${UI.escapeHtml(event.city)}</span></div></li>
                            <li class="fact"><span class="ic">${Icons.ui('users')}</span><div><b>${event.capacity} places</b><span>Total event capacity</span></div></li>
                        </ul>

                        <button class="btn btn-block" id="btnRegister" style="margin-top:20px">
                            ${isPast ? Icons.ui('search') + ' See the highlights' : Icons.ui('ticket') + ' Register now'}
                        </button>
                        <button class="btn btn-ghost btn-block btn-sm" id="btnShare" style="margin-top:10px">
                            ${Icons.ui('link')} Copy event link
                        </button>
                        <p style="font-size:12.5px;color:var(--muted);margin:14px 0 0;text-align:center">
                            Registration opens in Assessment 3.
                        </p>
                    </div>

                    <div class="card reveal">
                        <h3>${Icons.ui('charity')} Organised by</h3>
                        <div class="org-card">
                            <div class="org-logo" style="background:${UI.gradientFor(event.organisation_colour)}">
                                ${UI.escapeHtml(UI.initials(event.organisation_name))}
                            </div>
                            <div>
                                <b>${UI.escapeHtml(event.organisation_name)}</b>
                                <span style="display:block;font-size:12.5px;color:var(--muted)">${UI.escapeHtml(event.organisation_mission)}</span>
                            </div>
                        </div>
                        <ul class="fact-list" style="margin-top:16px">
                            <li class="fact"><span class="ic">${Icons.ui('mail')}</span><div><b>Email</b><span>${UI.escapeHtml(event.organisation_email)}</span></div></li>
                            <li class="fact"><span class="ic">${Icons.ui('phone')}</span><div><b>Phone</b><span>${UI.escapeHtml(event.organisation_phone || '–')}</span></div></li>
                        </ul>
                        <a class="btn btn-ghost btn-block btn-sm" style="margin-top:16px"
                           href="search.html?category=${encodeURIComponent(event.category_slug)}">
                            More ${UI.escapeHtml(event.category_name)} events
                        </a>
                    </div>
                </div>
            </div>`;

        /* --- animate the donation ring once it is on screen ---------------- */
        const ring = $('.ring .fill', root);
        if (ring) {
            requestAnimationFrame(() => {
                setTimeout(() => { ring.style.strokeDashoffset = ring.dataset.target; }, 250);
            });
        }

        /* --- Register button: opens the registration modal ------------------ */
        $('#btnRegister').addEventListener('click', () => {
            UI.showModal({
                icon: 'broom',
                title: isPast ? 'Event highlights coming soon' : 'Registration',
                text: 'This feature is currently under construction.',
                actionLabel: 'Close'
            });
        });

        /* --- share ---------------------------------------------------------- */
        $('#btnShare').addEventListener('click', () => {
            const url = location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url)
                    .then(() => UI.toast('Event link copied to clipboard.', 'success'))
                    .catch(() => UI.toast('Could not copy the link: ' + url, 'warn'));
            } else {
                UI.toast('Copy this link: ' + url, 'info');
            }
        });

        UI.observeReveal(root);
        UI.mountCountdowns(root);
        UI.animateBars(root);
        loadRelated(event);
    }

    /* ============================ error states ============================= */

    function renderPicker() {
        // No id in the URL (e.g. the menu item was clicked): let the user choose.
        root.innerHTML = '<div class="empty-state"><div class="state-icon">' + Icons.ui('compass') + '</div>'
            + '<h3>Pick an event to see its details</h3>'
            + '<p>Open any event from the home page or the search page and it will load here.</p>'
            + '<a class="btn" href="search.html">Go to search</a></div>';

        ApiClient.listEvents({ scope: 'upcoming', limit: 6 })
            .then((res) => {
                if (!res.data.length) return;
                const holder = document.createElement('div');
                holder.className = 'card-grid';
                holder.style.marginTop = '26px';
                root.appendChild(holder);
                UI.renderCards(holder, res.data);
            })
            .catch(() => { /* keep the picker message only */ });
    }

    function renderError(message) {
        UI.renderMessage(root, {
            icon: 'alert',
            variant: 'error',
            title: 'Event not available',
            text: message,
            actionLabel: 'Browse all events',
            onAction: () => { location.href = 'search.html'; }
        });
    }

    /* =============================== boot ================================== */

    document.addEventListener('DOMContentLoaded', () => {
        const id = resolveEventId();

        if (!id) {
            renderPicker();
            return;
        }

        ApiClient.eventById(id)
            .then((res) => renderEvent(res.data))
            .catch((err) => renderError(err.message));
    });

})();
