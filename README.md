# Rampushpa Agro Processing Website

A professional, high-performance static business website for Rampushpa Agro Processing, a premium agricultural processing company specializing in wheat and pulses. 

## Project Description

This project provides a premium online presence for Rampushpa Agro Processing. It serves as a digital brochure and trust-building platform for B2B and B2C clients. The website is fully static, designed for instant loading times, and heavily optimized for Search Engine Optimization (SEO) and deployment on Vercel or GitHub Pages.

## Features

- **Blazing Fast Performance**: 100% static assets utilizing optimized WebP imagery and lazy loading.
- **SEO Optimized**: Includes meta tags, canonical URLs, Open Graph parameters, `sitemap.xml`, and `robots.txt`.
- **Responsive Design**: Flawlessly adapts to all screen sizes (mobile, tablet, desktop) using modern CSS layouts.
- **Premium Aesthetics**: Features a professional color palette, glassmorphism UI elements, and subtle micro-animations to engage visitors.
- **Business Trust Elements**: Highlights infrastructure capabilities, location details, and direct contact methods (WhatsApp/Email).
- **Vercel Ready**: Pre-configured `vercel.json` for clean URLs and advanced cache headers.

## Folder Structure

```text
/
├── assets/
│   ├── images/       # WebP product imagery (Mogra, Pranjal, etc.)
│   └── logos/        # Brand logos
├── css/
│   └── styles.css    # Core styling and animations
├── js/
│   └── script.js     # UI interactions (mobile menu, sliders, observers)
├── seo/
│   ├── robots.txt    # Crawler instructions
│   └── sitemap.xml   # URL map for indexing
├── about.html        # Company story and mission
├── contact.html      # Location and direct inquiry form
├── index.html        # Landing page
├── products.html     # Product catalog grid
├── vercel.json       # Vercel deployment configuration
└── .gitignore        # Git exclusion list
```

## Technologies Used

- **HTML5**: Semantic markup for accessibility and structure.
- **CSS3**: Custom vanilla CSS utilizing variables, flexbox, grid, and keyframe animations (No external frameworks for minimal footprint).
- **Vanilla JavaScript**: Lightweight ES6+ scripts for interactive elements like the hero slider and scroll animations.

## Local Run Instructions

Since this is a fully static website, no complex build process is required. 

**Option 1: Direct File Open**
Simply open `index.html` in your favorite web browser.

**Option 2: Local Server (Recommended for testing routing)**
If you have Node.js installed, you can use `npx serve`:
```bash
npx serve .
```
Then navigate to `http://localhost:3000` in your browser.

## Contact Information

**Rampushpa Agro Processing**
- **Location**: Vipra Nagar, Beed, Maharashtra, India 431122
- **Email**: rampushpaagro@gmail.com
- **Phone**: +91 7721931794, +91 7588950505
- **Website**: [https://rampushpaagro.in](https://rampushpaagro.in)
