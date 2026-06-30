// src/cli/generate-seeder.ts
import { writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import consola from 'consola';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

async function generateSeeder() {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  const seederName = args[0]?.replace(/^--/, '');

  if (!seederName) {
    consola.fatal('\n❌ Missing seeder name');
    consola.info('💡 Usage: npm run db:generate:seeder -- your-seeder-name');
    consola.info('   Example: npm run db:generate:seeder -- seed-genders');
    process.exit(1);
  }

  // Generate timestamp
  const timestamp = new Date().toISOString()
    .replace(/[-:T]/g, '')
    .replace(/\..+/, '')
    .slice(0, 14);

  const sanitized = seederName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const fileName = `${timestamp}-${sanitized}.ts`;
  const seedersDir = join(PROJECT_ROOT, 'src', 'database', 'seeders');
  const filePath = join(seedersDir, fileName);

  consola.info(`📝 Creating seeder: ${fileName}`);

  // Ensure directory exists
  try {
    await access(seedersDir);
  } catch {
    await mkdir(seedersDir, { recursive: true });
    consola.success('✅ Created seeders directory');
  }

  // 🔑 ENHANCED TEMPLATE: SEEDVALUES array pattern with looping
  const template = `/**
 * Seeder: ${sanitized.replace(/-/g, ' ')}
 * Generated: ${new Date().toISOString()}
 * 
 * Idempotent seeder using SEEDVALUES array pattern.
 * 
 * Pattern Benefits:
 *   • Single source of truth for seed data
 *   • Easy to add/remove values
 *   • Consistent insert/update logic
 *   • Type-safe with TypeScript
 */

import type { QueryInterface } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';
import consola from 'consola';

// ========================
// SEED DATA DEFINITION
// ========================
/**
 * Define all seed values here as a typed array
 * 
 * @example
 * const SEEDVALUES = [
 *   { name: 'Male', alias_name: 'M' },
 *   { name: 'Female', alias_name: 'F' }
 * ] as const;
 */
const SEEDVALUES = [
  // Add your seed data objects here
  // Example for a genders table:
  // { name: 'Male', alias_name: 'M' },
  // { name: 'Female', alias_name: 'F' },
  // { name: 'Unknown', alias_name: 'U' }
] as const;

// Type inference from SEEDVALUES array
type SeedValue = typeof SEEDVALUES[number];

/**
 * Seed function - executed by seeder runner
 * 
 * Loops through SEEDVALUES array and inserts/updates each record
 */
export async function seed(queryInterface: QueryInterface): Promise<void> {
  consola.info(\`🌱 Seeding \${SEEDVALUES.length} record(s) for ${sanitized.replace(/-/g, ' ')}...\`);

  try {
    // Loop through each seed value
    for (const [index, value] of SEEDVALUES.entries()) {
      try {
        // ✅ Idempotent insert with ON DUPLICATE KEY UPDATE
        // Adjust table name and columns to match your schema
        await sequelize.query(\`
          INSERT INTO \\\`your_table_name\\\` 
            (\\\`name\\\`, \\\`alias_name\`, \\\`void\\\`, \\\`created_at\\\`, \\\`updated_at\\\`)
          VALUES 
            (:name, :alias_name, 0, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            \\\`alias_name\\\` = VALUES(\\\`alias_name\\\`),
            \\\`void\\\` = 0,  -- Reactivate if soft-deleted
            \\\`updated_at\\\` = NOW()
        \`, {
          replacements: {
            name: value.name,
            alias_name: value.alias_name
            // Add other fields from value object as needed
          },
          type: QueryTypes.INSERT
        });

        consola.success(\`  ✅ [\${index + 1}/\${SEEDVALUES.length}] \${String(value.name).padEnd(20)} | Seeded\`);
      } catch (error: any) {
        consola.error(\`  ❌ [\${index + 1}/\${SEEDVALUES.length}] Failed to seed \${String(value.name)}:\`, error.message);
        throw error;
      }
    }

    // Verification query
    const [results] = await sequelize.query(\`
      SELECT COUNT(*) as count FROM \`your_table_name\` WHERE void = 0
    \`, {
      type: QueryTypes.SELECT
    });

    const activeCount = (results as any[]).length;
    consola.success(\`\\n  📊 Total active records: \${activeCount} / \${SEEDVALUES.length}\`);
  } catch (error: any) {
    consola.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

/**
 * Rollback function - soft-deletes seeded records
 * 
 * Loops through SEEDVALUES and soft-deletes matching records
 * Preserves data integrity (no hard deletes)
 */
export async function unseed(queryInterface: QueryInterface): Promise<void> {
  consola.warn(\`⚠️  Rolling back \${SEEDVALUES.length} record(s) for ${sanitized.replace(/-/g, ' ')}...\`);

  try {
    // Extract names/identifiers for soft-delete query
    const identifiers = SEEDVALUES.map(v => v.name);

    if (identifiers.length === 0) {
      consola.warn('  ⚠️  No seed values defined - nothing to rollback');
      return;
    }

    // Soft-delete all seeded records (void = 1)
    await sequelize.query(\`
      UPDATE \\\`your_table_name\\\` 
      SET void = 1 
      WHERE name IN (:identifiers) AND void = 0
    \`, {
      replacements: { identifiers },
      type: QueryTypes.UPDATE
    });

    consola.success(\`  ✅ Soft-deleted \${identifiers.length} record(s)\`);
  } catch (error: any) {
    consola.error('❌ Rollback failed:', error.message);
    throw error;
  }
}
`;

  await writeFile(filePath, template.trim(), 'utf8');
  
  consola.success(`\n✨ Seeder created: ${fileName}`);
  consola.info(`   Location: ${filePath}`);
  consola.info(`\n💡 Next steps:`);
  consola.info(`   1. Define your seed data in SEEDVALUES array`);
  consola.info(`   2. Update table name and columns in seed()/unseed()`);
  consola.info(`   3. Run: npm run db:seed`);
  consola.info(`\n✅ Pattern benefits:`);
  consola.info(`   • Single source of truth for seed data`);
  consola.info(`   • Easy to maintain and extend`);
  consola.info(`   • Type-safe with TypeScript inference`);
}

generateSeeder().catch(error => {
  consola.fatal('Failed to generate seeder:', error.message);
  process.exit(1);
});