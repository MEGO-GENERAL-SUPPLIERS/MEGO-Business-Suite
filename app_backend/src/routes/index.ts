// src/routes/index.ts
import { Router } from 'express';
import { env } from '../config/env.js';
import publicRoutes from './public.js';
import privateRoutes from './private.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * Routes manifest (rails style)
 * All routes registered here for easy overview
 */

// Public routes (no auth required)
router.use(`/`, publicRoutes);

// API routes (Authentication routes)
router.use(env.API_BASE, publicRoutes);

// Authenticated routes (require JWT token)
router.use(`${env.API_BASE}`, authMiddleware, privateRoutes);

export default router;