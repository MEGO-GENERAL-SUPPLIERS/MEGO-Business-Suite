import 'dotenv-safe/config';
import { z } from 'zod';

const envSchema = z.object({
  // Server configuration
  HOST: z.string().default('localhost'),
  PORT: z.string().transform(Number).pipe(z.number()).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE: z.string().default('/api/v1'),

  // Database configuration
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).pipe(z.number()).default('3306'),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().default('mego_admin'),
  DB_ROOT_PASSWORD: z.string().optional(),

  // 🔑 JWT Configuration (CRITICAL FOR SECURITY)
  JWT_SECRET: z.string()
    .min(32, {
      message: 'JWT_SECRET must be at least 32 characters for security'
    })
    .default('emmanuelzaphenathpaneahkapondanyondo'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d')
});

export const env = envSchema.parse(process.env);