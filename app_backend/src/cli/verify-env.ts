// src/cli/verify-env.ts
import { env } from '../config/env.js';
import consola from 'consola';

consola.info('='.repeat(60));
consola.info('ENVIRONMENT CONFIGURATION VERIFICATION');
consola.info('='.repeat(60));

const checks = [
  { key: 'NODE_ENV', value: env.NODE_ENV, required: true },
  { key: 'HOST', value: env.HOST, required: true },
  { key: 'PORT', value: env.PORT, required: true },
  { key: 'API_BASE', value: env.API_BASE, required: true }, // ✅ NEW
  { key: 'DB_HOST', value: env.DB_HOST, required: true },
  { key: 'DB_PORT', value: env.DB_PORT, required: true },
  { key: 'DB_USER', value: env.DB_USER, required: true },
  { key: 'DB_PASSWORD', value: env.DB_PASSWORD ? '***' : '❌ MISSING', required: true },
  { key: 'DB_NAME', value: env.DB_NAME, required: true },
  { key: 'JWT_SECRET', value: env.JWT_SECRET ? '***' : '❌ MISSING', required: true },
  { key: 'DB_ROOT_PASSWORD', value: env.DB_ROOT_PASSWORD ? '***' : '⚠️  Optional', required: false },
];

checks.forEach(({ key, value, required }) => {
  const status = value && value !== '❌ MISSING' ? '✅' : required ? '❌' : '⚠️';
  consola.info(`${status} ${key}: ${value}`);
});

const hasErrors = checks.some(({ value, required }) => required && (!value || value === '❌ MISSING'));

consola.info('='.repeat(60));

if (hasErrors) {
  consola.fatal('\n❌ Required environment variables are missing!');
  consola.info('💡 Check your .env file and ensure all required variables are set');
  process.exit(1);
} else {
  consola.success('\n✅ All required environment variables are configured');
  process.exit(0);
}