const fs = require('fs');
const path = require('path');

const srcDir = path.join('D:', 'PROJECTS', 'mye3academy-main', 'frontend', 'src');

function getRelativePath(fromPath, toPath) {
    let rel = path.relative(path.dirname(fromPath), toPath).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    return rel;
}

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
const targetStr = "`${import.meta.env.VITE_SERVER_URL}/uploads/images/mye3.png`";
const targetLogoPath = path.join(srcDir, 'assets', 'mye3AcadmeyNewLogo.jpeg');

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(targetStr)) {
        const relPath = getRelativePath(file, targetLogoPath);
        
        // Add import if not present
        if (!content.includes('import newLogo from')) {
            // Find the last import statement
            const lines = content.split('\n');
            let lastImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    lastImportIndex = i;
                }
            }
            
            const importStmt = `import newLogo from "${relPath}";`;
            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, importStmt);
            } else {
                lines.unshift(importStmt);
            }
            content = lines.join('\n');
        }
        
        // Replace string
        content = content.split(targetStr).join('newLogo');
        
        fs.writeFileSync(file, content);
        modifiedCount++;
        console.log(`Modified: ${file}`);
    }
});

console.log(`\nModified ${modifiedCount} files total.`);
