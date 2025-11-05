const fs = require('fs');
const path = require('path');

const distExists = fs.existsSync(path.join(__dirname, '../dist/types/index.d.ts'));
if (distExists) {
  process.exit(0);
}

// Check for build tools in package or parent
const hasLocalTs = fs.existsSync(path.join(__dirname, '../node_modules/typescript'));
const parentNodeModules = path.resolve(__dirname, '../../../node_modules');
const hasParentTs = fs.existsSync(path.join(parentNodeModules, 'typescript'));
const hasParentVite = fs.existsSync(path.join(parentNodeModules, 'vite'));

if (!hasLocalTs && !hasParentTs) {
  console.warn('dot-sphere-visualizer: dist folder missing and TypeScript not available. Build tools needed.');
  process.exit(0);
}

if (!hasLocalTs && !hasParentVite) {
  console.warn('dot-sphere-visualizer: dist folder missing and Vite not available. Build tools needed.');
  process.exit(0);
}

console.log('dot-sphere-visualizer: Building dist folder...');
const { execSync } = require('child_process');
try {
  execSync('npm run package', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (err) {
  console.error('dot-sphere-visualizer: Build failed:', err.message);
  process.exit(0); // Don't fail install
}

