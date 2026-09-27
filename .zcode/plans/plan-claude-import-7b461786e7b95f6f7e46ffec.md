## Cal.com Schedule Section — Implementation Plan

### What gets added
A new `<!-- 5. SCHEDULE -->` section inserted between `.work` and `.close` in `index.html`, with matching styles in `styles.css` and a Cal.com inline embed initialised in `script.js`.

---

### 1. `index.html` — new section

Inserted between the `.work` close tag and `.close`:

```html
<!-- 5. SCHEDULE -->
<section class="schedule" id="schedule">
    <div class="schedule-header">
        <h2 class="label">Schedule</h2>
        <div class="schedule-meta">
            <p class="schedule-heading">Got 15 minutes?</p>
            <p class="schedule-sub">No slides. No pitch. Just a quick intro call — tell me what you're working on.</p>
            <div class="schedule-pills">
                <span class="schedule-pill">⏱ 15 min</span>
                <span class="schedule-pill">🎥 Google Meet</span>
                <span class="schedule-pill">🌐 IST timezone</span>
            </div>
        </div>
    </div>
    <div class="schedule-embed-wrapper">
        <div id="cal-embed"></div>
    </div>
</section>
```

Also adds `href="#schedule"` nav link to the header nav alongside Stack and Work.

---

### 2. `styles.css` — new block

Appended at the bottom, matching existing design conventions:

- `.schedule` — same padding rhythm as `.stack` and `.experience` (120px 40px), `max-width: 1100px`, centred
- `.schedule-header` — two-column flex: label+heading on the left, pills on the right, with a `border-bottom: 1px solid var(--border)` separator underneath (same treatment as `.label`)
- `.schedule-heading` — Space Grotesk display font, large (2rem), full `--text` color
- `.schedule-sub` — DM Sans, 16px, `--text-dim`
- `.schedule-pills` — flex row, gap 8px
- `.schedule-pill` — JetBrains Mono, 11px, pill shape matching `.work-tech span` exactly: `background: rgba(255,255,255,0.06)`, `border: 1px solid var(--border)`, `border-radius: 999px`, `padding: 5px 12px`, accent-colored icon inline via SVG
- `.schedule-embed-wrapper` — `border-radius: 16px`, `overflow: hidden`, `border: 1px solid var(--border)`, subtle `background: rgba(255,255,255,0.02)` — a frame that makes the Cal embed look like a native card
- Light mode overrides for all of the above using `body[data-theme="light"]`
- Responsive at 900px and 600px (single column, reduced padding)

---

### 3. `script.js` — Cal embed initialisation

Added after the scroll-reveals block, before the theme toggle section:

```js
// ── Cal.com inline embed ──────────────────────────────
(function (C, A, L) {
    let p = function (a, ar) { a.q.push(ar); };
    let d = C.document;
    C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement('script')).src = A;
            cal.loaded = true;
        }
        if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === 'string') {
                cal.ns[namespace] = cal.ns[namespace] || api;
                p(cal.ns[namespace], ar);
                p(cal, ['-', ar]);
            } else { p(cal, ar); }
            return;
        }
        p(cal, ar);
    };
})(window, 'https://app.cal.com/embed/embed.js', 'init');

Cal('init', 'quick-call', { origin: 'https://cal.com' });
Cal.ns['quick-call']('inline', {
    elementOrSelector: '#cal-embed',
    calLink: 'anubhavsanket/15min',
    layout: 'month_view'
});

// Theme-aware Cal UI — updates accent on themechange
function applyCalTheme(theme) {
    const isDark = theme !== 'light';
    Cal.ns['quick-call']('ui', {
        theme: isDark ? 'dark' : 'light',
        cssVarsPerTheme: {
            light: { 'cal-brand': '#1d00ff' },
            dark:  { 'cal-brand': '#E2FF00' }
        },
        hideEventTypeDetails: false,
        layout: 'month_view'
    });
}

// Apply on load and on every subsequent toggle
applyCalTheme(saved);
document.body.addEventListener('themechange', (e) => applyCalTheme(e.detail.theme));
```

Key behaviours:
- Cal loads its own embed script lazily from `app.cal.com` — no extra `<script>` tag in the HTML
- `Cal.ns['quick-call']` namespaces the instance so it doesn't collide with anything else
- `cal-brand` CSS variable matches your `--accent` exactly per theme (yellow in dark, blue in light)
- `themechange` CustomEvent (already dispatched by the existing toggle handler) updates the Cal UI in real time when the visitor switches themes — no page reload needed
- Scroll reveal added: `.schedule` is included in the existing `gsap.utils.toArray` targets so it fades up like the other sections

---

### What this does NOT touch
- `work` section — unchanged
- `close` section — unchanged, moves to position 6
- Header nav gets one extra link (`#schedule`) — purely additive
- No new CDN dependencies beyond Cal's own embed script (self-loaded on demand)