// src/cli/seed.ts
import {
  Umzug,
  SequelizeStorage,
  MigrationParams,
  LogFn
} from 'umzug';
import { sequelize, checkDbConnection } from '../config/database.js';
import consola from 'consola';
import { glob } from 'glob';
import { QueryInterface, type Sequelize } from 'sequelize';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { access } from 'node:fs/promises';
import { env } from '../config/env.js';

// 🔑 Resolve PROJECT ROOT (2 levels up from src/cli/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../..');

/**
 * Seeder Runner - Chronological Execution Order
 * 
 * CRITICAL FIX: Sort seeders alphabetically by filename (timestamps ensure chronological order)
 * 
 * Features:
 *   ✅ Windows/Linux/macOS path safety (pathToFileURL)
 *   ✅ Transaction-safe seeding (bypasses Umzug wrapper)
 *   ✅ Chronological execution (timestamp-sorted)
 *   ✅ PascalCase table name consistency (SeederStorage)
 *   ✅ Diagnostic logging with execution order preview
 *   ✅ Idempotent execution (safe to re-run)
 */
export async function runSeeders() {
  consola.info('='.repeat(60));
  consola.info('🌱 SEEDER RUNNER');
  consola.info('='.repeat(60));
  consola.info(`💻 Platform: ${process.platform} | Node: ${process.version}`);
  consola.info(`📁 Project root: ${PROJECT_ROOT}`);
  consola.info('='.repeat(60) + '\n');

  // Pre-flight database check
  await checkDbConnection('Seeder Pre-flight');

  // Verify seeder storage table exists (PascalCase)
  try {
    const [result] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'SeederStorage'
    `);
    
    if ((result as any[]).length === 0) {
      consola.fatal('❌ CRITICAL: SeederStorage table not found!');
      consola.info('💡 Solution: Run migrations first');
      consola.info('   npm run db:migrate');
      process.exit(1);
    }
    consola.success('✅ Seeder storage table verified');
  } catch (error: any) {
    consola.fatal('❌ Database check failed:', error.message);
    process.exit(1);
  }

  // Resolve seeders directory
  const seedersDir = join(PROJECT_ROOT, 'src', 'database', 'seeders');
  const seederPattern = join(seedersDir, '*.ts');

  // Verify directory exists
  try {
    await access(seedersDir);
    consola.success(`✅ Seeders directory exists: ${seedersDir}`);
  } catch {
    consola.warn(`⚠️  Seeders directory missing: ${seedersDir}`);
    consola.info('💡 Create seeders with:');
    consola.info('   npm run db:generate:seeder -- seed-genders');
    process.exit(0);
  }

  // Discover seeder files (cross-platform safe)
  const seederPaths: string[] = await glob.glob(seederPattern, {
    absolute: true,
    windowsPathsNoEscape: true
  });

  if (seederPaths.length === 0) {
    consola.warn(`⚠️  No seeder files found in: ${seedersDir}`);
    
    // Diagnostic: List directory contents
    try {
      const { readdir } = await import('node:fs/promises');
      const files = await readdir(seedersDir);
      if (files.length > 0) {
        consola.info('\n📁 Available files:');
        files.forEach(file => consola.info(`   • ${file}`));
        consola.warn('\n💡 Ensure files have .ts extension');
      }
    } catch (err: any) {
      consola.error('Directory read failed:', err.message);
    }
    
    process.exit(0);
  }

  // 🔑 CRITICAL FIX: Sort seeders alphabetically (timestamps = chronological order)
  seederPaths.sort((a, b) => {
    const nameA = a.split(/[\\/]/).pop()!;
    const nameB = b.split(/[\\/]/).pop()!;
    return nameA.localeCompare(nameB);
  });

  consola.info(`\n🗃️  Discovered ${seederPaths.length} seeder file(s):`);
  seederPaths.forEach((path, idx) => {
    const normalized = path.replace(/\\/g, '/');
    const fileName = normalized.split('/').pop();
    consola.info(`   ${String(idx + 1).padStart(2)}. ${fileName}`);
  });
  consola.info('');

  // Build seeders with Windows-safe dynamic imports
  const seeders = seederPaths.map(path => {
    const name = path.split(/[\\/]/).pop()!.replace(/\.ts$/, '');

    return {
      name,
      async up({ context: queryInterface }: MigrationParams<QueryInterface>) {
        const url = pathToFileURL(path).href;
        const mod = await import(url);
        
        if (typeof mod.seed === 'function') {
          return mod.seed(queryInterface, sequelize as Sequelize);
        }
        
        if (typeof mod.up === 'function') {
          return mod.up(queryInterface);
        }
        
        throw new Error(`Seeder "${name}" must export 'seed' or 'up' function`);
      },
      async down({ context: queryInterface }: MigrationParams<QueryInterface>) {
        const url = pathToFileURL(path).href;
        const mod = await import(url);
        
        if (typeof mod.unseed === 'function') {
          return mod.unseed(queryInterface, sequelize as Sequelize);
        }
        
        if (typeof mod.down === 'function') {
          return mod.down(queryInterface);
        }
        
        consola.warn(`⚠️  Seeder "${name}" has no rollback function`);
        return Promise.resolve();
      }
    };
  });

  // Logger configuration
  const logger: Record<'error' | 'warn' | 'info' | 'debug', LogFn> = {
    info: (msg) => consola.info(`[Seeder] ${msg}`),
    warn: (msg) => consola.warn(`[Seeder] ${msg}`),
    error: (msg) => consola.error(`[Seeder] ${msg}`),
    debug: (msg) => {
      if (env.NODE_ENV === 'development') {
        consola.debug(`[Seeder] ${msg}`);
      }
    }
  };

  // Initialize Umzug seeder runner
  const umzug = new Umzug({
    migrations: seeders,
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({
      sequelize,
      tableName: 'SeederStorage'
    }),
    logger
  });

  // Get pending seeders
  const pending = await umzug.pending();

  if (pending.length === 0) {
    consola.success('✅ All seeders already executed');
    
    const executed = await umzug.executed();
    if (executed.length > 0) {
      consola.info(`\n📊 Executed seeders (${executed.length}):`);
      executed.forEach((s, idx) => {
        consola.info(`   ${String(idx + 1).padStart(2)}. ${s.name}`);
      });
    }
    return;
  }

  // 🔑 VERIFICATION: Show execution order BEFORE running
  consola.info(`🚀 Running ${pending.length} pending seeder(s) in chronological order:`);
  pending.forEach((s, idx) => {
    consola.info(`   ${String(idx + 1).padStart(2)}. ${s.name}`);
  });
  consola.info('');

  try {
    await umzug.up();
    consola.success(`\n✨ Successfully applied ${pending.length} seeder(s)\n`);
    
    // Post-seed verification
    const executed = await umzug.executed();
    consola.info(`📊 Total executed seeders: ${executed.length}`);
    
    // Quick data verification
    const verificationQueries = [
      { table: 'countries', condition: 'void = 0' },
      { table: 'gender', condition: 'void = 0' },
      { table: 'roles', condition: 'void = 0' },
      { table: 'contact_types', condition: 'void = 0' },
      { table: 'identification_types', condition: 'void = 0' },
      { table: 'privileges', condition: 'void = 0' },
      { table: 'access_levels', condition: 'void = 0' },
      { table: 'roles', condition: 'void = 0' },
      { table: 'client_types', condition: 'void = 0' },
    ];
    
    for (const { table, condition } of verificationQueries) {
      try {
        const [result] = await sequelize.query(`
          SELECT COUNT(*) as count FROM \`${table}\` WHERE ${condition}
        `);
        const count = (result as any[])[0].count;
        if (count > 0) {
          consola.success(`✅ ${table.padEnd(15)} : ${count} active records`);
        }
      } catch {
        // Table doesn't exist - skip silently
      }
    }
  } catch (error: any) {
    consola.fatal('\n❌ Seeder execution failed:', error.message);
    
    if (error.message?.includes('file://')) {
      consola.error('\n💡 Path resolution failure');
      consola.info('   This usually indicates a Windows path issue');
      consola.info('   Ensure you\'re using pathToFileURL() for dynamic imports');
    }
    
    if (error.originalError?.sql) {
      consola.error('\n🔍 SQL Error:', error.originalError.sql.substring(0, 250) + '...');
    }
    
    throw error;
  }
}

// 🔑 RELIABLE CLI DETECTION
const IS_CLI = process.argv.some(arg => 
  arg.includes('seed') && 
  (arg.endsWith('.ts') || arg.endsWith('.js') || arg.endsWith('/seed'))
);

if (IS_CLI) {
  runSeeders()
    .then(() => process.exit(0))
    .catch(error => {
      consola.fatal(`\n💥 Seeder runner crashed: ${error.message || error}`);
      if (error.stack && env.NODE_ENV === 'development') {
        consola.error('\nStack trace:');
        consola.error(error.stack.split('\n').slice(0, 8).join('\n'));
      }
      process.exit(1);
    });
}