// src/config/socket.ts
import { Server, Socket } from 'socket.io';
import { HealthService } from '../services/HealthService';
import consola from 'consola';

export function setupSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    consola.info(`🔌Socket connected: ${socket.id}`);

    // health Check via socket
    socket.on('health:check', async (callback) => {
      try{
        const health = await HealthService.getHealth();
        callback({ success: true, data: health });
      }catch(error: any){
        callback({ success: false, data: { message: error.message }});
      }
    });

    // Real-time health monitoring 
    socket.on('health:subscribe', () => {
      consola.info(`📡 Subscribed to health updates: ${socket.id}`);

      // Send health updates every 5 seconds
      const interval = setInterval(async () => {
        try{
          const health = await HealthService.getHealth();
          socket.emit('health:update', { success: true, data: health });
        }catch(error: any){
          socket.emit('health:error', { success: false, data: { message: 'Health check failed', error: error.message }});
        }
      }, 5000);

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        clearInterval(interval);
        consola.info(`🚫Socket disconneted: ${socket.id}`);
      });
    });

    socket.on('disconnect', () => {
      consola.info(`🚫Socket disconneted: ${socket.id}`);
    });
    
  });
};