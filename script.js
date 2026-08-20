// Theme
const saved = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', saved);

document.addEventListener('DOMContentLoaded', () => {
    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lenis — skip smooth scroll for reduced motion
    const lenis = new Lenis({
        duration: prefersReducedMotion ? 0 : 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: !prefersReducedMotion
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Hero name stagger — clean vertical slide, no rotation
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
        }
    }

    // Hero meta + footer fade in
    if (typeof anime !== 'undefined' && !prefersReducedMotion) {
        anime.timeline({ delay: 800 })
            .add({ targets: '.hero-meta', opacity: [0,1], translateY: [10,0], duration: 500, easing: 'easeOutCubic' })
            .add({ targets: '.hero-subtitle', opacity: [0,1], translateY: [10,0], duration: 500, easing: 'easeOutCubic' }, '-=200')
            .add({ targets: '.hero-footer', opacity: [0,1], translateY: [15,0], duration: 600, easing: 'easeOutCubic' }, '-=200');
    }
    ['.hero-meta', '.hero-subtitle', '.hero-footer'].forEach(s => { const el = document.querySelector(s); if (el) el.style.opacity = '0'; });

    // Horizontal scroll for projects
    const track = document.querySelector('.work-track');
    const wrapper = document.querySelector('.work-track-wrapper');
    if (track && wrapper) {
        const getScrollWidth = () => {
            const cards = track.querySelectorAll('.work-card');
            const gap = 24; // matches CSS gap
            const trackPadding = 40; // left padding
            const cardWidth = cards[0].offsetWidth;
            const totalContent = trackPadding + (cardWidth * cards.length) + (gap * (cards.length - 1));
            return totalContent - wrapper.offsetWidth + 40;
        };
        gsap.to(track, {
            x: () => -getScrollWidth(),
            ease: 'none',
            scrollTrigger: {
                trigger: '.work',
                start: 'top top',
                end: () => '+=' + getScrollWidth(),
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
            }
        });
    }

    // Scroll reveals
    gsap.utils.toArray('.stack, .experience, .close').forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const next = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // Header name → scroll to top
    document.querySelector('.header-name')?.addEventListener('click', (e) => {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.5 });
    });

    // ───────────────────────────────────────────────
    // Background Node Graph — optimized
    // ───────────────────────────────────────────────
    const graphCanvas = document.getElementById('node-graph');
    if (graphCanvas && !prefersReducedMotion) {
        const ctx = graphCanvas.getContext('2d');
        let W, H;
        let mouseX = -1000, mouseY = -1000;
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const NODE_COUNT = isMobile ? 30 : 90;
        const CONNECTION_DIST = 160;
        const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
        const MOUSE_RADIUS = 120;
        const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
        const MIN_FRAME_MS = 1000 / 120; // ~120 FPS cap

        // Cached theme color — updated only on toggle, not per-frame
        let cachedColor = getColor();
        function getColor() {
            const theme = document.body.getAttribute('data-theme');
            if (theme === 'light') return { r: 29, g: 0, b: 255 };
            return { r: 226, g: 255, b: 0 };
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

        function draw() {
            ctx.clearRect(0, 0, W, H);
            if (isMobile) return;

            const col = cachedColor;
            const colorStr = `${col.r},${col.g},${col.b}`;

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

            // Draw connections — batched into single path, distance-squared pre-filter
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${colorStr},0.15)`;
            ctx.lineWidth = 0.5;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < CONNECTION_DIST_SQ) {
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                    }
                }
            }
            ctx.stroke();

            // Draw nodes — batched into two tiers (near-mouse and far) for fewer state changes
            ctx.beginPath();
            ctx.fillStyle = `rgba(${colorStr},0.25)`;
            for (const node of nodes) {
                ctx.moveTo(node.x + node.radius, node.y);
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            }
            ctx.fill();

            // Near-mouse nodes (highlighted tier)
            ctx.beginPath();
            ctx.fillStyle = `rgba(${colorStr},0.5)`;
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

        // Frame-rate capped animation loop with IntersectionObserver pause
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

        function startAnimation() {
            if (isRunning || isMobile) return;
            isRunning = true;
            lastFrameTime = 0;
            rafId = requestAnimationFrame(animate);
        }

        function stopAnimation() {
            isRunning = false;
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
            }, { threshold: 0 });
            io.observe(heroSection);
        } else {
            if (!isMobile) startAnimation();
        }

        // Passive mouse listeners
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        }, { passive: true });

        // Debounced resize — prevents array reallocation thrashing
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { resize(); createNodes(); }, 150);
        }, { passive: true });

        resize();
        createNodes();

        // Update cached color when theme toggles
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                setTimeout(() => { cachedColor = getColor(); }, 50);
            });
        }
    }

    // Year
    const y = document.getElementById('current-year');
    if (y) y.textContent = new Date().getFullYear();

});
