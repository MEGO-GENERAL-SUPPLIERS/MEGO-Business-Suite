// src/middleware/errorhandler.ts
import { Request, Response, NextFunction } from 'express';
import consola from 'consola';

/**
 * Global Error Handler middleware
 */
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  consola.error(`💥Global error handler:`, error);

  // Default error values 
  const status = error.status || error.statusCode || 500; 
  const message = error.message || 'Internal Server Error';
  const requestId = (req as any).requestId || 'unknown';

  // Don't expose stacj trace in production
  const shouldShowStack = process.env.NODE_ENV === 'development';

  res.status(status).json({
    success: false,
    data: {
      error: true,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      ...(shouldShowStack && { stack: error.stack})
    }
  });
};