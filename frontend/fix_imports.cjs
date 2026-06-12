const fs = require('fs');
const path = require('path');

const srcDir = path.join('D:', 'PROJECTS', 'mye3academy-main', 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

let fixedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const importRegex = /^import newLogo from ".*?";$/m;
    
    const match = content.match(importRegex);
    if (match) {
        // remove it from current location
        content = content.replace(importRegex, '');
        // remove empty lines that might have been left
        // actually just add it to the top
        content = match[0] + '\n' + content;
        fs.writeFileSync(file, content);
        fixedCount++;
        console.log(`Fixed: ${file}`);
    }
});

console.log(`\nFixed ${fixedCount} files total.`);
