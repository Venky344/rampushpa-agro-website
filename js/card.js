document.addEventListener('DOMContentLoaded', () => {
    // 1. Populate Links from Config
    if (window.contactConfig) {
        const config = window.contactConfig;

        // Action Buttons
        const setLink = (id, url) => {
            const el = document.getElementById(id);
            if (el) el.href = url;
        };

        setLink('btn-call', `tel:${config.phones[0].number}`);
        setLink('btn-whatsapp', `https://wa.me/${config.phones[0].number.replace('+', '')}`);
        setLink('btn-email', `mailto:${config.email}`);
        setLink('btn-website', config.website);
        
        const addressQuery = encodeURIComponent(config.address.display);
        setLink('btn-directions', `https://www.google.com/maps/search/?api=1&query=${addressQuery}`);
        setLink('btn-brochure', config.brochureUrl);
        setLink('btn-instagram', config.socials.instagram);
        setLink('btn-facebook', config.socials.facebook);

        // Social Icons Footer
        setLink('social-instagram', config.socials.instagram);
        setLink('social-facebook', config.socials.facebook);
        setLink('social-website', config.website);
        setLink('social-email', `mailto:${config.email}`);
        setLink('social-phone', `tel:${config.phones[0].number}`);
        setLink('social-whatsapp', `https://wa.me/${config.phones[0].number.replace('+', '')}`);

        // Sticky Bar
        setLink('sticky-call', `tel:${config.phones[0].number}`);
        setLink('sticky-whatsapp', `https://wa.me/${config.phones[0].number.replace('+', '')}`);
        setLink('sticky-directions', `https://www.google.com/maps/search/?api=1&query=${addressQuery}`);
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
