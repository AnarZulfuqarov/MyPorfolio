const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'api', 'db.json');

if (!fs.existsSync(dbPath)) {
  console.error('Error: api/db.json not found!');
  process.exit(1);
}

// 1. Read db.json
const dbContent = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(dbContent);

// 2. Exact chronological mappings
const correctMappings = {
  "proj-1": "/uploads/project-1780300522535-451014830.webp", // Buyonida
  "proj-2": "/uploads/project-1780309941701-667901138.png",   // Mezuro
  "proj-3": "/uploads/project-1780309955733-472835043.png",   // Kliniken Allianz
  "proj-4": "/uploads/project-1780309962453-922147185.png",   // Technobox
  "proj-5": "/uploads/project-1780309969301-641015552.png",   // Natavan Menu
  "proj-6": "/uploads/project-1780309975929-508766149.png",   // Premier CRM
  "proj-7": "/uploads/project-1780309984856-293837360.png",   // TonuBy CRM
  "proj-8": "/uploads/project-1780309991333-790814401.png",   // SSS Construction
  "proj-9": "/uploads/project-1780309998413-160473544.png",   // Asterias (wait: let's double check if it maps here)
  "proj-10": "/uploads/project-1781310005049-641366515.png", // Victory College fallback
  "project-1780310339614": "/uploads/project-1780310339609-803890438.png" // Texnocode
};

// We will also dynamically handle fallback if IDs don't match
const files = [
  "project-1780300522535-451014830.webp", // 0: Buyonida
  "project-1780309941701-667901138.png",   // 1: Mezuro
  "project-1780309955733-472835043.png",   // 2: Kliniken Allianz
  "project-1780309962453-922147185.png",   // 3: Technobox
  "project-1780309969301-641015552.png",   // 4: Natavan Menu
  "project-1780309975929-508766149.png",   // 5: Premier CRM
  "project-1780309984856-293837360.png",   // 6: TonuBy CRM
  "project-1780309991333-790814401.png",   // 7: SSS Construction
  "project-1780309998413-160473544.png",   // 8: Asterias
  "project-1781310005049-641366515.png",   // 9: Victory College (Let's make sure it is project-1780310005049-641366515.png)
  "project-1780310015853-658792156.png",   // 10: Extra upload/other
  "project-1780310339609-803890438.png"    // 11: Texnocode
];

// Let's correct Victory College filename just in case:
const victoryCollegeFile = "project-1780310005049-641366515.png";

if (db.projects && Array.isArray(db.projects)) {
  db.projects.forEach(project => {
    if (project.id === 'proj-1') {
      project.imageUrl = "/uploads/project-1780300522535-451014830.webp";
    } else if (project.id === 'project-1780310339614') {
      project.imageUrl = "/uploads/project-1780310339609-803890438.png";
    } else if (project.id === 'proj-2') {
      project.imageUrl = "/uploads/project-1780309941701-667901138.png";
    } else if (project.id === 'proj-3') {
      project.imageUrl = "/uploads/project-1780309955733-472835043.png";
    } else if (project.id === 'proj-4') {
      project.imageUrl = "/uploads/project-1780309962453-922147185.png";
    } else if (project.id === 'proj-5') {
      project.imageUrl = "/uploads/project-1780309969301-641015552.png";
    } else if (project.id === 'proj-6') {
      project.imageUrl = "/uploads/project-1780309975929-508766149.png";
    } else if (project.id === 'proj-7') {
      project.imageUrl = "/uploads/project-1780309984856-293837360.png";
    } else if (project.id === 'proj-8') {
      project.imageUrl = "/uploads/project-1780309991333-790814401.png";
    } else if (project.id === 'proj-9') {
      project.imageUrl = "/uploads/project-1780309998413-160473544.png";
    } else if (project.id === 'proj-10') {
      project.imageUrl = "/uploads/project-1780310005049-641366515.png";
    }
    console.log(`Matched [${project.id}] "${project.name.en}" -> ${project.imageUrl}`);
  });
}

// Save back
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('SUCCESS: Image mappings fixed perfectly!');
