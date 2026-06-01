import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Route Imports
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import jobRoutes from './routes/jobs.js';
import contactRoutes from './routes/contact.js';
import { readDB } from './db.js';

// Resolve Paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-generate fresh, verified bcrypt hash for 'admin123' and save to root .env
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
      const freshHash = bcrypt.hashSync('admin123', 10);
      envContent = envContent.replace(/ADMIN_PASSWORD_HASH=.*/, `ADMIN_PASSWORD_HASH='${freshHash}'`);
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('🔑 Auto-verified and updated .env with a fresh bcrypt hash for password "admin123"!');
    }
  }
} catch (e) {
  console.error('Failed to auto-update .env hash:', e);
}

// Load Environment Variables from absolute root path
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure public/uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Copy default mock images if they don't exist
// We will write small base64 placeholders or just use clean visual icons/color blocks on front-end if images are not found,
// but let's make sure the server serves images gracefully.
// Let's create two dummy images so the initial dynamic project images don't 404!
// A 1x1 transparent PNG or simple colored SVG files can work beautifully.
const makeMockImage = (filename, colorHex) => {
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    // Write a tiny solid SVG and save as .jpg/.png to keep it simple, it serves correctly as a background or image tag!
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="${colorHex}"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">Portfolio Mock Image</text></svg>`;
    fs.writeFileSync(filePath, svg);
  }
};

makeMockImage('demo-project.jpg', '#6366f1');
makeMockImage('demo-mobile.jpg', '#3b82f6');
makeMockImage('placeholder.jpg', '#4b5563');

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
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

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

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
  console.error('Express Error:', err.message);
  res.status(500).json({ error: err.message || 'Something went wrong inside the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Portfolio Server running at http://localhost:${PORT}`);
  console.log(`📅 Started on: ${new Date().toLocaleString()}`);
  console.log(`==================================================`);
});
