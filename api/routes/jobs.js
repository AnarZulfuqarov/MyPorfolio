import express from 'express';
import { readDB, writeDB } from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET all work experiences
router.get('/', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.jobs || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve work experiences' });
  }
});

// POST create work experience (Admin Auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { company, description_az, description_en, startDate, endDate, siteUrl } = req.body;

    if (!company || !startDate) {
      return res.status(400).json({ error: 'Company and Start Date are required' });
    }

    const newJob = {
      id: `job-${Date.now()}`,
      company: company,
      description: {
        az: description_az || '',
        en: description_en || ''
      },
      startDate: startDate,
      endDate: endDate || null,
      siteUrl: siteUrl || ''
    };

    const db = await readDB();
    db.jobs.push(newJob);
    await writeDB(db);

    res.status(201).json(newJob);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create work experience' });
  }
});

// PUT update work experience (Admin Auth required)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { company, description_az, description_en, startDate, endDate, siteUrl } = req.body;

    const db = await readDB();
    const jobIndex = db.jobs.findIndex(j => j.id === id);

    if (jobIndex === -1) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    const existingJob = db.jobs[jobIndex];
    const updatedJob = {
      ...existingJob,
      company: company || existingJob.company,
      description: {
        az: description_az !== undefined ? description_az : existingJob.description.az,
        en: description_en !== undefined ? description_en : existingJob.description.en
      },
      startDate: startDate || existingJob.startDate,
      endDate: endDate !== undefined ? endDate : existingJob.endDate,
      siteUrl: siteUrl !== undefined ? siteUrl : existingJob.siteUrl
    };

    db.jobs[jobIndex] = updatedJob;
    await writeDB(db);

    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update work experience' });
  }
});

// DELETE work experience (Admin Auth required)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();

    const jobIndex = db.jobs.findIndex(j => j.id === id);
    if (jobIndex === -1) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    db.jobs = db.jobs.filter(j => j.id !== id);
    await writeDB(db);

    res.json({ message: 'Work experience successfully deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete work experience' });
  }
});

export default router;
