/**
 * ============================================================================
 *  search.js - behaviour of the Search page (search.html)
 *  PROG2002 A2 - Boyuan Liu (24832410)
 *
 *  Responsibilities
 *  ----------------
 *   * render the category checkboxes from GET /api/categories
 *   * collect the three required criteria (date, location, category) plus two
 *     extras (keyword, free-only) and a sort order
 *   * validate the form with plain DOM manipulation and show inline errors
 *   * call GET /api/events/search and render the matching event cards
 *   * "Clear Filters" resets every control - also pure DOM work
 *   * keep the filters in the query string so a search can be shared / reloaded
 * ============================================================================
 */

'use strict';

(function () {

    const { $, $$ } = UI;

    const form = $('#searchForm');
    const grid = $('#resultsGrid');
    const countEl = $('#resultCount');
    const titleEl = $('#resultsTitle');
    const summaryEl = $('#activeFilterSummary');
    const checksEl = $('#categoryChecks');

    let searchToken = 0;   // guards against out-of-order responses

    /* ========================== helpers ==================================== */

    /** Reads every control and returns a plain filter object. */
    function readFilters() {
        const categories = $$('#categoryChecks input:checked').map((cb) => cb.value);
        return {
            q: $('#fKeyword').value.trim(),
            from: $('#fFrom').value,
            to: $('#fTo').value,
            location: $('#fLocation').value.trim(),
            sort: $('#fSort').value,
            categories,
            free: $('#fFree').checked
        };
    }

    /** Turns the filter object into API query parameters. */
    function toApiParams(filters) {
        return {
            q: filters.q || null,
            from: filters.from || null,
            to: filters.to || null,
            location: filters.location || null,
            sort: filters.sort || 'date',
            category: filters.categories.length ? filters.categories : null,
            free: filters.free ? 'true' : null
        };
    }

    /** Human readable sentence describing what is currently being searched. */
    function describe(filters) {
        const bits = [];
        if (filters.q) bits.push(`keyword “${filters.q}”`);
        if (filters.location) bits.push(`in ${filters.location}`);
        if (filters.categories.length) bits.push(`${filters.categories.length} categor${filters.categories.length === 1 ? 'y' : 'ies'}`);
        if (filters.from) bits.push(`from ${UI.dateLabel(filters.from)}`);
        if (filters.to) bits.push(`until ${UI.dateLabel(filters.to)}`);
        if (filters.free) bits.push('free entry only');
        return bits.length ? `Filtering by ${bits.join(' · ')}.` : 'No filters applied — showing every upcoming event.';
    }

    /** Mirrors the filters into the address bar without reloading the page. */
    function syncUrl(filters) {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.from) params.set('from', filters.from);
        if (filters.to) params.set('to', filters.to);
        if (filters.location) params.set('location', filters.location);
        if (filters.sort && filters.sort !== 'date') params.set('sort', filters.sort);
        filters.categories.forEach((c) => params.append('category', c));
        if (filters.free) params.set('free', 'true');
        const query = params.toString();
        history.replaceState(null, '', query ? `?${query}` : location.pathname);
    }

    /* ========================= validation ================================= */

    function showError(id, inputId, message) {
        const errorEl = $(id);
        if (errorEl) {
            errorEl.textContent = message || '';
            errorEl.classList.toggle('show', Boolean(message));
        }
        if (inputId) {
            const input = $(inputId);
            if (input) input.classList.toggle('invalid', Boolean(message));
        }
    }

    function clearErrors() {
        ['#errKeyword', '#errFrom', '#errTo', '#errLocation', '#errCategory'].forEach((id) => showError(id, null, ''));
        ['#fKeyword', '#fFrom', '#fTo', '#fLocation'].forEach((id) => {
            const el = $(id);
            if (el) el.classList.remove('invalid');
        });
    }

    /** @returns {boolean} true when the form is safe to submit */
    function validate(filters) {
        clearErrors();
        let ok = true;

        if (filters.q && filters.q.length < 2) {
            showError('#errKeyword', '#fKeyword', 'Keyword must be at least 2 characters.');
            ok = false;
        }
        if (filters.location && filters.location.length < 2) {
            showError('#errLocation', '#fLocation', 'Location must be at least 2 characters.');
            ok = false;
        }
        if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) {
            const msg = 'The “date from” must be earlier than “date to”.';
            showError('#errFrom', '#fFrom', msg);
            showError('#errTo', '#fTo', msg);
            ok = false;
        }
        if (filters.to && !filters.from && new Date(filters.to) < new Date(new Date().toDateString())) {
            showError('#errTo', '#fTo', 'That date has already passed.');
            ok = false;
        }
        if (!ok) {
            UI.toast('Please fix the highlighted fields.', 'error');
        }
        return ok;
    }

    /* ========================== rendering ================================= */

    function runSearch() {
        const filters = readFilters();
        summaryEl.textContent = describe(filters);

        if (!validate(filters)) return;

        syncUrl(filters);
        const token = ++searchToken;
        UI.showSkeletons(grid, 6);
        countEl.textContent = 'Searching…';
        titleEl.textContent = 'Searching events';

        ApiClient.search(toApiParams(filters))
            .then((res) => {
                if (token !== searchToken) return;        // a newer search already started

                const events = res.data;
                countEl.textContent = `${events.length} event${events.length === 1 ? '' : 's'} found`;
                titleEl.textContent = events.length ? 'Matching events' : 'No matches';

                if (!events.length) {
                    UI.renderMessage(grid, {
                        icon: 'search',
                        title: 'No events match your filters',
                        text: 'Try widening the date range, removing a category, or searching a different suburb.',
                        actionLabel: 'Clear all filters',
                        onAction: clearFilters
                    });
                    UI.toast('No events matched those criteria.', 'warn');
                    return;
                }

                UI.renderCards(grid, events);
                UI.toast(`${events.length} event${events.length === 1 ? '' : 's'} found`, 'success');
            })
            .catch((err) => {
                if (token !== searchToken) return;
                countEl.textContent = 'Error';
                titleEl.textContent = 'Something went wrong';
                UI.renderMessage(grid, {
                    icon: 'plug',
                    variant: 'error',
                    title: 'Search request failed',
                    text: err.message,
                    actionLabel: 'Try again',
                    onAction: runSearch
                });
            });
    }

    /** Resets every control - required "Clear Filters" behaviour. */
    function clearFilters() {
        form.reset();
        $$('#categoryChecks input').forEach((cb) => {
            cb.checked = false;
            cb.closest('.check').classList.remove('checked');
        });
        clearErrors();
        history.replaceState(null, '', location.pathname);
        UI.toast('All filters cleared.', 'info');
        runSearch();
    }

    /* ======================== category checkboxes ========================= */

    function loadCategories(preSelected = []) {
        return ApiClient.categories()
            .then((res) => {
                checksEl.innerHTML = '';
                res.data.forEach((cat) => {
                    const label = document.createElement('label');
                    label.className = 'check';
                    label.innerHTML = `
                        <input type="checkbox" value="${UI.escapeHtml(cat.slug)}"
                               ${preSelected.includes(cat.slug) ? 'checked' : ''}>
                        <span>${Icons.category(cat.slug)} ${UI.escapeHtml(cat.category_name)} <small style="opacity:.65">(${cat.event_count})</small></span>`;
                    const input = label.querySelector('input');
                    input.addEventListener('change', () => {
                        label.classList.toggle('checked', input.checked);
                        runSearch();                       // live filtering
                    });
                    if (input.checked) label.classList.add('checked');
                    checksEl.appendChild(label);
                });
            })
            .catch(() => {
                checksEl.innerHTML = '<span class="check" style="opacity:.7">Categories unavailable — keyword, date and location filters still work.</span>';
            });
    }

    /* ============================ deep links ============================== */

    function applyQueryString() {
        const params = new URLSearchParams(location.search);
        $('#fKeyword').value = params.get('q') || '';
        $('#fFrom').value = params.get('from') || '';
        $('#fTo').value = params.get('to') || '';
        $('#fLocation').value = params.get('location') || '';
        $('#fSort').value = params.get('sort') || 'date';
        $('#fFree').checked = params.get('free') === 'true';
        return params.getAll('category');
    }

    /* ============================== boot ================================== */

    document.addEventListener('DOMContentLoaded', () => {
        const preSelected = applyQueryString();
        loadCategories(preSelected).then(runSearch);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            runSearch();
        });

        $('#btnClear').addEventListener('click', clearFilters);

        // Live search: debounce so we do not hammer the API on every keystroke.
        let timer = null;
        $('#fKeyword').addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(runSearch, 450);
        });
        $('#fLocation').addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(runSearch, 450);
        });
        ['#fFrom', '#fTo', '#fSort', '#fFree'].forEach((sel) => {
            $(sel).addEventListener('change', runSearch);
        });
    });

})();
