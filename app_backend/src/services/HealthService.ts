// src/services/HealthService.ts
import { sequelize } from "../config/database.js";
import { env } from '../config/env.js';
import packageJson from '../../package.json';

export class HealthService{
  // CHeck DB connection
  static async checkDatabase(): Promise<{ success: boolean; message?: string | string[]; data: { message?: string; status?: string; latency: number; }}>{
    const start = Date.now();
    try{
      await sequelize.authenticate();
      const latency = Date.now() - start;
      return { success: true, data: { status: 'healthy', latency }};
    } catch(error: any){
      return { success: false, data: { message: error.message, status: 'unhealthy', latency: -1 }}
    }
  }

  // Get system info
  static async getHealth(): Promise<any>{
    const [dbCheck, uptime] = await Promise.all([
      this.checkDatabase(),
      Promise.resolve(process.uptime())
    ]);

    return {
      success: true, 
      data: {
        state: dbCheck.data.status === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: packageJson.version || '1.0.0',
        api: {
          base: env.API_BASE,
          baseUrl: `http://${env.HOST}:${env.PORT}${env.API_BASE}`
        },
        server: {
          host: env.HOST,
          port: env.PORT,
          uptime: uptime.toFixed(2),
          memory: {
            rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB',
            heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + 'MB',
            heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB'
          }
        },
        database: {
          host: env.DB_HOST,
          port: env.DB_PORT,
          name: env.DB_NAME,
          status: dbCheck.data.status,
          latency: `${dbCheck.data.latency}ms`
        }
      }
    };
  }
}