/**
 * Rampushpa Agro Company Profile - Premium Corporate Storytelling Page Controller
 * Handles scroll progress, intersection observer reveals, stats counter animations, and GLightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Progress Bar Logic
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (windowScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // 2. Intersection Observer for Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.story-reveal');
    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger stat counters if present inside this element
                const counters = entry.target.querySelectorAll('.stat-number');
                if (counters.length > 0) {
                    counters.forEach(counter => animateCounter(counter));
                }
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Stats Counter Animation Logic
    function animateCounter(counterElement) {
        const target = +counterElement.getAttribute('data-target');
        const isYear = counterElement.getAttribute('data-year') === 'true';
        const speed = isYear ? 1.5 : 100; // custom speed modifier
        
        let count = 0;
        if (isYear) count = target - 100; // start counting from 100 years back for speed

        const updateCount = () => {
            const increment = Math.ceil((target - count) / 15);
            if (count < target) {
                count += increment;
                counterElement.innerText = count + (isYear ? '' : '+');
                setTimeout(updateCount, 40);
            } else {
                counterElement.innerText = target + (isYear ? '' : '+');
            }
        };
        updateCount();
    }

    // 4. GLightbox Initialization for Asymmetric Magazine Gallery
    if (typeof GLightbox !== 'undefined') {
        GLightbox({
            selector: '.glightbox-gallery',
            loop: true,
            openEffect: 'fade',
            closeEffect: 'fade'
        });
    }
});
