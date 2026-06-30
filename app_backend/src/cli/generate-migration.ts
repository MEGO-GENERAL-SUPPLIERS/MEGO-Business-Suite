// src/cli/generate-migration.ts
import { writeFile, mkdir, access, constants } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import consola from 'consola';
import { isDirectExecution } from './cli-utils.js';

// 🔑 RELIABLE CLI DETECTION (works with npm run)
const IS_CLI = process.argv[1].endsWith('generate-migration.ts') || 
               process.argv[1].endsWith('generate-migration.js') ||
               process.argv.some(arg => arg.includes('generate-migration'));

if (!IS_CLI) {
  consola.warn('⚠️  Script not running as CLI. Skipping execution.');
  consola.info('💡 This script should be run via: npm run db:generate:migration -- [options] migration-name');
  process.exit(0);
}

// Resolve PROJECT ROOT (2 levels up from src/cli/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../..'); // mego-admin-dashboard-api/

consola.info('='.repeat(60));
consola.info('🔧 MIGRATION GENERATOR DIAGNOSTICS');
consola.info('='.repeat(60));
consola.info(`Script location: ${__filename}`);
consola.info(`Script directory: ${__dirname}`);
consola.info(`Project root: ${PROJECT_ROOT}`);
consola.info(`Working directory: ${process.cwd()}`);
consola.info(`Node version: ${process.version}`);
consola.info(`Platform: ${process.platform}`);
consola.info('='.repeat(60));

/**
 * Parse command-line arguments with type safety
 */
interface CliArgs {
  migrationName: string;
  isDefaultMode: boolean;
  tableName: string; // Always resolved (never undefined)
}

function parseArgs(): CliArgs {
  const rawArgs = process.argv.slice(2);
  
  // Extract flags and migration name
  const flags = rawArgs.filter(arg => arg.startsWith('--'));
  const positionalArgs = rawArgs.filter(arg => !arg.startsWith('--'));
  
  const migrationName = positionalArgs[0];
  
  if (!migrationName) {
    consola.fatal('\n❌ Missing migration name');
    consola.info('\n💡 Usage:');
    consola.info('   Basic mode (empty template):');
    consola.info('      npm run db:generate:migration -- your-migration-name');
    consola.info('\n   Default mode (Rails-like table template):');
    consola.info('      npm run db:generate:migration -- --default --table-name=your_table_name your-migration-name');
    consola.info('\n   Examples:');
    consola.info('      npm run db:generate:migration -- create-users-table');
    consola.info('      npm run db:generate:migration -- --default --table-name=admins create-admins-table');
    process.exit(1);
  }

  // Check for --default flag
  const isDefaultMode = flags.includes('--default');
  
  // Extract table name from --table-name=xxx flag, fallback to snake_case migration name
  const tableNameFlag = flags.find(flag => flag.startsWith('--table-name='));
  const tableName = tableNameFlag 
    ? tableNameFlag.split('=')[1] 
    : toSnakeCase(migrationName); // ✅ Resolved upfront - no reassignment needed

  return { migrationName, isDefaultMode, tableName };
}

/**
 * Sanitize and convert name to snake_case
 */
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toSnakeCase(name: string): string {
  return sanitizeName(name).replace(/-/g, '_');
}

/**
 * Generate default mode template (Rails-like table)
 */
function generateDefaultTemplate(tableName: string, migrationName: string): string {
  const sanitized = sanitizeName(migrationName);
  const timestamp = new Date().toISOString();
  
  return `/**
 * Migration: ${sanitized.replace(/-/g, ' ')}
 * Generated: ${timestamp}
 * 
 * Rails-like table template with:
 * - id: BIGINT auto-increment primary key (first field)
 * - created_at: TIMESTAMP with DEFAULT CURRENT_TIMESTAMP
 * - updated_at: TIMESTAMP with ON UPDATE CURRENT_TIMESTAMP (via raw SQL)
 * - Transaction-safe with rollback on error
 */

import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';
import consola from 'consola';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // === STEP 1: Create table with Rails defaults ===
    await queryInterface.createTable('${tableName}', {
      // === ID FIELD (FIRST) ===
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Primary key'
      },
      
      // === CUSTOM FIELDS (BETWEEN ID AND TIMESTAMPS) ===
      // Add your custom fields here. Examples:
      // 
      // email: {
      //   type: DataTypes.STRING(255),
      //   allowNull: false,
      //   unique: true,
      //   comment: 'User email address'
      // },
      // 
      // full_name: {
      //   type: DataTypes.STRING(255),
      //   allowNull: true,
      //   comment: 'User full name'
      // },
      // 
      // is_active: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: true,
      //   comment: 'Account active status'
      // },
      
      // === TIMESTAMPS (LAST) ===
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Record creation timestamp'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Record last update timestamp'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      engine: 'InnoDB'
    }, { transaction });

    // === STEP 2: Enable Rails timestamp behavior (MySQL-specific) ===
    // Adds ON UPDATE CURRENT_TIMESTAMP to updated_at column
    await queryInterface.sequelize.query(\`
      ALTER TABLE \\\`${tableName}\\\`
      MODIFY updated_at TIMESTAMP 
      NOT NULL 
      DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP
    \`, { transaction });

    // === STEP 3: Add indexes (optional) ===
    // await queryInterface.addIndex('${tableName}', ['created_at'], {
    //   name: 'idx_${tableName}_created_at',
    //   transaction
    // });

    await transaction.commit();
    consola.success('⬆️  Migration executed: ${sanitized}');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.dropTable('${tableName}', { transaction });
    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: ${sanitized}');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}
`;
}

/**
 * Generate basic mode template (empty with transaction)
 */
function generateBasicTemplate(migrationName: string): string {
  const sanitized = sanitizeName(migrationName);
  const timestamp = new Date().toISOString();
  
  return `/**
 * Migration: ${sanitized.replace(/-/g, ' ')}
 * Generated: ${timestamp}
 * Author: ...
 */

import type { QueryInterface } from 'sequelize';
import consola from 'consola';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // === ADD YOUR MIGRATION LOGIC HERE ===
    // Examples:
    // 
    // Create table:
    // await queryInterface.createTable('table_name', { ... }, { transaction });
    // 
    // Add column:
    // await queryInterface.addColumn('table_name', 'new_column', { ... }, { transaction });
    // 
    // Remove column:
    // await queryInterface.removeColumn('table_name', 'old_column', { transaction });
    // 
    // Rename table:
    // await queryInterface.renameTable('old_table_name', 'new_table_name', { transaction });
    // 
    // Raw SQL:
    // await queryInterface.sequelize.query('YOUR SQL HERE', { transaction });

    // === ADD INDICES ===
    // Add Index:
    // await queryInterface.addIndex('table_name', ['column'], {...options, transaction });
    //
    // Remove Index:
    // await queryInterface.removeIndex('table_name', 'index_name', { transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: ${sanitized}');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // === ADD YOUR ROLLBACK LOGIC HERE ===
    // Reverse the operations from up()
    // Drop table:
    // await queryInterface.dropTable('table_name', { transaction });
    //
    // Raw SQL:
    // await queryInterface.sequelize.query('YOUR SQL HERE', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: ${sanitized}');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}
`;
}

/**
 * Main migration generation function
 */
async function generateMigration() {
  // ✅ FIXED: tableName resolved upfront in parseArgs() - no reassignment
  const { migrationName, isDefaultMode, tableName } = parseArgs();
  
  // Generate timestamp
  const timestamp = new Date().toISOString()
    .replace(/[-:T]/g, '')
    .replace(/\..+/, '')
    .slice(0, 14);

  const sanitized = sanitizeName(migrationName);
  const fileName = `${timestamp}-${sanitized}.ts`;
  const migrationsDir = join(PROJECT_ROOT, 'src', 'database', 'migrations');
  const filePath = join(migrationsDir, fileName);

  consola.info('\n📁 Target paths:');
  consola.info(`   Migrations directory: ${migrationsDir}`);
  consola.info(`   Target file: ${filePath}`);
  consola.info(`\n⚙️  Generation mode: ${isDefaultMode ? 'DEFAULT (Rails table)' : 'BASIC (empty template)'}`);
  consola.info(`   Table name: ${tableName}`);

  // 🔍 STEP 1: Verify directory exists or create it
  try {
    await access(migrationsDir, constants.F_OK);
    consola.success(`✅ Migrations directory exists`);
  } catch {
    consola.warn(`⚠️  Creating migrations directory: ${migrationsDir}`);
    try {
      await mkdir(migrationsDir, { recursive: true });
      consola.success(`✅ Directory created successfully`);
    } catch (err: any) {
      consola.fatal(`❌ Failed to create directory: ${err.message}`);
      consola.error(`💡 Check permissions for: ${PROJECT_ROOT}`);
      process.exit(1);
    }
  }

  // 🔍 STEP 2: Verify write permissions
  try {
    await access(migrationsDir, constants.W_OK);
    consola.success(`✅ Write permission verified`);
  } catch {
    consola.fatal(`❌ No write permission for: ${migrationsDir}`);
    consola.info('💡 Fix permissions with: chmod u+w src/database/migrations');
    process.exit(1);
  }

  // 🔍 STEP 3: Generate appropriate template
  const template = isDefaultMode 
    ? generateDefaultTemplate(tableName, migrationName)
    : generateBasicTemplate(migrationName);

  // 🔍 STEP 4: Write file with explicit error capture
  try {
    consola.info(`\n📝 Writing migration: ${fileName}`);
    await writeFile(filePath, template.trim(), 'utf8');
    
    // 🔍 STEP 5: Verify file was actually created
    await access(filePath, constants.F_OK);
    
    consola.success('\n' + '='.repeat(60));
    consola.success('✨ MIGRATION CREATED SUCCESSFULLY!');
    consola.success('='.repeat(60));
    consola.info(`📁 Location: ${filePath}`);
    consola.info(`\n📝 Next steps:`);
    if (isDefaultMode) {
      consola.info(`   1. Edit file: ${fileName}`);
      consola.info(`   2. Add custom fields between id and timestamps`);
      consola.info(`   3. Configure indexes if needed`);
    } else {
      consola.info(`   1. Edit file: ${fileName}`);
      consola.info(`   2. Add your migration logic in the try block`);
    }
    consola.info(`   3. Run: npm run db:migrate`);
    consola.success('='.repeat(60) + '\n');
    
  } catch (error: any) {
    consola.fatal('\n' + '='.repeat(60));
    consola.fatal('❌ FATAL: Migration creation failed');
    consola.fatal('='.repeat(60));
    consola.error(`File path: ${filePath}`);
    consola.error(`Error type: ${error.constructor.name}`);
    consola.error(`Message: ${error.message}`);
    if (error.code) consola.error(`System code: ${error.code}`);
    if (error.errno) consola.error(`Errno: ${error.errno}`);
    if (error.syscall) consola.error(`Syscall: ${error.syscall}`);
    consola.error(`Stack:\n${error.stack}`);
    consola.fatal('='.repeat(60) + '\n');
    process.exit(1);
  }
}

// Execute immediately
// generateMigration().catch(err => {
//   consola.fatal('Unhandled error:', err);
//   process.exit(1);
// });

if (isDirectExecution('generate-migration.ts')) {
  generateMigration().catch(error => {
    consola.fatal('Unhandled error:', error);
    process.exit(1);
  });
}