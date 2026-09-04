const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const clientDir = path.join(rootDir, 'public-client');
const adminDir = path.join(rootDir, 'public-admin');

// Helper to recursively copy directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('📦 Building unified Netlify static folder (dist)...');

// Reset dist folder
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 1. Copy public-client to dist root
console.log('📂 Copying Client Storefront -> dist/');
copyRecursiveSync(clientDir, distDir);

// 2. Copy public-admin to dist/admin
console.log('📂 Copying Admin Console -> dist/admin/');
const distAdminDir = path.join(distDir, 'admin');
copyRecursiveSync(adminDir, distAdminDir);

// 3. Create Netlify _redirects file
const redirectsContent = `# Netlify Redirects Configuration for SMK Motor Spare Parts
# Redirect API calls to production backend if set up
# /api/*  https://your-backend.onrender.com/api/:splat  200

# Admin SPA Routing
/admin/*  /admin/index.html  200

# Customer Storefront SPA Routing
/*  /index.html  200
`;

fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent, 'utf8');

// 4. Create netlify.toml at project root as well
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
fs.writeFileSync(path.join(rootDir, 'netlify.toml'), netlifyToml, 'utf8');

console.log('✅ Netlify build complete! Output folder: dist/');
