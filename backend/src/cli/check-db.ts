// src/cli/create-db.ts
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import consola from 'consola';

// ✅ NO GUARDS - execute unconditionally
consola.info('='.repeat(60));
consola.info('DATABASE CREATION DIAGNOSTIC');
consola.info('='.repeat(60));
consola.info(`Target database: ${env.DB_NAME}`);
consola.info(`Host: ${env.DB_HOST}:${env.DB_PORT}`);
consola.info(`User: ${env.DB_USER}`);
if (env.DB_ROOT_PASSWORD) {
  consola.info(`Root fallback: ENABLED`);
} else {
  consola.warn(`Root fallback: DISABLED (set DB_ROOT_PASSWORD in .env)`);
}
consola.info('='.repeat(60) + '\n');

async function createDatabase() {
  consola.info(`🛠️  Attempting to create database: ${env.DB_NAME}`);
  
  let connection;
  try {
    consola.info(`🔌 Connecting as '${env.DB_USER}'...`);
    connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: 'mysql',
      connectTimeout: 5000
    });
    consola.success(`✅ Connected as '${env.DB_USER}'`);
  } catch (error: any) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR' && env.DB_ROOT_PASSWORD) {
      consola.warn(`⚠️  Falling back to root user...`);
      try {
        connection = await mysql.createConnection({
          host: env.DB_HOST,
          port: env.DB_PORT,
          user: 'root',
          password: env.DB_ROOT_PASSWORD,
          database: 'mysql',
          connectTimeout: 5000
        });
        consola.success(`✅ Connected as 'root'`);
      } catch (rootError: any) {
        consola.fatal(`❌ Root connection failed: ${rootError.message}`);
        process.exit(1);
      }
    } else {
      consola.fatal(`❌ Connection failed: ${error.message}`);
      if (error.code) consola.error(`Code: ${error.code}`);
      process.exit(1);
    }
  }

  try {
    const [rows] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [env.DB_NAME]
    );
    
    if ((rows as any[]).length > 0) {
      consola.success(`✅ Database '${env.DB_NAME}' already exists`);
      return;
    }

    await connection.query(`
      CREATE DATABASE \`${env.DB_NAME}\`
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
    `);
    
    consola.success(`\n✅ SUCCESS: Database '${env.DB_NAME}' created!`);
    consola.info(`   Charset: utf8mb4`);
    consola.info(`   Collation: utf8mb4_unicode_ci`);
  } catch (error: any) {
    consola.error('\n❌ Database creation failed');
    switch (error.code) {
      case 'ER_DB_CREATE_EXISTS':
        consola.success('✅ Database already exists');
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        consola.fatal('🔑 Insufficient privileges. Need CREATE DATABASE permission.');
        break;
      default:
        consola.fatal(`💥 ${error.message}`);
        if (error.sqlMessage) consola.error(`SQL: ${error.sqlMessage}`);
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    consola.info('🔌 Connection closed');
  }
}

createDatabase().catch(error => {
  consola.fatal('\n💥 Unhandled error:', error.message || error);
  process.exit(1);
});