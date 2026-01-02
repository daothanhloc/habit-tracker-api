import 'dotenv/config';

export interface Env {
  NODE_ENV: 'development' | 'production';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  GMAIL_API_KEY?: string;
  BRAVE_API_KEY?: string;
}

function loadEnv(): Env {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  const databaseUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const gmailApiKey = process.env.GMAIL_API_KEY;
  const braveApiKey = process.env.BRAVE_API_KEY;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (!jwtRefreshSecret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is required');
  }

  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  return {
    NODE_ENV: nodeEnv as 'development' | 'production',
    PORT: port,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    JWT_REFRESH_SECRET: jwtRefreshSecret,
    GMAIL_API_KEY: gmailApiKey,
    BRAVE_API_KEY: braveApiKey,
  };
}

export const env = loadEnv();
