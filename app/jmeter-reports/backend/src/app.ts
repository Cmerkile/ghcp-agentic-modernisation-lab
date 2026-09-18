import express, { type NextFunction, type Request, type Response } from 'express';
import multer, { MulterError } from 'multer';
import { extname } from 'node:path';
import { config } from './config.ts';
import { JtlParseError, parseJtl } from './parsing/index.ts';
import { computeStatistics } from './stats.ts';
import type { ReportStore } from './store.ts';

interface ApiErrorBody {
  error: { code: string; message: string };
}

function fail(res: Response, status: number, code: string, message: string): Response<ApiErrorBody> {
  return res.status(status).json({ error: { code, message } });
}

export function createApp(store: ReportStore) {
  const app = express();
  app.use(express.json());

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 },
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', maxUploadBytes: config.maxUploadBytes });
  });

  app.post('/api/reports', upload.single('file'), (req: Request, res: Response) => {
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
      const statistics = computeStatistics(parsed.samples);
      const report = store.create({
        fileName: file.originalname,
        fileSize: file.size,
        format: parsed.format,
        skippedRows: parsed.skipped,
        statistics,
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

  app.delete('/api/reports/:id', (req, res) => {
    if (!store.delete(req.params.id)) {
      return fail(res, 404, 'NOT_FOUND', `No report found with id "${req.params.id}".`);
    }
    return res.status(204).end();
  });

  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
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
