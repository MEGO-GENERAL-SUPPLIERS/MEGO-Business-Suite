// src/services/jwt.service.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import consola from 'consola';

export interface JwtPayload {
  userId: number;
  username: string;
  sessionId: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
}

/**
 * JWT Service - Type-safe token operations
 * 
 * CRITICAL FIX: Uses payload-level expiration to bypass SignOptions typing issues
 * This pattern works with ALL @types/jsonwebtoken versions (8.x and 9.x)
 */
export class JwtService {
  static generateAccessToken(payload: Omit<JwtPayload, 'sessionId'>): string {
    const tokenPayload = {
      ...payload,
      sessionId: this.generateSessionId(),
      // ✅ EXPIRATION IN PAYLOAD (bypasses SignOptions typing entirely)
      exp: Math.floor(Date.now() / 1000) + this.parseExpires(env.JWT_EXPIRES_IN)
    };

    return jwt.sign(tokenPayload, env.JWT_SECRET, { algorithm: 'HS256' });
  }

  static generateRefreshToken(payload: Omit<JwtPayload, 'sessionId'>): string {
    const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
    const tokenPayload = {
      ...payload,
      sessionId: this.generateSessionId(),
      type: 'refresh' as const,
      exp: Math.floor(Date.now() / 1000) + this.parseExpires(env.JWT_REFRESH_EXPIRES_IN)
    };

    return jwt.sign(tokenPayload, secret, { algorithm: 'HS256' });
  }

  static verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
    } catch (error: any) {
      consola.debug(`JWT verification failed: ${error.message}`);
      return null;
    }
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as RefreshTokenPayload;
      
      if (decoded.type !== 'refresh') {
        consola.warn('Invalid token type for refresh token');
        return null;
      }
      
      return decoded;
    } catch (error: any) {
      consola.debug(`Refresh token verification failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse human-readable expiration to seconds
   * Supports: '7d', '24h', '60m', '3600s', etc.
   */
  private static parseExpires(exp: string): number {
    const match = exp.match(/^(\d+)([dhms]?)$/);
    if (!match) return 604800; // Default: 7 days

    const value = parseInt(match[1]);
    const unit = match[2] || 's';

    switch (unit) {
      case 'd': return value * 86400; // days → seconds
      case 'h': return value * 3600;  // hours → seconds
      case 'm': return value * 60;    // minutes → seconds
      default: return value;          // seconds
    }
  }

  private static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}