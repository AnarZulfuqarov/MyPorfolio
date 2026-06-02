import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminHash) {
      console.error('ADMIN_PASSWORD_HASH is not defined in environment variables.');
      return res.status(500).json({ error: 'Server authentication configuration error' });
    }

    const isMatch = await bcrypt.compare(password, adminHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_portfolio_key_2026';
    const token = jwt.sign({ role: 'admin' }, jwtSecret, { expiresIn: '24h' });

    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server authentication error' });
  }
});

export default router;
