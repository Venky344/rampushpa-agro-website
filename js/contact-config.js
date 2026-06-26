/**
 * Configuration file for Rampushpa Agro Processing digital business card.
 * Centralizes all contact details so they can be easily updated in one place.
 */

const contactConfig = {
    companyName: "Rampushpa Agro Processing",
    tagline: "Quality Grains. Pure Trust.",
    established: "2017",
    phones: [
        { label: "Primary", number: "+919422931794", display: "+91 9422931794" },
        { label: "Secondary", number: "+919422650505", display: "+91 9422650505" }
    ],
    email: "rampushpaagro@gmail.com",
    website: "https://rampushpaagro.in",
    address: {
        street: "PLOT C/15",
        city: "BEED",
        state: "Maharashtra",
        pincode: "431122",
        country: "India",
        display: "PLOT C/15, BEED - 431122"
    },
    socials: {
        instagram: "https://www.instagram.com/rampushpa_agro?igsh=MXRmenFrb2p3amp6cg%3D%3D&utm_source=qr",
        facebook: "https://www.facebook.com/share/1CnvmJxfPW/?mibextid=wwXIfr"
    },
    brochureUrl: "#" // Replace with actual PDF URL when available
};

// Make it available globally
window.contactConfig = contactConfig;
