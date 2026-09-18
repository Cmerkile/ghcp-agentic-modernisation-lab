import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { createReportsController } from '../controllers/reports.controller.js';

/** `.jtl` files are parsed in memory, never written to disk. */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 1 },
});

export function createReportsRouter(reports) {
  const controller = createReportsController(reports);
  const router = Router();

  router.post('/', upload.single('file'), controller.upload);
  router.get('/', controller.list);
  router.get('/:id', controller.detail);
  router.get('/:id/samples', controller.samples);
  router.delete('/:id', controller.remove);

  return router;
}
