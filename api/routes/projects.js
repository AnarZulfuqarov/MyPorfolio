import express from 'express';
import multer from 'multer';
import path from 'path';
import { readDB, writeDB } from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Multer Memory Storage Configuration (Optimal for Vercel Serverless Functions)
const storage = multer.memoryStorage();

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
      // Convert uploaded file buffer to a Base64 data URI for database storage
      const base64Image = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
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
    db.projects = db.projects || [];
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
      // Convert uploaded file buffer to a Base64 data URI for database storage
      const base64Image = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
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
    const projectIndex = db.projects.findIndex(p => p.id === id);

    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // No local disk deletions are executed to ensure compatibility with serverless environments.
    db.projects = db.projects.filter(p => p.id !== id);
    await writeDB(db);

    res.json({ message: 'Project successfully deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
