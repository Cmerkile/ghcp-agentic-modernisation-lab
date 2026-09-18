import { Router } from 'express';
import { createReportsController } from '../controllers/reports.controller.js';
import { createReportsRouter } from './reports.routes.js';

/** Mounts every API route under `/api`. */
export function createApiRouter(reports) {
  const router = Router();

  router.get('/health', createReportsController(reports).health);
  router.use('/reports', createReportsRouter(reports));

  return router;
}
