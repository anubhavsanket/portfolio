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

    // Year
    const y = document.getElementById('current-year');
    if (y) y.textContent = new Date().getFullYear();
});
