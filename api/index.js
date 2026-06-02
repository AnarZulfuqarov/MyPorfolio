import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import jobRoutes from './routes/jobs.js';
import contactRoutes from './routes/contact.js';
import { readDB } from './db.js';

// Resolve Paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000', // React Local Client Port
  'http://localhost:5173', // Vite Local Client Port
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) || 
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', contactRoutes); // handles /api/contact and /api/messages

// GET dynamic about configuration
app.get('/api/about', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.about || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve about data' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Serverless Error:', err.message);
  res.status(500).json({ error: err.message || 'Something went wrong inside the server!' });
});

// Local listening capability when running offline outside of Vercel runtime
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Offline Server running locally at http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

// Export default app for Vercel Serverless Function runner
export default app;
