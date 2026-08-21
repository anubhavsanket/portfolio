// Theme
const saved = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', saved);

document.addEventListener('DOMContentLoaded', () => {
    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ───────────────────────────────────────────────
    // Lenis smooth scroll — with fallback
    // ───────────────────────────────────────────────
    let lenis = null;
    try {
        lenis = new Lenis({
            duration: prefersReducedMotion ? 0 : 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: !prefersReducedMotion
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    } catch (e) {
        console.warn('Lenis failed to load, falling back to native scroll');
    }

    // ───────────────────────────────────────────────
    // Hero name stagger — clean vertical slide, no rotation
    // ───────────────────────────────────────────────
    const heroName = document.getElementById('hero-name');
    if (heroName && typeof anime !== 'undefined') {
        const text = heroName.textContent;
        heroName.textContent = '';
        for (const char of text) {
            if (char === '\n') { heroName.appendChild(document.createElement('br')); }
            else if (char === ' ') { heroName.appendChild(document.createTextNode(' ')); }
            else {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.setAttribute('aria-hidden', 'true');
                heroName.appendChild(span);
            }
        }
        const chars = heroName.querySelectorAll('.char');
        chars.forEach(c => { c.style.opacity = '0'; c.style.display = 'inline-block'; });

        if (!prefersReducedMotion) {
            anime.timeline({ delay: 200 })
                .add({ targets: chars, opacity: [0,1], translateY: [30,0], duration: 800, easing: 'easeOutExpo', delay: anime.stagger(45) });
        } else {
            chars.forEach(c => { c.style.opacity = '1'; });
        }
    }

    // ───────────────────────────────────────────────
    // Hero meta + footer fade in
    // ───────────────────────────────────────────────
    if (typeof anime !== 'undefined' && !prefersReducedMotion) {
        // Set initial opacity:0 ONLY when animation will run
        ['.hero-meta', '.hero-subtitle', '.hero-footer'].forEach(s => {
            const el = document.querySelector(s); if (el) el.style.opacity = '0';
        });
        anime.timeline({ delay: 800 })
            .add({ targets: '.hero-meta', opacity: [0,1], translateY: [10,0], duration: 500, easing: 'easeOutCubic' })
            .add({ targets: '.hero-subtitle', opacity: [0,1], translateY: [10,0], duration: 500, easing: 'easeOutCubic' }, '-=200')
            .add({ targets: '.hero-footer', opacity: [0,1], translateY: [15,0], duration: 600, easing: 'easeOutCubic' }, '-=200');
    }

    // ───────────────────────────────────────────────
    // Horizontal scroll for projects — cached measurements
    // ───────────────────────────────────────────────
    const track = document.querySelector('.work-track');
    const wrapper = document.querySelector('.work-track-wrapper');
    if (track && wrapper) {
        const cards = track.querySelectorAll('.work-card'); // cache once
        let scrollDistance = 0;

        function recomputeScrollDistance() {
            if (!cards.length) return;
            const gap = 24;       // matches CSS gap
            const trackPadding = 40; // left padding
            const cardWidth = cards[0].offsetWidth;
            const totalContent = trackPadding + (cardWidth * cards.length) + (gap * (cards.length - 1));
            scrollDistance = totalContent - wrapper.offsetWidth + 40;
        }

        recomputeScrollDistance();

        gsap.to(track, {
            x: () => -scrollDistance,
            ease: 'none',
            scrollTrigger: {
                trigger: '.work',
                start: 'top top',
                end: () => '+=' + scrollDistance,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                onRefresh: recomputeScrollDistance,
                onEnter: () => track.style.willChange = 'transform',
                onLeave: () => track.style.willChange = 'auto',
                onEnterBack: () => track.style.willChange = 'transform',
                onLeaveBack: () => track.style.willChange = 'auto',
            }
        });
    }

    // ───────────────────────────────────────────────
    // Scroll reveals
    // ───────────────────────────────────────────────
    gsap.utils.toArray('.stack, .experience, .close').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });

    // ───────────────────────────────────────────────
    // Theme toggle — single listener, dispatches CustomEvent
    // ───────────────────────────────────────────────
    let themeUpdateTimer = null;
    const themeBtn = document.getElementById('theme-toggle');
    const themeColorMeta = document.getElementById('theme-color-meta');

    function updateThemeColor(theme) {
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', theme === 'light' ? '#f5f5f5' : '#0a0a0a');
        }
    }

    // Set initial aria-pressed and theme-color on load
    if (themeBtn) themeBtn.setAttribute('aria-pressed', saved === 'dark');
    updateThemeColor(saved);

    themeBtn?.addEventListener('click', () => {
        const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        themeBtn.setAttribute('aria-pressed', next === 'dark');
        updateThemeColor(next);
        document.body.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    });

    // ───────────────────────────────────────────────
    // Header name → scroll to top
    // ───────────────────────────────────────────────
    document.querySelector('.header-name')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0, { duration: 1.5 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ───────────────────────────────────────────────
    // Background Node Graph — optimized
    // ───────────────────────────────────────────────
    const graphCanvas = document.getElementById('node-graph');
    if (graphCanvas && !prefersReducedMotion) {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Hide canvas on mobile — no animation, no compositing layer
        if (isMobile) {
            graphCanvas.style.display = 'none';
        } else {
            const ctx = graphCanvas.getContext('2d');
            let W, H;
            let mouseX = -1000, mouseY = -1000;
            const NODE_COUNT = 90;
            const CONNECTION_DIST = 160;
            const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
            const MOUSE_RADIUS = 120;
            const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
            const GRID_SIZE = CONNECTION_DIST;
            const MIN_FRAME_MS = 1000 / 120; // ~120 FPS cap

            // ── Color helpers ──
            function getColor() {
                const theme = document.body.getAttribute('data-theme');
                if (theme === 'light') return { r: 29, g: 0, b: 255 };
                return { r: 226, g: 255, b: 0 };
            }

            // Precompute all color strings — updated only on themechange
            let cachedColors = getColorStrings();
            function getColorStrings() {
                const c = getColor();
                const base = `${c.r},${c.g},${c.b}`;
                return {
                    connection: `rgba(${base},0.15)`,
                    far: `rgba(${base},0.25)`,
                    near: `rgba(${base},0.5)`
                };
            }

            const nodes = [];

            function resize() {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                W = window.innerWidth;
                H = window.innerHeight;
                graphCanvas.width = W * dpr;
                graphCanvas.height = H * dpr;
                graphCanvas.style.width = W + 'px';
                graphCanvas.style.height = H + 'px';
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            function createNodes() {
                nodes.length = 0;
                for (let i = 0; i < NODE_COUNT; i++) {
                    nodes.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        radius: Math.random() * 2.5 + 1.5,
                    });
                }
            }

            // ── Spatial grid for O(n) neighbor lookup ──
            const grid = new Map();

            function rebuildGrid() {
                grid.clear();
                for (let i = 0; i < nodes.length; i++) {
                    const cx = Math.floor(nodes[i].x / GRID_SIZE);
                    const cy = Math.floor(nodes[i].y / GRID_SIZE);
                    const key = cx + ',' + cy;
                    let bucket = grid.get(key);
                    if (!bucket) { bucket = []; grid.set(key, bucket); }
                    bucket.push(i);
                }
            }

            function draw() {
                ctx.clearRect(0, 0, W, H);

                // Update node positions
                for (const node of nodes) {
                    node.x += node.vx;
                    node.y += node.vy;

                    if (node.x < -20) node.x = W + 20;
                    if (node.x > W + 20) node.x = -20;
                    if (node.y < -20) node.y = H + 20;
                    if (node.y > H + 20) node.y = -20;

                    const dx = node.x - mouseX;
                    const dy = node.y - mouseY;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < MOUSE_RADIUS_SQ && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.8;
                        node.vx += (dx / dist) * force;
                        node.vy += (dy / dist) * force;
                    }

                    node.vx *= 0.99;
                    node.vy *= 0.99;
                }

                // Rebuild spatial grid for connection queries
                rebuildGrid();

                // Draw connections — spatial grid accelerates neighbor lookup
                ctx.beginPath();
                ctx.strokeStyle = cachedColors.connection;
                ctx.lineWidth = 0.5;

                for (let i = 0; i < nodes.length; i++) {
                    const cx = Math.floor(nodes[i].x / GRID_SIZE);
                    const cy = Math.floor(nodes[i].y / GRID_SIZE);
                    for (let gx = cx - 1; gx <= cx + 1; gx++) {
                        for (let gy = cy - 1; gy <= cy + 1; gy++) {
                            const bucket = grid.get(gx + ',' + gy);
                            if (!bucket) continue;
                            for (const j of bucket) {
                                if (j <= i) continue;
                                const dx = nodes[i].x - nodes[j].x;
                                const dy = nodes[i].y - nodes[j].y;
                                const distSq = dx * dx + dy * dy;
                                if (distSq < CONNECTION_DIST_SQ) {
                                    ctx.moveTo(nodes[i].x, nodes[i].y);
                                    ctx.lineTo(nodes[j].x, nodes[j].y);
                                }
                            }
                        }
                    }
                }
                ctx.stroke();

                // Draw far nodes — batched
                ctx.beginPath();
                ctx.fillStyle = cachedColors.far;
                for (const node of nodes) {
                    ctx.moveTo(node.x + node.radius, node.y);
                    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                }
                ctx.fill();

                // Draw near-mouse nodes — batched highlighted tier
                ctx.beginPath();
                ctx.fillStyle = cachedColors.near;
                let hasNear = false;
                for (const node of nodes) {
                    const dx = node.x - mouseX;
                    const dy = node.y - mouseY;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < MOUSE_RADIUS_SQ) {
                        const radius = node.radius * 1.5;
                        ctx.moveTo(node.x + radius, node.y);
                        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                        hasNear = true;
                    }
                }
                if (hasNear) ctx.fill();
            }

            // ── Frame-rate capped animation loop with IntersectionObserver pause ──
            let rafId = null;
            let lastFrameTime = 0;
            let isRunning = false;

            function animate(timestamp) {
                if (!isRunning) return;
                const elapsed = timestamp - lastFrameTime;
                if (elapsed >= MIN_FRAME_MS) {
                    lastFrameTime = timestamp;
                    draw();
                }
                rafId = requestAnimationFrame(animate);
            }

            function onMouseMove(e) {
                if (!isRunning) return;
                mouseX = e.clientX;
                mouseY = e.clientY;
            }

            function onMouseLeave() {
                mouseX = -1000;
                mouseY = -1000;
            }

            function startAnimation() {
                if (isRunning) return;
                isRunning = true;
                lastFrameTime = 0;
                document.addEventListener('mousemove', onMouseMove, { passive: true });
                document.addEventListener('mouseleave', onMouseLeave, { passive: true });
                rafId = requestAnimationFrame(animate);
            }

            function stopAnimation() {
                isRunning = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseleave', onMouseLeave);
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }

            // Pause canvas rendering when hero section scrolls out of view
            const heroSection = document.querySelector('.hero');
            if (heroSection && 'IntersectionObserver' in window) {
                const io = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) startAnimation();
                        else stopAnimation();
                    });
                }, { threshold: 0, rootMargin: '50px' });
                io.observe(heroSection);
            } else {
                startAnimation();
            }

            // Debounced resize — prevents array reallocation thrashing
            let resizeTimer = null;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => { resize(); createNodes(); }, 150);
            }, { passive: true });

            resize();
            createNodes();

            // Update cached colors when theme changes
            document.body.addEventListener('themechange', () => {
                clearTimeout(themeUpdateTimer);
                themeUpdateTimer = setTimeout(() => { cachedColors = getColorStrings(); }, 50);
            });
        }
    }
});
