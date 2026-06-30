// src/controllers/pulic/HealthController.ts
import { Request, Response } from 'express';
import { HealthService } from '../../services/HealthService';

export class HealthController {
  // GET /health - public health check point 
  static async check(req: Request, res: Response){
    try{
      const health = await HealthService.getHealth();
      res.status(200).json(health);
    }catch(error: any){
      res.status(500).json({
        success: false,
        data: {
          message: error.message,
          error: 'Health check failed'
        }
      });
    }
  }

  // GET /health/live - lightweight liveness probe
  static async live(req:Request, res: Response){
    res.status(200).json({
      success: true,
      data: {
        state: 'alive',
        timestamp: new Date().toISOString()
      }
    });
  }

  // GET /heath/redy - readiness probe (include DB check)
  static async ready(req: Request, res: Response){
    const health = await HealthService.getHealth();
    const status = health.data.state === 'healthy' ? 200 : 500;
    res.status(status).json(health);
  }
}