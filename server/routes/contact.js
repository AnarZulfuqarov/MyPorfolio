import express from 'express';
import { readDB, writeDB } from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST save contact message (Public)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields (name, email, message) are required' });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      name: name,
      email: email,
      message: message,
      date: new Date().toISOString()
    };

    const db = await readDB();
    db.messages = db.messages || [];
    db.messages.unshift(newMessage); // Prepend so latest messages appear first
    await writeDB(db);

    res.status(201).json({ success: true, message: 'Message saved successfully' });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// GET all contact messages (Admin Auth required)
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.messages || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// DELETE a contact message (Admin Auth required - bonus utility)
router.delete('/messages/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    
    db.messages = db.messages || [];
    const messageExists = db.messages.some(m => m.id === id);

    if (!messageExists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    db.messages = db.messages.filter(m => m.id !== id);
    await writeDB(db);

    res.json({ message: 'Message successfully deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
