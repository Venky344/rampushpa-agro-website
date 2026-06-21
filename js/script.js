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
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.002 1.299.38 2.525 1.104 3.565l-1.168 4.268 4.38-1.149c1.006.549 2.132.843 3.282.843h.005c3.181 0 5.768-2.586 5.769-5.768 0-1.541-.6-2.99-1.684-4.075-1.085-1.085-2.531-1.681-4.076-1.681zm6.983 8.35c-.244-.122-1.444-.712-1.667-.793-.223-.082-.385-.122-.547.122-.162.244-.629.793-.77.955-.142.163-.284.183-.528.061-.244-.122-1.028-.379-1.959-1.209-.728-.65-1.22-1.453-1.362-1.698-.142-.244-.015-.376.107-.497.11-.11.244-.285.366-.427.122-.142.163-.244.244-.407.081-.162.041-.305-.02-.427-.061-.122-.547-1.32-.75-1.808-.198-.475-.4-.41-.547-.417h-.467c-.162 0-.427.061-.65.305-.223.244-.853.834-.853 2.035 0 1.201.874 2.361.996 2.524.122.162 1.718 2.624 4.162 3.679 1.579.681 2.196.681 2.973.638.86-.048 1.444-.59 1.647-1.159.203-.569.203-1.057.142-1.159-.061-.102-.224-.163-.468-.285z"/>
        </svg>
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
