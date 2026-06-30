// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service.js';
import consola from 'consola';

/**
 * Extended request interface with authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    sessionId: string;
  };
}

/**
 * JWT Authentication Middleware
 * 
 * Verifies Bearer token in Authorization header
 * Attaches user payload to request for downstream handlers
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization token'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtService.verifyAccessToken(token);
    
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      });
      return;
    }

    // Attach user to request
    req.user = payload;
    
    // Log authenticated requests in development
    if (process.env.NODE_ENV === 'development') {
      consola.debug(`🔐 Authenticated: ${payload.username} (Session: ${payload.sessionId})`);
    }
    
    next();
  } catch (error: any) {
    consola.error('Auth middleware error:', error.message);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Authentication verification failed'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = JwtService.verifyAccessToken(token);
    
    if (payload) {
      req.user = payload;
    }
  }
  
  next();
};