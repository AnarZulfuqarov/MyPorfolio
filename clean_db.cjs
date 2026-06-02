const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'api', 'db.json');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(dbPath)) {
  console.error('Error: api/db.json not found!');
  process.exit(1);
}

// 1. Read db.json
const dbContent = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(dbContent);

// 2. Get list of files in public/uploads sorted by timestamp/name
let files = [];
if (fs.existsSync(uploadsDir)) {
  files = fs.readdirSync(uploadsDir)
    .filter(file => file.startsWith('project-') && (file.endsWith('.png') || file.endsWith('.webp') || file.endsWith('.jpg')))
    .sort(); // Lexicographical sort corresponds perfectly to upload order timestamps
}

console.log(`Found ${files.length} project images in public/uploads.`);

// 3. Map projects to their static image paths
if (db.projects && Array.isArray(db.projects)) {
  console.log(`Processing ${db.projects.length} projects...`);
  
  db.projects.forEach((project, index) => {
    // If the imageUrl is a Base64 string or empty placeholder, map it to a clean path
    if (!project.imageUrl || project.imageUrl.startsWith('data:image') || project.imageUrl === '/uploads/placeholder.jpg') {
      // Find the corresponding file by index, fallback to first file or placeholder if none
      const matchedFile = files[index] || files[0] || 'placeholder.jpg';
      const cleanPath = `/uploads/${matchedFile}`;
      
      console.log(`Mapping [${project.id}] "${project.name.en}" -> ${cleanPath}`);
      project.imageUrl = cleanPath;
    } else {
      console.log(`Skipping [${project.id}] "${project.name.en}" (Already has clean path: ${project.imageUrl})`);
    }
  });
}

// 4. Save clean lightweight db.json back
const cleanedJSON = JSON.stringify(db, null, 2);
fs.writeFileSync(dbPath, cleanedJSON, 'utf8');

console.log('--------------------------------------------------');
console.log('SUCCESS: Database clean up completed!');
console.log(`Original Size: ${(dbContent.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`New Size: ${(cleanedJSON.length / 1024).toFixed(2)} KB`);
console.log('--------------------------------------------------');
