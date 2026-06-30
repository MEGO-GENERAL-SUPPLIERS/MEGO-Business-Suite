// src/controllers/public/DocsController.ts
import { Request, Response } from 'express';
import { DocsService } from '../../services/DocsService';

export class DocsController{
  // GET /docs - API Documentation
  static async show(req: Request, res: Response){
    const docs = DocsService.getDocumentation();
    res.status(200).json(docs);
  }

  // GET /docs/endpoints - List all endpoints
  static async listEndpoints(req: Request, res: Response){
    const docs = DocsService.getDocumentation();
    res.status(200).json(docs.endpoints);
  }
}