// src/service/DocsService.ts
import packageJson from '../../package.json';
import { env } from '../config/env.js';

export class DocsService {
  
  //Get API Docs 
  static getDocumentation(){
    const baseUrl = `http://${env.HOST}:${env.PORT}${env.API_BASE}`;
    
    return{
      title: 'MEGO Business Suite API',
      version: packageJson.version || '1.0.0',
      description: 'Business Suite API for MEGO platform',
      baseUrl: baseUrl,
      apiBase: env.API_BASE,
      endpoints: {
        health: {
          path: `${env.API_BASE}/health`,
          method: "GET",
          description: "Health check endpoint",
          public: true
        },
        docs: {
          path: `${env.API_BASE}/docs`,
          method: "GET",
          description: "API Documentation",
          public: true
        },
        // Add more endpoints
      },
      authentication: {
        type: "JWT",
        header: "Authorization: Bearer <token>",
        endpoints: {
          login: `${env.API_BASE}/auth/login`,
          register: `${env.API_BASE}/auth/register`
        }
      }
    };
  }
}