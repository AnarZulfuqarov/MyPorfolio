import { Redis } from '@upstash/redis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

// Check if Upstash Redis environment variables are present
const isRedisConfigured = () => {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
};

// Initialize Upstash Redis client if configured
let redis = null;
if (isRedisConfigured()) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function readDB() {
  if (isRedisConfigured() && redis) {
    try {
      // Read from Upstash Redis
      let data = await redis.get('portfolio_db');
      if (data) {
        // Sanitize returned value in case it is loaded as a raw JSON string
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            // Keep it as string if parsing fails
          }
        }
        return data;
      }

      // If Upstash Redis is empty, seed it with the contents of db.json
      console.log('🔄 Upstash Redis is empty. Seeding from db.json...');
      const localData = await fs.readFile(dbPath, 'utf-8');
      const parsedData = JSON.parse(localData);
      await redis.set('portfolio_db', parsedData);
      return parsedData;
    } catch (error) {
      console.error('⚠️ Failed to interact with Upstash Redis (using db.json fallback):', error.message);
    }
  }

  // Fallback to local db.json if Redis is not configured or fails
  try {
    const localData = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(localData);
  } catch (fsError) {
    console.error('❌ Failed to read fallback db.json:', fsError.message);
    return { projects: [], jobs: [], messages: [], about: {} };
  }
}

export async function writeDB(data) {
  if (isRedisConfigured() && redis) {
    try {
      await redis.set('portfolio_db', data);
      return;
    } catch (error) {
      console.error('⚠️ Failed to write to Upstash Redis (falling back to db.json):', error.message);
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
