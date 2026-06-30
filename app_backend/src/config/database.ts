// src/config/database.ts
import { Sequelize } from 'sequelize';
import { env } from './env.js';
import consola from 'consola';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Sequelize: SequelizeConstructor } = require('sequelize') as typeof import('sequelize');

export const sequelize = new SequelizeConstructor(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'mysql',
    logging: env.NODE_ENV === 'development' ? (msg: string) => consola.debug(msg) : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: env.NODE_ENV === 'production' 
      ? { ssl: { require: true, rejectUnauthorized: false } } 
      : {}
  }
);

export async function checkDbConnection(context: string): Promise<void> {
  consola.info(`🔍 [${context}] Checking database connectivity...`);
  
  try {
    await sequelize.authenticate();
    consola.success(`✅ [${context}] Database connection verified`);
  } catch (error: any) {
    consola.error(`❌ [${context}] Database connection FAILED`);
    
    const errCode = error.parent?.code || error.code;
    
    switch (errCode) {
      case 'ER_ACCESS_DENIED_ERROR':
        consola.fatal('🔑 Authentication failed. Verify DB_USER/DB_PASSWORD in .env');
        break;
      case 'ECONNREFUSED':
        consola.fatal(`🔌 Cannot reach MySQL at ${env.DB_HOST}:${env.DB_PORT}. Is server running?`);
        break;
      case 'ER_BAD_DB_ERROR':
        consola.warn(`⚠️  Database '${env.DB_NAME}' does not exist. Run: npm run db:create`);
        process.exit(1);
      case 'ENOTFOUND':
        consola.fatal(`🌐 Invalid DB_HOST: ${env.DB_HOST}`);
        break;
      default:
        consola.fatal(`💥 Unexpected error: ${error.message}`);
        if (error.parent?.sqlMessage) consola.error(`SQL Detail: ${error.parent.sqlMessage}`);
    }
    
    process.exit(1);
  }
}

// ✅ NO CLI EXECUTION HERE - exports only!