import fs from 'fs';
import path from 'path';

function deleteRecursive(itemPath) {
  if (!fs.existsSync(itemPath)) return;
  const stat = fs.lstatSync(itemPath);

  if (stat.isDirectory()) {
    const files = fs.readdirSync(itemPath);
    for (const file of files) {
      deleteRecursive(path.join(itemPath, file));
    }
    fs.rmdirSync(itemPath);
  } else {
    fs.unlinkSync(itemPath);
  }
}

try {
  console.log('🗑️ Deleting root package-lock.json...');
  deleteRecursive('./package-lock.json');
  
  console.log('🗑️ Deleting root node_modules...');
  deleteRecursive('./node_modules');

  console.log('✅ Cleanup complete! Please run "npm install" in your terminal to regenerate a clean package-lock.json.');
} catch (error) {
  console.error('❌ Cleanup failed:', error.message);
}
