import express from 'express';
import multer, { MulterError } from 'multer';
import { extname } from 'node:path';
import { config } from './config.js';
import { JtlParseError, parseJtl } from './parsing/index.js';
import { computeStatistics, computeTimeline } from './stats.js';

function fail(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function parseLimit(raw, fallback = 10) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.min(200, Math.floor(value)) : fallback;
}

export function createApp(store) {
  const app = express();
  app.use(express.json());

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 },
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      maxUploadBytes: config.maxUploadBytes,
      maxStoredSamples: config.maxStoredSamples,
    });
  });

  app.post('/api/reports', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
      return fail(res, 400, 'NO_FILE', 'No file was uploaded. Use the "file" form field.');
    }

    const extension = extname(file.originalname).toLowerCase();
    if (!config.allowedExtensions.includes(extension)) {
      return fail(
        res,
        400,
        'UNSUPPORTED_EXTENSION',
        `Unsupported file extension "${extension || 'none'}". Allowed: ${config.allowedExtensions.join(', ')}.`,
      );
    }

    if (file.size === 0) {
      return fail(res, 400, 'EMPTY_FILE', 'The uploaded file is empty.');
    }

    try {
      const parsed = parseJtl(file.buffer.toString('utf8'));
      const report = store.create({
        fileName: file.originalname,
        fileSize: file.size,
        format: parsed.format,
        skippedRows: parsed.skipped,
        statistics: computeStatistics(parsed.samples),
        timeline: computeTimeline(parsed.samples),
        samples: parsed.samples,
      });
      return res.status(201).json(report);
    } catch (error) {
      if (error instanceof JtlParseError) {
        return fail(res, 400, error.code, error.message);
      }
      throw error;
    }
  });

  app.get('/api/reports', (_req, res) => {
    res.json(store.list());
  });

  app.get('/api/reports/:id', (req, res) => {
    const report = store.get(req.params.id);
    if (!report) {
      return fail(res, 404, 'NOT_FOUND', `No report found with id "${req.params.id}".`);
    }
    return res.json(report);
  });

  app.get('/api/reports/:id/samples', (req, res) => {
    if (!store.get(req.params.id)) {
      return fail(res, 404, 'NOT_FOUND', `No report found with id "${req.params.id}".`);
    }
    const limit = parseLimit(req.query.limit);
    const kind = req.query.kind === 'failed' ? 'failed' : 'slowest';
    const samples =
      kind === 'failed'
        ? store.failedSamples(req.params.id, limit)
        : store.slowestSamples(req.params.id, limit);
    return res.json({ kind, limit, samples });
  });

  app.delete('/api/reports/:id', (req, res) => {
    if (!store.delete(req.params.id)) {
      return fail(res, 404, 'NOT_FOUND', `No report found with id "${req.params.id}".`);
    }
    return res.status(204).end();
  });

  app.use((error, _req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }
    if (error instanceof MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return fail(
          res,
          413,
          'FILE_TOO_LARGE',
          `The file exceeds the ${Math.round(config.maxUploadBytes / (1024 * 1024))} MB limit.`,
        );
      }
      return fail(res, 400, error.code, error.message);
    }
    console.error(error);
    return fail(res, 500, 'INTERNAL_ERROR', 'Unexpected server error.');
  });

  return app;
}
