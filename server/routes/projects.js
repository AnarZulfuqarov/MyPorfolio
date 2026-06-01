import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { readDB, writeDB } from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `project-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'));
    }
  },
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// GET all projects
router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.projects || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// POST create project (Admin Auth required)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      name_az, name_en,
      description_az, description_en,
      category, siteUrl, startDate, endDate
    } = req.body;

    if (!name_az || !name_en || !category) {
      return res.status(400).json({ error: 'Name (AZ/EN) and Category are required' });
    }

    let imageUrl = '/uploads/placeholder.jpg';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const newProject = {
      id: `project-${Date.now()}`,
      name: {
        az: name_az,
        en: name_en
      },
      description: {
        az: description_az || '',
        en: description_en || ''
      },
      category: category,
      imageUrl: imageUrl,
      siteUrl: siteUrl || '',
      startDate: startDate || null,
      endDate: endDate && endDate !== 'null' ? endDate : null
    };

    const db = await readDB();
    db.projects.push(newProject);
    await writeDB(db);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT reorder projects (Admin Auth required)
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'IDs array is required' });
    }

    const db = await readDB();
    const reorderedProjects = [];

    // Reorder elements according to the incoming list of IDs
    ids.forEach(id => {
      const proj = db.projects.find(p => p.id === id);
      if (proj) {
        reorderedProjects.push(proj);
      }
    });

    // Make sure no project is left behind due to client sync latency
    db.projects.forEach(proj => {
      if (!ids.includes(proj.id)) {
        reorderedProjects.push(proj);
      }
    });

    db.projects = reorderedProjects;
    await writeDB(db);

    res.json({ success: true });
  } catch (error) {
    console.error('Reorder projects error:', error);
    res.status(500).json({ error: 'Failed to reorder projects' });
  }
});

// PUT update project (Admin Auth required)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_az, name_en,
      description_az, description_en,
      category, siteUrl, startDate, endDate
    } = req.body;

    const db = await readDB();
    const projectIndex = db.projects.findIndex(p => p.id === id);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingProject = db.projects[projectIndex];

    let imageUrl = existingProject.imageUrl;
    if (req.file) {
      // Delete old file if it was uploaded and is not a placeholder/demo
      if (existingProject.imageUrl.startsWith('/uploads/') && 
          !existingProject.imageUrl.includes('placeholder') &&
          !existingProject.imageUrl.includes('demo-')) {
        const oldPath = path.join('./public', existingProject.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const updatedProject = {
      ...existingProject,
      name: {
        az: name_az || existingProject.name.az,
        en: name_en || existingProject.name.en
      },
      description: {
        az: description_az !== undefined ? description_az : existingProject.description.az,
        en: description_en !== undefined ? description_en : existingProject.description.en
      },
      category: category || existingProject.category,
      imageUrl: imageUrl,
      siteUrl: siteUrl !== undefined ? siteUrl : existingProject.siteUrl,
      startDate: startDate !== undefined ? startDate : existingProject.startDate,
      endDate: endDate !== undefined ? (endDate === 'null' || !endDate ? null : endDate) : existingProject.endDate
    };

    db.projects[projectIndex] = updatedProject;
    await writeDB(db);

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE project (Admin Auth required)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    const project = db.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete image file if it exists and is not a placeholder/demo
    if (project.imageUrl.startsWith('/uploads/') && 
        !project.imageUrl.includes('placeholder') &&
        !project.imageUrl.includes('demo-')) {
      const oldPath = path.join('./public', project.imageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    db.projects = db.projects.filter(p => p.id !== id);
    await writeDB(db);

    res.json({ message: 'Project successfully deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
