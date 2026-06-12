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
    let changed = false;
    
    // Check if the file imports newLogo
    if (content.includes('newLogo')) {
        // Remove brightness-0 invert
        if (content.includes('brightness-0 invert')) {
            content = content.replace(/brightness-0 invert/g, 'bg-white rounded-md p-1 shadow-sm');
            changed = true;
        }

        // We want to bump up the sizes of the logos.
        // e.g. className="h-6 w-auto...
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('w-auto object-contain') && (lines[i].includes('h-6') || lines[i].includes('h-7') || lines[i].includes('h-8') || lines[i].includes('h-10') || lines[i].includes('h-[30px]'))) {
                // Ignore Navbar since it's already customized
                if (file.includes('Navbar.jsx')) continue;
                
                // Let's replace the size
                let line = lines[i];
                line = line.replace('h-6', 'h-10');
                line = line.replace('h-7', 'h-10');
                line = line.replace('h-8', 'h-12');
                line = line.replace('h-10', 'h-14');
                line = line.replace('h-[30px]', 'h-[45px]');
                
                if (line !== lines[i]) {
                    lines[i] = line;
                    changed = true;
                }
            }
        }
        
        if (changed) {
            fs.writeFileSync(file, lines.join('\n'));
            fixedCount++;
            console.log(`Updated logo sizes/styles in: ${file}`);
        }
    }
});

console.log(`\nUpdated ${fixedCount} files total.`);
