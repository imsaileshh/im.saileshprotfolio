import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const getDatabaseUrl = () => {
  // Define the required priority list
  const urls = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL_PRISMA_DATABASE_URL,
    process.env.DATABASE_URL_POSTGRES_URL
  ];

  // Find the first defined URL
  const selectedUrl = urls.find(url => url !== undefined && url !== '');

  // If we are in production, we absolutely MUST have a valid remote URL
  if (process.env.NODE_ENV === 'production') {
    // If it's a local build (running locally with npm run build or npx vercel build), allow localhost.
    // In actual Vercel cloud CI, process.env.CI is true, and we enforce remote database URLs.
    const isLocalBuild = !process.env.CI;
    
    if (!isLocalBuild) {
      if (!selectedUrl) {
         console.error("CRITICAL: No production database URL found. Overriding to prevent fallback to cached .env.");
         return "postgresql://invalid:invalid@invalid:5432/invalid";
      }
      if (selectedUrl.includes('localhost') || selectedUrl.includes('127.0.0.1')) {
         console.error("CRITICAL: DATABASE_URL is localhost in production. Overriding to prevent localhost connection.");
         return "postgresql://invalid:invalid@invalid:5432/invalid";
      }
    }
  }

  return selectedUrl;
};

const databaseUrl = getDatabaseUrl();

// ALWAYS pass a URL to Prisma in production so it NEVER falls back to a baked-in .env file
const prismaOptions = {
  datasources: {
    db: {
      url: databaseUrl || "postgresql://invalid:invalid@invalid:5432/invalid",
    },
  },
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
