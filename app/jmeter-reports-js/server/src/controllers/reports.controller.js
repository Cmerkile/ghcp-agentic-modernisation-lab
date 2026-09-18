import { extname } from 'node:path';
import { config } from '../config.js';
import { JtlParseError, parseJtl } from '../models/parsing/index.js';
import { computeStatistics, computeTimeline } from '../models/statistics.js';

function fail(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function parseLimit(raw, fallback = 10) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.min(200, Math.floor(value)) : fallback;
}

/**
 * Request handlers for `/api/reports`, bound to a `ReportModel` instance so the
 * test suite can inject an in-memory database.
 */
export function createReportsController(reports) {
  return {
    health(_req, res) {
      res.json({
        status: 'ok',
        maxUploadBytes: config.maxUploadBytes,
        maxStoredSamples: config.maxStoredSamples,
      });
    },

    upload(req, res) {
      const file = req.file;
      if (!file) {
        return fail(res, 400, 'NO_FILE', 'No file was uploaded. Use the "file" form field.');
      }

      const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
      if (!name) {
        return fail(res, 400, 'NAME_REQUIRED', 'A short name is required for this report.');
      }
      if (name.length < config.minNameLength) {
        return fail(
          res,
          400,
          'NAME_TOO_SHORT',
          `The name must be at least ${config.minNameLength} characters long.`,
        );
      }
      if (name.length > config.maxNameLength) {
        return fail(
          res,
          400,
          'NAME_TOO_LONG',
          `The name must be at most ${config.maxNameLength} characters long.`,
        );
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
        const report = reports.create({
          name,
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
    },

    list(_req, res) {
      res.json(reports.list());
    },

    detail(req, res) {
      const report = reports.get(req.params.id);
      if (!report) {
        return fail(res, 404, 'NOT_FOUND', `No report found with id "${req.params.id}".`);
      }
      return res.json(report);
    },

    samples(req, res) {
      if (!reports.get(req.params.id)) {
        return fail(res, 404, 'NOT_FOUND', `No report found with id "${req.params.id}".`);
      }
      const limit = parseLimit(req.query.limit);
      const kind = req.query.kind === 'failed' ? 'failed' : 'slowest';
      const samples =
        kind === 'failed'
          ? reports.failedSamples(req.params.id, limit)
          : reports.slowestSamples(req.params.id, limit);
      return res.json({ kind, limit, samples });
    },

    remove(req, res) {
      if (!reports.delete(req.params.id)) {
        return fail(res, 404, 'NOT_FOUND', `No report found with id "${req.params.id}".`);
      }
      return res.status(204).end();
    },
  };
}
