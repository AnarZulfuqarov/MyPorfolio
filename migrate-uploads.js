import fs from 'fs';
import path from 'path';

const srcDir = './server/public/uploads';
const destDir = './client/public/uploads';

try {
  if (!fs.existsSync(srcDir)) {
    console.log('ℹ️ Source directory server/public/uploads does not exist. Skipping image migration.');
    process.exit(0);
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`📁 Created destination directory: ${destDir}`);
  }

  const files = fs.readdirSync(srcDir);
  let count = 0;
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    
    // Copy the file securely
    fs.copyFileSync(srcFile, destFile);
    count++;
  }
  console.log(`🚀 Successfully migrated ${count} portfolio images to frontend static assets!`);
} catch (error) {
  console.error('❌ Uploads migration failed:', error.message);
}
