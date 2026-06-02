import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

// Check if Vercel KV environment variables are present
const isKVConfigured = () => {
  return !!(process.env.KV_URL || process.env.KV_REST_API_URL);
};

export async function readDB() {
  if (isKVConfigured()) {
    try {
      // Read from Vercel KV
      const data = await kv.get('portfolio_db');
      if (data) {
        return data;
      }

      // If Vercel KV is empty, seed it with the contents of db.json
      console.log('🔄 Vercel KV is empty. Seeding from db.json...');
      const localData = await fs.readFile(dbPath, 'utf-8');
      const parsedData = JSON.parse(localData);
      await kv.set('portfolio_db', parsedData);
      return parsedData;
    } catch (error) {
      console.error('⚠️ Failed to interact with Vercel KV (using db.json fallback):', error.message);
    }
  }

  // Fallback to local db.json if KV is not configured or fails
  try {
    const localData = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(localData);
  } catch (fsError) {
    console.error('❌ Failed to read fallback db.json:', fsError.message);
    return { projects: [], jobs: [], messages: [], about: {} };
  }
}

export async function writeDB(data) {
  if (isKVConfigured()) {
    try {
      await kv.set('portfolio_db', data);
      return;
    } catch (error) {
      console.error('⚠️ Failed to write to Vercel KV (falling back to db.json):', error.message);
    }
  }

  // Fallback to writing to local db.json
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (fsError) {
    console.error('❌ Failed to write fallback db.json:', fsError.message);
    throw fsError;
  }
}
