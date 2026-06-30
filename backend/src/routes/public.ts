// src/routes/public.ts
import { Router } from 'express';
import { HealthController } from '../controllers/public/HealthController.js';
import { DocsController } from '../controllers/public/DocsController.js';
import { login } from '../controllers/auth/AuthController.js';

const router = Router();
/**
 * Public Routes
 */

// Health endpoints
router.get('/health-check', HealthController.check);
router.get('/health/live', HealthController.live);
router.get('/health/ready', HealthController.ready);

// Documentation endpoints
router.get('/docs', DocsController.show);
router.get('/docs/endpoints', DocsController.listEndpoints);

// Auth
router.post('/auth/login', login);

export default router;