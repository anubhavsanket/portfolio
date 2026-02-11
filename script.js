// Theme Toggle Logic (Runs immediately)
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
};

initTheme();

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Button
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // 0. Custom Cursor Logic
    const cursor = document.querySelector('.cursor');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.opacity = '1';
    });

    const hideCursor = () => {
        cursor.style.opacity = '0';
    };

    document.addEventListener('mouseleave', hideCursor);
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget) hideCursor();
    });
    window.addEventListener('blur', hideCursor);

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });

    // 1. Staggered Scroll Animations
    const glassTiles = document.querySelectorAll('.glass-tile');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    glassTiles.forEach((tile, index) => {
        // Set custom property for CSS stagger calculation
        tile.style.setProperty('--tile-index', index % 3); // Reset stagger every 3 items for grid flows
        observer.observe(tile);
    });

    // 3. Pinned Parallax Projects Effect
    const projectsScroll = document.getElementById('projects-scroll');
    const projectCards = document.querySelectorAll('.project-card[data-project-index]');
    const parallaxSection = document.querySelector('.parallax-projects');

    if (projectsScroll && projectCards.length > 0 && parallaxSection) {
        window.addEventListener('scroll', () => {
            const sectionRect = parallaxSection.getBoundingClientRect();
            const sectionHeight = parallaxSection.offsetHeight;
            const scrollProgress = Math.max(0, Math.min(1, -sectionRect.top / (sectionHeight - window.innerHeight)));

            // Move content based on scroll
            const maxScroll = projectsScroll.scrollHeight - projectsScroll.parentElement.offsetHeight;
            const scrollAmount = scrollProgress * maxScroll;
            projectsScroll.style.transform = `translateY(-${scrollAmount}px)`;

            // Highlight active card
            const cardHeight = projectCards[0].offsetHeight + 80; // card height + gap
            const activeIndex = Math.floor(scrollProgress * projectCards.length);

            projectCards.forEach((card, index) => {
                if (index === activeIndex) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        });
    }

    // 4. Hero Name to Header Merge Effect
    const heroName = document.querySelector('.hero-name');
    const heroSection = document.querySelector('.hero-section');

    console.log('Hero Name Fade Effect:', {
        heroName: !!heroName,
        heroSection: !!heroSection
    });

    if (heroName && heroSection) {
        window.addEventListener('scroll', () => {
            const heroRect = heroSection.getBoundingClientRect();
            const fadeStart = window.innerHeight * 0.3;

            if (heroRect.bottom < fadeStart) {
                heroName.classList.add('fading');
                console.log('Hero name fading - added class');
            } else {
                heroName.classList.remove('fading');
            }
        });
        console.log('Hero fade effect initialized successfully');
    } else {
        console.warn('Hero fade effect NOT initialized - missing elements');
    }

    // Log parallax effect status
    console.log('Parallax Effect:', {
        projectsScroll: !!projectsScroll,
        projectCards: projectCards.length,
        parallaxSection: !!parallaxSection,
        initialized: !!(projectsScroll && projectCards.length > 0 && parallaxSection)
    });
});
