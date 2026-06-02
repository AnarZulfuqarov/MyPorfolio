import fs from 'fs';
import path from 'path';

// Helper to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to remove directory recursively
function removeDirRecursive(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      removeDirRecursive(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  }

  fs.rmdirSync(dir);
}

try {
  console.log('🔄 Starting repository flattening...');

  // 1. Copy client/src/ to src/
  if (fs.existsSync('./client/src')) {
    console.log('📦 Copying client/src to src at root...');
    copyDirRecursive('./client/src', './src');
  }

  // 2. Copy client/public/ to public/
  if (fs.existsSync('./client/public')) {
    console.log('📦 Copying client/public to public at root...');
    copyDirRecursive('./client/public', './public');
  }

  // 3. Copy server/public/uploads/ to public/uploads/
  if (fs.existsSync('./server/public/uploads')) {
    console.log('🖼️ Migrating project uploads from server to public/uploads at root...');
    copyDirRecursive('./server/public/uploads', './public/uploads');
  }

  // 4. Delete client/ folder
  if (fs.existsSync('./client')) {
    console.log('🧹 Cleaning up client/ folder...');
    removeDirRecursive('./client');
  }

  // 5. Delete server/ folder
  if (fs.existsSync('./server')) {
    console.log('🧹 Cleaning up server/ folder...');
    removeDirRecursive('./server');
  }

  // 6. Delete migrate-uploads.js
  if (fs.existsSync('./migrate-uploads.js')) {
    fs.unlinkSync('./migrate-uploads.js');
  }

  console.log('✅ Flattening complete successfully!');
} catch (error) {
  console.error('❌ Flattening failed:', error.message);
}
