const fs = require('fs');
const path = require('path');

const distDir = 'dist';
const dirs = ['dist/api', 'dist/backend', 'dist/netlify/functions'];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy api/index.cjs
fs.copyFileSync('api/index.cjs', 'dist/api/index.cjs');

// Copy netlify/functions/api.js
fs.copyFileSync('netlify/functions/api.js', 'dist/netlify/functions/api.js');

// Copy backend directory (excluding node_modules and .git)
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir('backend', 'dist/backend');

console.log('Build copy complete.');
