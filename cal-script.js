    // ───────────────────────────────────────────────
    // Cal.com inline embed
    // ───────────────────────────────────────────────
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

    // Apply on load
    applyCalTheme(saved);
