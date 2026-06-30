// src/routes/auth.ts
import { Router } from 'express';
import { refresh } from '../controllers/auth/AuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * Public authentication endpoints
 * No authentication required
 */
router.post('/refresh', refresh);

/**
 * Protected endpoints example
 * Requires valid JWT token
 */
router.get('/auth/user', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      userId: (req as any).user.userId,
      username: (req as any).user.username,
      sessionId: (req as any).user.sessionId
    }
  });
});

export default router;