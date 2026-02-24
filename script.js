// Theme Toggle Logic (Runs immediately)
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
};

initTheme();

document.addEventListener('DOMContentLoaded', () => {

    // ───────────────────────────────────────────────
    // 1. Lenis Smooth Scroll
    // ───────────────────────────────────────────────
    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.8,
        infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(500, 33); // Allow some lag smoothing for low-fps recovery

    // ───────────────────────────────────────────────
    // 2. Custom Cursor
    // ───────────────────────────────────────────────
    const cursor = document.querySelector('.cursor');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.opacity = '1';
    });

    const hideCursor = () => { cursor.style.opacity = '0'; };
    document.addEventListener('mouseleave', hideCursor);
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) hideCursor(); });
    window.addEventListener('blur', hideCursor);
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

    // Restored default cursor: no scaling on hover; cursor follows mouse only.

    // ───────────────────────────────────────────────
    // 3. Tile Scroll Reveal (GSAP scroll-driven, no float)
    //    Replaces IntersectionObserver + float animation
    // ───────────────────────────────────────────────
    const glassTiles = document.querySelectorAll('.glass-tile, .about-glass-tile');

    glassTiles.forEach((tile, index) => {
        // Mark as visible immediately to disable opacity:0 default
        tile.classList.add('visible');

        gsap.fromTo(tile,
            { opacity: 0, y: 40, scale: 0.97 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                delay: (index % 3) * 0.08,
                scrollTrigger: {
                    trigger: tile,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                }
            }
        );
    });

    // ───────────────────────────────────────────────
    // 4. Global Data-Speed Parallax (now with scrub for smoothness)
    // ───────────────────────────────────────────────
    gsap.utils.toArray('[data-speed]').forEach(el => {
        const speed = parseFloat(el.getAttribute('data-speed'));
        gsap.to(el, {
            y: () => (1 - speed) * (window.innerHeight * 0.5),
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                invalidateOnRefresh: true,
                scrub: 0.8  // Smooth scrub matched to Lenis feel
            }
        });
    });

    // ───────────────────────────────────────────────
    // 5. Theme Toggle
    // ───────────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // ───────────────────────────────────────────────
    // 6. Pinned Parallax Projects Effect (GSAP)
    // ───────────────────────────────────────────────
    const projectsScroll = document.getElementById('projects-scroll');
    const projectCards = document.querySelectorAll('.project-card[data-project-index]');
    const parallaxSection = document.querySelector('.parallax-projects');

    if (projectsScroll && projectCards.length > 0 && parallaxSection) {
        gsap.to(projectsScroll, {
            y: () => -(projectsScroll.scrollHeight - projectsScroll.parentElement.offsetHeight),
            ease: "none",
            scrollTrigger: {
                trigger: parallaxSection,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const activeIndex = Math.min(
                        projectCards.length - 1,
                        Math.floor(self.progress * projectCards.length)
                    );
                    projectCards.forEach((card, index) => {
                        card.classList.toggle('active', index === activeIndex);
                    });
                }
            }
        });
    }

    // ───────────────────────────────────────────────
    // 7. About Me Parallax Effect
    // ───────────────────────────────────────────────
    const aboutScroll = document.getElementById('about-scroll');
    const aboutViewport = aboutScroll ? aboutScroll.closest('.about-scroll-viewport') : null;
    const parallaxAboutSection = document.querySelector('.parallax-about');

    if (aboutScroll && aboutViewport && parallaxAboutSection && window.innerWidth > 900) {
        gsap.to(aboutScroll, {
            y: () => -(aboutScroll.scrollHeight - aboutViewport.offsetHeight),
            ease: "none",
            scrollTrigger: {
                trigger: parallaxAboutSection,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2,
                invalidateOnRefresh: true
            }
        });
    }

    // ───────────────────────────────────────────────
    // 8. Update Footer Year
    // ───────────────────────────────────────────────
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    console.log('Portfolio: Lenis + GSAP fully initialized.');
});

