import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script runs on Vercel CI to map the integration-specific database URLs 
// to the standard variables Prisma expects (DATABASE_URL, DIRECT_URL)
if (process.env.VERCEL && process.env.CI) {
  let envVars = [];
  const envPath = path.join(__dirname, '../.env');
  
  // Clear out any stale cached .env file on Vercel to prevent Prisma from using old localhost variables
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath);
  }
  
  // Use the Prisma-specific pooled URL for normal connections
  const mainUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_PRISMA_DATABASE_URL || process.env.DATABASE_URL_POSTGRES_URL;
  if (mainUrl && !mainUrl.includes('localhost') && !mainUrl.includes('127.0.0.1')) {
    envVars.push(`DATABASE_URL="${mainUrl}"`);
  }
  
  // Use the direct (non-pooled) URL for Prisma migrations
  const directUrl = process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL_POSTGRES_URL;
  if (directUrl && !directUrl.includes('localhost') && !directUrl.includes('127.0.0.1')) {
    envVars.push(`DIRECT_URL="${directUrl}"`);
  }
  
  if (envVars.length > 0) {
    // We create a fresh .env so Next.js and Prisma CLI can pick it up
    fs.writeFileSync(envPath, envVars.join('\n'));
    console.log('Successfully mapped Vercel database environment variables for Prisma.');
  }
}
