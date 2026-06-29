/**
 * Configuration file for Rampushpa Agro Processing digital business card.
 * Centralizes all contact details so they can be easily updated in one place.
 */

const contactConfig = {
    companyName: "Rampushpa Agro Processing",
    tagline: "Quality Grains. Pure Trust.",
    established: "2017",
    phones: [
        { label: "Sales 1", number: "+917721931794", display: "+91 7721931794" },
        { label: "Sales 2", number: "+917588950505", display: "+91 7588950505" }
    ],
    email: "rampushpaagro@gmail.com",
    website: "https://rampushpaagro.in",
    address: {
        street: "PLOT C/15 MIDC",
        city: "BEED",
        state: "Maharashtra",
        pincode: "431122",
        country: "India",
        display: "PLOT C/15 MIDC, BEED - 431122"
    },
    socials: {
        instagram: "https://www.instagram.com/rampushpa_agro?igsh=MXRmenFrb2p3amp6cg%3D%3D&utm_source=qr",
        facebook: "https://www.facebook.com/share/1CnvmJxfPW/?mibextid=wwXIfr"
    },
    brochureUrl: "/company-profile"
};

// Make it available globally
window.contactConfig = contactConfig;
