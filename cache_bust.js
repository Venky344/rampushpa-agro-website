const fs = require('fs');
const path = require('path');

const version = '?v=3.0.2';

function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        // Skip node_modules and hidden folders
        if (file === 'node_modules' || file.startsWith('.')) continue;

        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Remove old version parameters if they exist to prevent appending twice
            content = content.replace(/\?v=[0-9\.]+/g, '');

            // Replace CSS
            const cssRegex = /(href="[^"]+\.css)(")/g;
            if (cssRegex.test(content)) {
                content = content.replace(cssRegex, `$1${version}$2`);
                modified = true;
            }

            // Replace JS
            const jsRegex = /(src="[^"]+\.js)(")/g;
            if (jsRegex.test(content)) {
                content = content.replace(jsRegex, `$1${version}$2`);
                modified = true;
            }

            // Also lazy load images for optimization (Task 6)
            // Add loading="lazy" if not present on img tags
            const imgRegex = /<img\s+(?![^>]*loading="lazy")[^>]+>/g;
            if (imgRegex.test(content)) {
                content = content.replace(/<img(?=\s)/g, (match, offset, str) => {
                    const tagEnd = str.indexOf('>', offset);
                    const tagStr = str.substring(offset, tagEnd + 1);
                    if (!tagStr.includes('loading="lazy"') && !tagStr.includes('loading="eager"')) {
                        return '<img loading="lazy"';
                    }
                    return match;
                });
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(__dirname);
console.log('Cache busting and lazy loading applied globally.');
