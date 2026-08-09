// Theme
const saved = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', saved);

document.addEventListener('DOMContentLoaded', () => {
    // Lenis
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));

    // Hero name stagger
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
                heroName.appendChild(span);
            }
        }
        const chars = heroName.querySelectorAll('.char');
        chars.forEach(c => { c.style.opacity = '0'; c.style.display = 'inline-block'; });

        anime.timeline({ delay: 200 })
            .add({ targets: chars, opacity: [0,1], translateY: [40,0], rotateX: [-30,0], duration: 900, easing: 'easeOutExpo', delay: anime.stagger(35) });
    }

    // Hero meta + footer fade in
    if (typeof anime !== 'undefined') {
        anime.timeline({ delay: 800 })
            .add({ targets: '.hero-meta', opacity: [0,1], translateY: [10,0], duration: 500, easing: 'easeOutCubic' })
            .add({ targets: '.hero-footer', opacity: [0,1], translateY: [15,0], duration: 600, easing: 'easeOutCubic' }, '-=200');
    }
    ['.hero-meta', '.hero-footer'].forEach(s => { const el = document.querySelector(s); if (el) el.style.opacity = '0'; });

    // Horizontal scroll for projects
    const track = document.querySelector('.work-track');
    const wrapper = document.querySelector('.work-track-wrapper');
    if (track && wrapper) {
        const getScrollWidth = () => track.scrollWidth - wrapper.offsetWidth;
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
    gsap.utils.toArray('.about, .stack, .archive, .footer').forEach(el => {
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

    // ───────────────────────────────────────────────
    // Background Node Graph
    // ───────────────────────────────────────────────
    const graphCanvas = document.getElementById('node-graph');
    if (graphCanvas) {
        const ctx = graphCanvas.getContext('2d');
        let W, H;
        let mouseX = -1000, mouseY = -1000;
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const NODE_COUNT = isMobile ? 30 : 90;
        const CONNECTION_DIST = 160;
        const MOUSE_RADIUS = 120;

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

        function getColor() {
            const theme = document.body.getAttribute('data-theme');
            if (theme === 'light') return { r: 29, g: 0, b: 255 };
            return { r: 226, g: 255, b: 0 };
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            if (isMobile) return; // Static on mobile

            const col = getColor();

            // Update positions
            for (const node of nodes) {
                node.x += node.vx;
                node.y += node.vy;

                // Wrap around edges
                if (node.x < -20) node.x = W + 20;
                if (node.x > W + 20) node.x = -20;
                if (node.y < -20) node.y = H + 20;
                if (node.y > H + 20) node.y = -20;

                // Mouse repulsion
                const dx = node.x - mouseX;
                const dy = node.y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.8;
                    node.vx += (dx / dist) * force;
                    node.vy += (dy / dist) * force;
                }

                // Damping
                node.vx *= 0.99;
                node.vy *= 0.99;
            }

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            for (const node of nodes) {
                // Check if near mouse for glow
                const dx = node.x - mouseX;
                const dy = node.y - mouseY;
                const distToMouse = Math.sqrt(dx * dx + dy * dy);
                const nearMouse = distToMouse < MOUSE_RADIUS;

                const alpha = nearMouse ? 0.5 : 0.25;
                const radius = nearMouse ? node.radius * 1.5 : node.radius;

                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
                ctx.fill();

                // Glow for mouse-near nodes
                if (nearMouse) {
                    const glowAlpha = (1 - distToMouse / MOUSE_RADIUS) * 0.15;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${glowAlpha})`;
                    ctx.fill();
                }
            }
        }

        function animate() {
            draw();
            requestAnimationFrame(animate);
        }

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        resize();
        createNodes();
        window.addEventListener('resize', () => { resize(); createNodes(); });
        if (!isMobile) animate();
    }

    // Year
    const y = document.getElementById('current-year');
    if (y) y.textContent = new Date().getFullYear();

});
