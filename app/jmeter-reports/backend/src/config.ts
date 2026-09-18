import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const DEFAULT_MAX_UPLOAD_MB = 64;

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const config = {
  port: intFromEnv('PORT', 3001),
  maxUploadBytes: intFromEnv('MAX_UPLOAD_MB', DEFAULT_MAX_UPLOAD_MB) * 1024 * 1024,
  databasePath: process.env.DATABASE_PATH ?? resolve(here, '../data/reports.db'),
  allowedExtensions: ['.jtl', '.csv', '.xml'],
};
