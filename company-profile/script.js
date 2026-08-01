/**
 * Javascript controller for the Rampushpa Agro Processing Company Profile Page
 * Handles scrolling navigation tracking, dark mode toggling, sharing, and print triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Dark Mode Toggle
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    
    // Check local storage for preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (darkModeBtn) {
            darkModeBtn.innerHTML = '☀️ <span>Light Mode</span>';
        }
    }

    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            let theme = 'light';
            if (document.body.classList.contains('dark-mode')) {
                theme = 'dark';
                darkModeBtn.innerHTML = '☀️ <span>Light Mode</span>';
            } else {
                darkModeBtn.innerHTML = '🌙 <span>Dark Mode</span>';
            }
            localStorage.setItem('theme', theme);
        });
    }

    // 2. Active Page Tracking (Intersection Observer)
    const pages = document.querySelectorAll('.brochure-page');
    const navItems = document.querySelectorAll('.nav-item');
    const dockItems = document.querySelectorAll('.dock-item');
    
    const observerOptions = {
        root: null, // Viewport
        threshold: 0.4, // Trigger when 40% of the page is visible
        rootMargin: '-10% 0px -10% 0px'
    };

    const pageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                
                // Add active visibility animation class
                pages.forEach(p => p.classList.remove('active-visible-page'));
                entry.target.classList.add('active-visible-page');
                
                // Update Desktop Navigator
                navItems.forEach(item => {
                    if (item.getAttribute('href') === `#${activeId}`) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                
                // Update Mobile Bottom Dock
                dockItems.forEach(item => {
                    if (item.getAttribute('href') === `#${activeId}`) {
                        item.classList.add('active');
                        // Center active item in bottom dock scroll
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    pages.forEach(page => pageObserver.observe(page));

    // 3. Smooth scroll navigator behavior
    const allLinks = document.querySelectorAll('.nav-item, .dock-item');
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Scroll to target page offset with some top padding for sticky bar
                const yOffset = -70; 
                const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });

    // 4. Print / PDF Save Actions
    const printBtns = document.querySelectorAll('.btn-print');
    printBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.print();
        });
    });

    // 5. Share Button Action
    const shareBtn = document.getElementById('share-profile');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Rampushpa Agro Processing - Company Profile',
                text: 'Official Company Profile brochure of Rampushpa Agro Processing, Beed, Maharashtra.',
                url: window.location.origin + window.location.pathname
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log('Web Share rejected or failed', err);
                }
            } else {
                // Clipboard fallback
                try {
                    await navigator.clipboard.writeText(shareData.url);
                    showToast('Link copied to clipboard!');
                } catch (err) {
                    showToast('Failed to copy link. Please copy URL from browser.');
                }
            }
        });
    }

    // Toast Notification helper
    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span>ℹ️</span> ${message}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 6. Check for URL print trigger (?print=true or ?download=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('print') === 'true' || urlParams.get('download') === 'true') {
        // Wait briefly for resources to render
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.print();
            }, 1000);
        });
    }
});
