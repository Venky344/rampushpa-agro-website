document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate Links from Config
    if (window.contactConfig) {
        const config = window.contactConfig;

        // Action Buttons
        const setLink = (id, url) => {
            const el = document.getElementById(id);
            if (el) el.href = url;
        };

        setLink('btn-email', `mailto:${config.email}`);
        setLink('btn-website', config.website);
        setLink('btn-brochure', '/company-profile');
        setLink('btn-instagram', config.socials.instagram);
        setLink('btn-facebook', config.socials.facebook);

        // Social Icons Footer
        setLink('social-instagram', config.socials.instagram);
        setLink('social-facebook', config.socials.facebook);
        setLink('social-website', config.website);
        setLink('social-email', `mailto:${config.email}`);

        // Popups Triggering Setup
        const callPopup = document.getElementById('call-popup');
        const whatsappPopup = document.getElementById('whatsapp-popup');

        const showPopup = (popup) => {
            if (popup) {
                popup.classList.add('active');
                popup.setAttribute('aria-hidden', 'false');
            }
        };

        const hidePopup = (popup) => {
            if (popup) {
                popup.classList.remove('active');
                popup.setAttribute('aria-hidden', 'true');
            }
        };

        const setupPopupTriggers = (triggerIds, popup) => {
            triggerIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        showPopup(popup);
                    });
                }
            });
        };

        setupPopupTriggers(['btn-call', 'sticky-call', 'social-phone'], callPopup);
        setupPopupTriggers(['btn-whatsapp', 'sticky-whatsapp', 'social-whatsapp'], whatsappPopup);

        // Close triggers
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(closeEl => {
            closeEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                    hidePopup(callPopup);
                    hidePopup(whatsappPopup);
                }
            });
        });

        // Copy buttons logic
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-copy');
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '📋 Copied!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            });
        });

        // Directions platform redirection logic
        const handleDirections = (e) => {
            e.preventDefault();
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const isAndroid = /Android/.test(navigator.userAgent);
            const gmapsUrl = "https://maps.app.goo.gl/pSyHA8PP8LjzmRVs6";
            
            if (isIOS) {
                window.open("maps://?daddr=18.988226,75.772590&q=Rampushpa+Agro+Processing", "_self");
                setTimeout(() => {
                    window.open(gmapsUrl, "_blank");
                }, 2000);
            } else {
                window.open(gmapsUrl, "_blank");
            }
        };

        const dirBtn = document.getElementById('btn-directions');
        const stickyDirBtn = document.getElementById('sticky-directions');
        if (dirBtn) dirBtn.addEventListener('click', handleDirections);
        if (stickyDirBtn) stickyDirBtn.addEventListener('click', handleDirections);
    }

    // 2. VCF Generation Logic
    const generateVCF = () => {
        if (!window.contactConfig) return;
        const config = window.contactConfig;

        // Build VCF string (vCard version 3.0)
        let vcf = "BEGIN:VCARD\nVERSION:3.0\n";
        vcf += `FN:${config.companyName}\n`;
        vcf += `ORG:${config.companyName}\n`;
        
        config.phones.forEach(p => {
            vcf += `TEL;TYPE=WORK,VOICE:${p.number}\n`;
        });
        
        vcf += `EMAIL;TYPE=WORK,INTERNET:${config.email}\n`;
        vcf += `URL:${config.website}\n`;
        
        // ADR;TYPE=WORK:;;Street;City;State;Zip;Country
        vcf += `ADR;TYPE=WORK:;;${config.address.street};${config.address.city};${config.address.state};${config.address.pincode};${config.address.country}\n`;
        
        vcf += "END:VCARD";

        // Create Blob and trigger download
        const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${config.companyName.replace(/\s+/g, '_')}_Contact.vcf`;
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Attach to both Save Contact buttons
    const btnSave = document.getElementById('btn-save-contact');
    const stickySave = document.getElementById('sticky-save');

    if (btnSave) btnSave.addEventListener('click', generateVCF);
    if (stickySave) stickySave.addEventListener('click', generateVCF);


    // 3. Web Share API for "Share Business Card"
    const btnShare = document.getElementById('btn-share');
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: window.contactConfig ? window.contactConfig.companyName : 'Rampushpa Agro Processing',
                        text: 'Check out the digital business card for Rampushpa Agro Processing',
                        url: window.location.href,
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(window.location.href).then(() => {
                    const originalText = btnShare.querySelector('.btn-text').innerText;
                    btnShare.querySelector('.btn-text').innerText = 'Link Copied!';
                    setTimeout(() => {
                        btnShare.querySelector('.btn-text').innerText = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy link: ', err);
                });
            }
        });
    }

    // 4. Scroll Animations Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
});
