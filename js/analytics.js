/**
 * Google Analytics 4 (GA4) Integration Module
 * 
 * INSTRUCTIONS FOR ADDING GOOGLE ANALYTICS:
 * 1. Go to analytics.google.com and create a property.
 * 2. Get your "Measurement ID" (It starts with "G-").
 * 3. Replace the placeholder 'GA_MEASUREMENT_ID' below with your actual ID.
 */

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // <-- PLACE YOUR GOOGLE ANALYTICS MEASUREMENT ID HERE

if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    // Inject the GA script dynamically
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize the dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
} else {
    console.info('Google Analytics is not configured. Add your Measurement ID to js/analytics.js');
}
