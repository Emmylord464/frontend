const fs = require('fs');
const path = require('path');

const srcOriginal = path.join('C:', 'Users', 'user', '.gemini', 'antigravity', 'brain', 'fe8690f5-b747-4d2e-a8c9-cdc064a98dac', 'scratch', 'scholar_original', 'src');
const destDir = path.join('c:', 'Users', 'user', 'jamb-ai-platform', 'src');

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      if (entry.name === 'App.tsx') {
        const scholarAppPath = path.join(dest, 'components', 'ScholarApp.tsx');
        if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
          content = "'use client';\n" + content;
        }
        content = content.replace(/from '\.\/types'/g, "from '@/types'");
        content = content.replace(/from '\.\/data\/jambData'/g, "from '@/data/jambData'");
        content = content.replace(/from '\.\/services\/authService'/g, "from '@/services/authService'");
        content = content.replace(/from '\.\/components\//g, "from '@/components/");
        content = content.replace(/from '\.\/utils\//g, "from '@/utils/");
        fs.writeFileSync(scholarAppPath, content, 'utf8');
        console.log('Written ScholarApp.tsx');
        continue;
      }

      if (entry.name === 'index.css') {
        continue;
      }

      if (srcPath.includes('components') && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
        if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
          content = "'use client';\n" + content;
        }
      }

      fs.writeFileSync(destPath, content, 'utf8');
      console.log('Copied:', destPath);
    }
  }
}

copyRecursive(srcOriginal, destDir);
console.log('All scholar original files copied successfully!');
