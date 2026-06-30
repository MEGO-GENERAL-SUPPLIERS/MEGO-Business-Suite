// src/app.ts
import express from 'express';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import consola from 'consola';

/**
 * Express application factory
 */
export function createApp() {
  const app = express();

  // ==================
  // Securty middleware
  // ==================

  // helmet - securty headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  // CORS - Enable for API clients
  app.use(cors({
    origin: env.NODE_ENV === 'production' ? false : '*', //Restrict in production
    credentials: true
  })); 

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15min
    max: 100, // limit each IP to 100 requests per windowsMS
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter); // Apply rate limiting

  
  // ================
  // Body parsers 
  // ================
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb'}));

  
  // =====================
  // Request ID Middleware
  // =====================
  app.use((req, res, next) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    (req as any).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });


  // ========================
  // API Base Path Info
  // ========================
  
  if (env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      consola.info(`📨 ${req.method} ${req.path} [Base: ${env.API_BASE}]`);
      next();
    });
  }


  // =============
  // Routes 
  // =============
  app.use('/', routes); // mount all routes from manifest

  
  // ========================
  // Root Redirect
  // ========================
  
  // Redirect root to API base path
  app.get('/', (req, res) => {
    res.redirect(302, `${env.API_BASE}/docs`);
  });


  // ===================
  // Error Handling
  // ===================
  // 404 handling 
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
      message: `Route ${req.method} ${req.path} does not exist`,
      data: null
    });
  });

  // global error handler
  app.use(errorHandler);

  return app;
}