// src/cli/migrate.ts
import { 
  Umzug, 
  SequelizeStorage, 
  MigrationParams,
  LogFn 
} from 'umzug';
import { sequelize, checkDbConnection } from '../config/database.js';
import consola from 'consola';
import { glob } from 'glob';
import { QueryInterface } from 'sequelize';
import { pathToFileURL } from 'node:url';

/**
 * Migration Runner with Chronological Execution Order
 * 
 * CRITICAL FIX: Sort migration paths alphabetically (timestamps ensure chronological order)
 * 
 * Usage:
 *   npm run db:migrate                          # Run pending migrations (chronological)
 *   npm run db:migrate -- rollback              # Rollback last migration
 *   npm run db:migrate -- rollback:2            # Rollback last 2 migrations
 *   npm run db:migrate -- rollback:all          # Rollback ALL migrations
 */

// Parse CLI arguments
const args = process.argv.slice(2);
const rollbackArg = args.find(arg => arg.startsWith('rollback'));
let rollbackMode: 'none' | 'latest' | 'count' | 'all' = 'none';
let rollbackCount: number = 1;

if (rollbackArg) {
  if (rollbackArg === 'rollback' || rollbackArg === 'rollback:1') {
    rollbackMode = 'latest';
  } else if (rollbackArg === 'rollback:all') {
    rollbackMode = 'all';
  } else if (rollbackArg.startsWith('rollback:')) {
    const count = parseInt(rollbackArg.split(':')[1]);
    if (!isNaN(count) && count > 0) {
      rollbackMode = 'count';
      rollbackCount = count;
    } else {
      consola.fatal(`❌ Invalid rollback count: ${rollbackArg}`);
      consola.info('💡 Usage: npm run db:migrate -- rollback:N (N = positive integer)');
      process.exit(1);
    }
  }
}

consola.info('='.repeat(60));
consola.info(rollbackMode === 'none' ? 'MIGRATION RUNNER' : 'MIGRATION ROLLBACK');
consola.info('='.repeat(60));

checkDbConnection('Migration Pre-flight')
  .then(async () => {
    // Discover .ts migration files
    const migrationPaths = await glob(
      new URL('../database/migrations/*.ts', import.meta.url).pathname
    );
    
    if (migrationPaths.length === 0) {
      consola.warn('⚠️  No migration files found in src/database/migrations/');
      process.exit(0);
    }

    // 🔑 CRITICAL FIX: Sort paths alphabetically (timestamps ensure chronological order)
    migrationPaths.sort((a, b) => {
      // Extract filename without path for comparison
      const nameA = a.split(/[\\/]/).pop()!;
      const nameB = b.split(/[\\/]/).pop()!;
      return nameA.localeCompare(nameB);
    });

    consola.info(`📁 Found ${migrationPaths.length} migration file(s)`);
    migrationPaths.forEach((path, idx) => {
      const fileName = path.split(/[\\/]/).pop();
      consola.info(`   ${String(idx + 1).padStart(2)}. ${fileName}`);
    });
    consola.info('');

    // Build migrations with Windows-safe dynamic imports
    const migrations = migrationPaths.map(path => {
      const name = path.split(/[\\/]/).pop()!.replace(/\.ts$/, '');
      
      return {
        name,
        async up({ context: queryInterface }: MigrationParams<QueryInterface>) {
          const url = pathToFileURL(path).href;
          const mod = await import(url);
          const { DataTypes } = await import('sequelize');
          return typeof mod.up === 'function' 
            ? mod.up(queryInterface, DataTypes) 
            : Promise.resolve();
        },
        async down({ context: queryInterface }: MigrationParams<QueryInterface>) {
          const url = pathToFileURL(path).href;
          const mod = await import(url);
          const { DataTypes } = await import('sequelize');
          return typeof mod.down === 'function' 
            ? mod.down(queryInterface, DataTypes) 
            : Promise.resolve();
        }
      };
    });

    // Logger with enhanced rollback visibility
    const logger: Record<'error' | 'warn' | 'info' | 'debug', LogFn> = {
      info: (msg: any) => {
        if (typeof msg === 'string' && msg.includes('down')) {
          consola.warn(`↩️  ${msg.replace('down', 'Rolling back')}`);
        } else {
          consola.info(`[Migration] ${msg}`);
        }
      },
      warn: (msg) => consola.warn(`[Migration] ${msg}`),
      error: (msg) => consola.error(`[Migration] ${msg}`),
      debug: (msg) => {
        if (process.env.NODE_ENV === 'development') {
          consola.debug(`[Migration] ${msg}`);
        }
      }
    };

    const umzug = new Umzug({
      migrations,
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger
    });

    // ========================
    // ROLLBACK MODE (FIXED IMPLEMENTATION)
    // ========================
    if (rollbackMode !== 'none') {
      const executed = await umzug.executed();
      
      if (executed.length === 0) {
        consola.warn('⚠️  No migrations to rollback');
        process.exit(0);
      }

      consola.info(`📊 Currently executed migrations: ${executed.length}`);
      if (rollbackMode !== 'all') {
        consola.info(`\n📝 Last executed migration: ${executed[executed.length - 1].name}`);
      }

      try {
        if (rollbackMode === 'all') {
          consola.info(`\n↩️  Rolling back ALL ${executed.length} migration(s)...`);
          await umzug.down({ to: 0 });
          consola.success(`\n✨ Successfully rolled back all ${executed.length} migration(s)`);
        } else {
          const count = rollbackMode === 'count' ? rollbackCount : 1;
          const available = executed.length;
          const actualCount = Math.min(count, available);
          
          if (count > available) {
            consola.warn(`⚠️  Requested ${count} but only ${available} available. Rolling back ${actualCount}.`);
          }
          
          consola.info(`\n↩️  Rolling back ${actualCount} migration(s)...\n`);
          
          for (let i = 0; i < actualCount; i++) {
            const current = await umzug.executed();
            if (current.length === 0) break;
            
            const target = current[current.length - 1].name;
            consola.info(`📝 Rolling back: ${target}`);
            await umzug.down();
            consola.success(`✅ Rolled back: ${target}\n`);
          }
          
          consola.success(`✨ Successfully rolled back ${actualCount} migration(s)`);
        }
        
        const remaining = await umzug.executed();
        consola.info(`\n📊 Migrations remaining: ${remaining.length}`);
        if (remaining.length > 0) {
          consola.info(`   Latest: ${remaining[remaining.length - 1].name}`);
        } else {
          consola.info('   No migrations remaining (database reset)');
        }
        
        process.exit(0);
      } catch (error: any) {
        consola.fatal(`\n❌ Rollback failed: ${error.message}`);
        if (error.originalError) consola.error(`SQL: ${error.originalError.sql}`);
        if (error.stack) {
          consola.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
        }
        process.exit(1);
      }
    }

    // ========================
    // FORWARD MIGRATION MODE (WITH ORDER VERIFICATION)
    // ========================
    const pending = await umzug.pending();
    if (pending.length === 0) {
      consola.success('✅ All migrations already applied');
      
      const executed = await umzug.executed();
      if (executed.length > 0) {
        consola.info(`\n📊 Executed migrations (${executed.length}):`);
        executed.forEach((m, idx) => {
          consola.info(`   ${String(idx + 1).padStart(2)}. ${m.name}`);
        });
      }
      
      process.exit(0);
    }

    // 🔑 VERIFICATION: Show execution order BEFORE running
    consola.info(`🚀 Running ${pending.length} pending migration(s) in chronological order:`);
    pending.forEach((m, idx) => {
      consola.info(`   ${String(idx + 1).padStart(2)}. ${m.name}`);
    });
    consola.info('');

    try {
      await umzug.up();
      consola.success(`\n✨ Applied ${pending.length} migration(s) successfully`);
      
      const executed = await umzug.executed();
      consola.info(`\n📊 Total executed migrations: ${executed.length}`);
      consola.info(`   Latest: ${executed[executed.length - 1].name}`);
    } catch (error: any) {
      consola.fatal(`\n❌ Migration failed: ${error.message}`);
      if (error.originalError) consola.error(`SQL: ${error.originalError.sql}`);
      if (error.stack) {
        consola.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
      }
      process.exit(1);
    }
    
    process.exit(0);
  })
  .catch(error => {
    consola.fatal('\n❌ Migration runner failed:', error.message || error);
    if (error.stack) {
      consola.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
  });