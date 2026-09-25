const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('C:/Users/user/.gemini/antigravity/brain/fe8690f5-b747-4d2e-a8c9-cdc064a98dac/scratch/exported_frontend/src');
const destDir = path.resolve('src');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      if (entry.name === 'App.tsx') {
        let content = fs.readFileSync(srcPath, 'utf8');
        if (!content.startsWith("'use client'")) {
          content = "'use client';\n" + content;
        }
        // Change imports that might reference ./components to @/components
        fs.mkdirSync(path.join(dest, 'components'), { recursive: true });
        fs.writeFileSync(path.join(dest, 'components', 'ScholarApp.tsx'), content, 'utf8');
        console.log('Copied App.tsx -> src/components/ScholarApp.tsx');
      } else if (entry.name === 'main.tsx' || entry.name === 'index.css') {
        console.log('Skipping vite file:', entry.name);
      } else {
        let content = fs.readFileSync(srcPath, 'utf8');
        // Add 'use client' if it's in components
        if (destPath.includes('components') && (destPath.endsWith('.tsx') || destPath.endsWith('.jsx'))) {
          if (!content.startsWith("'use client'")) {
            content = "'use client';\n" + content;
          }
        }
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, content, 'utf8');
        console.log('Copied:', path.relative(destDir, destPath));
      }
    }
  }
}

copyRecursive(srcDir, destDir);
console.log('Done copying all frontend files!');
