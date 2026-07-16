// Script for Rampushpa Website

document.addEventListener('DOMContentLoaded', () => {
    // 1. React Bits Card Nav (Vanilla Port)
    const cardNavContainer = document.querySelector('.card-nav-container');
    const cardNav = document.getElementById('react-bits-card-nav');
    const hamburger = document.getElementById('card-nav-hamburger');
    const content = document.getElementById('card-nav-content');
    const cards = document.querySelectorAll('.nav-card-item');

    if (cardNav && hamburger && content) {
        let isExpanded = false;
        let tl = null;

        const calculateHeight = () => {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (isMobile) {
                const wasVisible = content.style.visibility;
                const wasPointerEvents = content.style.pointerEvents;
                const wasPosition = content.style.position;
                const wasHeight = content.style.height;

                content.style.visibility = 'visible';
                content.style.pointerEvents = 'auto';
                content.style.position = 'static';
                content.style.height = 'auto';

                // Trigger reflow
                void content.offsetHeight;

                const topBar = 60;
                const padding = 16;
                const contentHeight = content.scrollHeight;

                content.style.visibility = wasVisible;
                content.style.pointerEvents = wasPointerEvents;
                content.style.position = wasPosition;
                content.style.height = wasHeight;

                return topBar + contentHeight + padding;
            }
            return 260; // Desktop height
        };

        const createTimeline = () => {
            if (typeof gsap === 'undefined') return null;
            
            gsap.set(cardNav, { height: 60, overflow: 'hidden' });
            gsap.set(cards, { y: 50, opacity: 0 });

            const newTl = gsap.timeline({ paused: true });

            newTl.to(cardNav, {
                height: calculateHeight,
                duration: 0.4,
                ease: 'power3.out'
            });

            newTl.to(cards, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '-=0.1');

            return newTl;
        };

        // Initialize timeline
        setTimeout(() => {
            tl = createTimeline();
        }, 100);

        window.addEventListener('resize', () => {
            if (!tl) return;

            if (isExpanded) {
                const newHeight = calculateHeight();
                gsap.set(cardNav, { height: newHeight });

                tl.kill();
                tl = createTimeline();
                if (tl) tl.progress(1);
            } else {
                tl.kill();
                tl = createTimeline();
            }
        });

        const toggleMenu = () => {
            if (!tl) return;

            if (!isExpanded) {
                hamburger.classList.add('open');
                hamburger.setAttribute('aria-expanded', 'true');
                cardNav.classList.add('open');
                content.setAttribute('aria-hidden', 'false');
                isExpanded = true;
                tl.play(0);
            } else {
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                tl.eventCallback('onReverseComplete', () => {
                    cardNav.classList.remove('open');
                    content.setAttribute('aria-hidden', 'true');
                    isExpanded = false;
                });
                tl.reverse();
            }
        };

        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (isExpanded && !cardNavContainer.contains(e.target)) {
                toggleMenu();
            }
        });

        // Close menu on pageshow (e.g. back button restoring from bfcache)
        window.addEventListener('pageshow', (e) => {
            if (e.persisted && isExpanded) {
                // Force close without animation
                hamburger.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                cardNav.classList.remove('open');
                content.setAttribute('aria-hidden', 'true');
                isExpanded = false;
                if (tl) {
                    tl.progress(0);
                    tl.pause();
                }
            }
        });
    }

    // 2. Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // 3. Header Scroll Effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 6. Inject WhatsApp Floating Button (Removed in favor of HTML Glassmorphism widget)


    // 7. Product Filter Logic (Removed)

    // 8. Hero Image Slider with Controls
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (sliderTrack && slides.length > 0) {
        let currentSlide = 0;
        const totalSlides = slides.length;
        let slideInterval;
        let resumeTimeout;

        function updateSlider() {
            sliderTrack.style.transform = `translateX(-${currentSlide * 25}%)`; // 25% because width is 400% for 4 slides
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        function startAutoSlide() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
        }

        function stopAutoSlide() {
            clearInterval(slideInterval);
            clearTimeout(resumeTimeout);
        }

        // Initialize
        startAutoSlide();

        // Event Listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                // Resume after 5 seconds
                resumeTimeout = setTimeout(startAutoSlide, 5000);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                resumeTimeout = setTimeout(startAutoSlide, 5000);
            });
        }
    }

    // 9. Resources Mobile Dropdown Toggle
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    }
    // 10. FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                const answer = faq.querySelector('.faq-answer');
                if (answer) answer.style.maxHeight = null;
            });

            // Open clicked item if it wasn't already open
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            }
        });
    });
});
