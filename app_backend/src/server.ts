// src/server.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { checkDbConnection } from './config/database.js';
import { env } from './config/env.js';
import { setupSocketIO } from './config/socket.js';
import consola from 'consola';

/**
 * Server Bootstrap
 */
async function bootstrap() {
  consola.info('='.repeat(60));
  consola.info('🚀 MEGO ADMIN DASHBOARD API');
  consola.info('='.repeat(60));
  consola.info(`Environment: ${env.NODE_ENV}`);
  consola.info(`Host: ${env.HOST}`);
  consola.info(`Port: ${env.PORT}`);
  consola.info(`API Base: ${env.API_BASE}`);
  consola.info(`Server URL: http://${env.HOST}:${env.PORT}${env.API_BASE}`);
  consola.info(`WebSocket URL: ws://${env.HOST}:${env.PORT}`);
  consola.info(`Database: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
  consola.info(`Node: ${process.version}`);
  consola.info('='.repeat(60) + '\n');

  // Pre-flight: Check database connectivity
  await checkDbConnection('Server Startup');

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const server = createServer(app);

  // Setup WebSocket server
  const io = new Server(server, {
    cors: {
      origin: env.NODE_ENV === 'production' ? false : '*',
      credentials: true
    }
  });

  // Setup Socket.IO
  setupSocketIO(io);

  // Start server
  server.listen(env.PORT, env.HOST, () => {
    const url = `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`;
    const apiUrl = `${url}${env.API_BASE}`;
    
    consola.success(`\n✅ HTTP Server running on ${url}`);
    consola.success(`✅ API Base Path: ${env.API_BASE}`);
    consola.success(`✅ WebSocket Server running on ws://${env.HOST}:${env.PORT}`);
    consola.info(`📡 Environment: ${env.NODE_ENV}`);
    consola.info(`📍 Host: ${env.HOST}`);
    consola.info(`🔌 Port: ${env.PORT}`);
    consola.info(`🗄️  Database: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
    consola.info(`🚀 Health check: ${apiUrl}/health`);
    consola.info(`📚 API docs: ${apiUrl}/docs`);
    consola.info(`🔌 WebSocket: ws://${env.HOST}:${env.PORT}`);
    consola.info('='.repeat(60));
  });

  // Handle server errors
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      consola.fatal(`❌ Port ${env.PORT} is already in use on host ${env.HOST}`);
      consola.info(`💡 Try changing PORT in .env or stop the process using this port`);
    } else if (error.code === 'EADDRNOTAVAIL') {
      consola.fatal(`❌ Host ${env.HOST} is not available on this machine`);
      consola.info(`💡 Try using 'localhost' or '0.0.0.0' instead`);
    } else {
      consola.fatal(`❌ Server error: ${error.message}`);
    }
    process.exit(1);
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  consola.fatal('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error: any) => {
  consola.fatal('💥 Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  consola.warn('⚠️  SIGTERM received - shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  consola.warn('⚠️  SIGINT received - shutting down gracefully...');
  process.exit(0);
});

// Start the server
bootstrap().catch(error => {
  consola.fatal('❌ Failed to start server:', error);
  process.exit(1);
});