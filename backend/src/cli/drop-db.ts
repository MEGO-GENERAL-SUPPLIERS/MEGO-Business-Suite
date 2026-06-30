// src/cli/drop-db.ts
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import consola from 'consola';
import { isDirectExecution } from './cli-utils.js';
import readline from 'readline';

/**
 * Database Drop Script with Confirmation Prompt
 * 
 * SAFETY FEATURES:
 *   • Requires explicit confirmation
 *   • Shows clear warning about data loss
 *   • Checks if database exists before attempting drop
 *   • Requires DB_ROOT_PASSWORD for destructive operations
 */

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  consola.info('='.repeat(60));
  consola.info('⚠️  DATABASE DROP UTILITY ⚠️');
  consola.info('='.repeat(60));
  consola.warn(`\n🚨 CRITICAL WARNING:`);
  consola.warn(`   You are about to DROP the database: ${env.DB_NAME}`);
  consola.warn(`   ALL DATA WILL BE PERMANENTLY DELETED!`);
  consola.warn(`   This action CANNOT be undone.`);
  consola.warn(`   Ensure you have a backup before proceeding.\n`);
  consola.info(`Target database: ${env.DB_NAME}`);
  consola.info(`Host: ${env.DB_HOST}:${env.DB_PORT}`);
  consola.info(`User: ${env.DB_USER}`);
  consola.info('='.repeat(60) + '\n');

  // Safety check: Require DB_ROOT_PASSWORD for destructive operations
  if (!env.DB_ROOT_PASSWORD) {
    consola.fatal('❌ SAFETY VIOLATION: DB_ROOT_PASSWORD is required to drop database');
    consola.info('💡 Set DB_ROOT_PASSWORD in .env to enable destructive operations');
    process.exit(1);
  }

  // Prompt for confirmation
  consola.warn('❓ Do you really want to drop this database?');
  consola.warn('   Type "yes" to confirm or anything else to cancel:');
  
  const confirmation = await promptUser('> ');

  if (confirmation !== 'yes') {
    consola.info('\nℹ️  Operation cancelled by user');
    process.exit(0);
  }

  consola.info('\n🔍 Verifying database exists...');
  
  let connection: mysql.Connection | undefined;
  
  try {
    // Connect as root (required for DROP DATABASE)
    consola.info(`🔌 Connecting as 'root'...`);
    connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: 'root',
      password: env.DB_ROOT_PASSWORD,
      database: 'mysql',
      connectTimeout: 5000
    });
    consola.success(`✅ Connected as 'root'`);

    // Check if database exists
    const [rows] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [env.DB_NAME]
    );
    
    if ((rows as any[]).length === 0) {
      consola.warn(`⚠️  Database '${env.DB_NAME}' does not exist`);
      consola.info('💡 Nothing to drop');
      return;
    }

    consola.warn(`\n🚨 FINAL WARNING:`);
    consola.warn(`   About to drop: ${env.DB_NAME}`);
    consola.warn(`   This will DELETE ALL TABLES AND DATA!`);
    consola.warn(`\n❓ Are you ABSOLUTELY SURE? Type the database name to confirm:`);
    
    const finalConfirmation = await promptUser(`> `);

    if (finalConfirmation !== env.DB_NAME) {
      consola.info('\nℹ️  Operation cancelled - database name mismatch');
      process.exit(0);
    }

    // Drop the database
    consola.info(`\n🗑️  Dropping database '${env.DB_NAME}'...`);
    await connection.query(`DROP DATABASE \`${env.DB_NAME}\``);
    
    consola.success(`\n✅ SUCCESS: Database '${env.DB_NAME}' has been DROPPED!`);
    consola.warn(`   ⚠️  ALL DATA IS PERMANENTLY LOST`);
    
  } catch (error: any) {
    consola.error('\n❌ Database drop failed');
    
    switch (error.code) {
      case 'ER_DB_DROP_EXISTS':
        consola.warn('⚠️  Database does not exist (already dropped)');
        break;
      case 'ER_ACCESS_DENIED_ERROR':
        consola.fatal('🔑 Insufficient privileges. Root user required.');
        break;
      case 'ER_DB_DROP_RMDIR':
        consola.fatal('📁 Cannot remove database directory. Check file permissions.');
        break;
      case 'ER_DBACCESS_DENIED_ERROR':
        consola.fatal(`🔑 Access denied for database: ${env.DB_NAME}`);
        break;
      default:
        consola.fatal(`💥 ${error.message}`);
        if (error.sqlMessage) consola.error(`SQL: ${error.sqlMessage}`);
        if (error.sql) consola.error(`Query: ${error.sql}`);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      consola.info('\n🔌 Connection closed');
    }
    
    consola.info('='.repeat(60));
    consola.info('⚠️  DATABASE DROP COMPLETE ⚠️');
    consola.info('='.repeat(60));
  }
}

// ✅ SAFE EXECUTION
if (isDirectExecution('drop-db.ts')) {
  main().catch(error => {
    consola.fatal('\n💥 Unhandled error:', error.message || error);
    process.exit(1);
  });
}