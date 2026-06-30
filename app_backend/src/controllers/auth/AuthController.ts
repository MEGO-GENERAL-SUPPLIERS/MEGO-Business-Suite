// src/controllers/auth/AuthController.ts
import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service.js';
import consola from 'consola';
import { JwtService } from '../../services/jwt.service.js';

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT tokens + user object
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Username and password are required'
      });
      return;
    }

    const { token, refreshToken, user } = await AuthService.login(username, password);

    consola.success(`✅ Login successful: ${username} (ID: ${user.id})`);

    // Return response with tokens and user data
    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800'), // 7 days in seconds
        user
      },
      message: 'Authentication successful'
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      consola.warn(`⚠️  Failed login attempt for: ${req.body.username}`);
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid username or password'
      });
    } else {
      consola.error('❌ Login failed:', error.message);
       consola.error('📍 Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: `Internal server error: ${error.message}`
      });
    }
  }
}

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Refresh token is required'
      });
      return;
    }

    // Verify refresh token
    const payload = JwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired refresh token'
      });
      return;
    }

    // Generate new tokens
    const newToken = JwtService.generateAccessToken({
      userId: payload.userId,
      username: payload.username
    });
    
    const newRefreshToken = JwtService.generateRefreshToken({
      userId: payload.userId,
      username: payload.username
    });

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800')
      },
      message: 'Token refreshed successfully'
    });
  } catch (error: any) {
    consola.error('❌ Token refresh failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Token refresh failed'
    });
  }
}