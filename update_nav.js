const fs = require('fs');
const path = require('path');

const dir = __dirname;
const indexHtmlPath = path.join(dir, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Extract GSAP Script
const gsapRegex = /<!-- GSAP for CardNav Animation -->\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/gsap\/3\.12\.5\/gsap\.min\.js"><\/script>/;
const gsapMatch = indexHtmlContent.match(gsapRegex);
const gsapScript = gsapMatch ? gsapMatch[0] : '';

// 2. Extract Card Nav Container
const navRegex = /<!-- React Bits Card Nav \(Vanilla Port\) -->[\s\S]*?<\/nav>\s*<\/div>/;
const navMatch = indexHtmlContent.match(navRegex);
const navBlock = navMatch ? navMatch[0] : '';

if (!gsapScript || !navBlock) {
    console.error("Failed to extract GSAP or Card Nav from index.html");
    process.exit(1);
}

const targetFiles = [
    'company-profile/index.html'
];

targetFiles.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace main-header
        const headerRegex = /<header class="main-header">[\s\S]*?<\/header>/;
        if (headerRegex.test(content)) {
            content = content.replace(headerRegex, navBlock);
            modified = true;
        }

        // Inject GSAP
        if (!content.includes('gsap.min.js')) {
            content = content.replace('</head>', `    ${gsapScript}\n</head>`);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        } else {
            console.log(`No changes needed for ${file}`);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
});

console.log('Done.');
