// Script for Rampushpa Website

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('open');
            // Animate hamburger to X
            const spans = mobileMenuBtn.querySelectorAll('span');
            if (mobileMenuBtn.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
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

    // 6. Inject WhatsApp Floating Button
    const waButton = document.createElement('a');
    waButton.href = "https://api.whatsapp.com/send?phone=919422650505"; // Official Rampushpa Number (Updated)
    waButton.className = "whatsapp-float";
    waButton.target = "_blank";
    waButton.setAttribute("aria-label", "Chat on WhatsApp");
    waButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.3c-32.9 0-65.1-8.8-93.5-25.5l-6.7-4-69.5 18.2L72.8 333l-4.4-7c-18.3-29.2-28-63-28-98 0-101.4 82.5-183.8 184-183.8 49.1 0 95.3 19.1 130 53.9 34.8 34.7 54 80.9 54 130.1 0 101.4-82.5 183.9-184.5 183.9zm101-137.9c-5.5-2.8-32.8-16.2-37.9-18s-8.8-2.8-12.5 2.8c-3.7 5.6-14.3 18-17.6 21.6-3.2 3.7-6.5 4.1-12 1.4-5.5-2.8-23.4-8.6-44.6-27.6-16.4-14.8-27.5-33.1-30.7-38.6-3.2-5.6-.3-8.6 2.4-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.6 5.5-9.3 1.8-3.7 .9-7-4.4-12.5s-27.5-66.4-37.7-90.8c-9.9-23.6-20.1-20.4-27.5-20.8-7.2-.3-15.5-.3-23.8-.3-8.3 0-21.8 3.1-33.2 15.8s-43.5 42.5-43.5 103.8 44.6 121.5 50.8 129.8c6.2 8.3 88.5 135 214.3 189.1 29.9 12.8 53.3 20.4 71.6 26.1 30.1 9.6 57.5 8.2 79.2 4.9 24.3-3.7 74.8-30.5 85.3-60 10.5-29.5 10.5-54.8 7.4-60-3.2-5.2-11.6-8.2-17.1-11z"/></svg>
    `;
    document.body.appendChild(waButton);

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

    // 9. Contact Form Logic (Removed - using mailto directly in HTML)
});
