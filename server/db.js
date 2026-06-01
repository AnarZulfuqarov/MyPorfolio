import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

export async function readDB() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If db.json is missing or corrupted, return default structure
    return { projects: [], jobs: [], messages: [] };
  }
}

export async function writeDB(data) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file:', error);
    throw error;
  }
}
