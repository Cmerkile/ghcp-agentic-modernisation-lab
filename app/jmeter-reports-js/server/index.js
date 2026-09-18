import express from 'express';
import { MulterError } from 'multer';
import { argv } from 'node:process';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from './src/config.js';
import { ReportModel } from './src/models/report.model.js';
import { createApiRouter } from './src/routes/index.js';

/**
 * Builds the Express application around a `ReportModel`. Exported so the test
 * suite can run it against an in-memory database.
 */
export function createApp(reports) {
  const app = express();
  app.use(express.json());
  app.use('/api', createApiRouter(reports));

  app.use((error, _req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }
    if (error instanceof MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: {
            code: 'FILE_TOO_LARGE',
            message: `The file exceeds the ${Math.round(config.maxUploadBytes / (1024 * 1024))} MB limit.`,
          },
        });
      }
      return res.status(400).json({ error: { code: error.code, message: error.message } });
    }
    console.error(error);
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } });
  });

  return app;
}

export function start() {
  const reports = new ReportModel(config.databasePath, {
    maxStoredSamples: config.maxStoredSamples,
  });
  const server = createApp(reports).listen(config.port, () => {
    console.log(`JMeter reports API (JS) listening on http://localhost:${config.port}`);
    console.log(`Database: ${config.databasePath}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(() => {
        reports.close();
        process.exit(0);
      });
    });
  }

  return server;
}

// Only listen when executed directly, so importing this file in tests is free.
if (argv[1] && realpathSync(argv[1]) === fileURLToPath(import.meta.url)) {
  start();
}
