/**
 * Seeder: identification types
 * Generated: 2026-02-03T13:58:59.054Z
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
  { name: 'Passport', alias_name: 'Passport' },
  { name: 'National ID', alias_name: 'NID' },
  { name: 'Driver\'s License', alias_name: 'DL' }
] as const;

// Type inference from SEEDVALUES array
type SeedValue = typeof SEEDVALUES[number];

/**
 * Seed function - executed by seeder runner
 * 
 * Loops through SEEDVALUES array and inserts/updates each record
 */
export async function seed(queryInterface: QueryInterface): Promise<void> {
  consola.info(`🌱 Seeding ${SEEDVALUES.length} record(s) for identification types...`);

  try {
    // Loop through each seed value
    for (const [index, value] of SEEDVALUES.entries()) {
      try {
        // ✅ Idempotent insert with ON DUPLICATE KEY UPDATE
        // Adjust table name and columns to match your schema
        await sequelize.query(`
          INSERT INTO \`identification_types\` 
            (name, alias_name)
          VALUES 
            (:name, :alias_name)
          ON DUPLICATE KEY UPDATE
            alias_name = VALUES(alias_name)
        `, {
          replacements: {
            name: value.name,
            alias_name: value.alias_name
          },
          type: QueryTypes.INSERT
        });

        consola.success(`  ✅ [${index + 1}/${SEEDVALUES.length}] ${String(value.name).padEnd(20)} | Seeded`);
      } catch (error: any) {
        consola.error(`  ❌ [${index + 1}/${SEEDVALUES.length}] Failed to seed ${String(value.name)}:`, error.message);
        throw error;
      }
    }

    // Verification query
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count FROM \`identification_types\` WHERE void = 0
    `, {
      type: QueryTypes.SELECT
    });

    const activeCount = (results as any[]).length;
    consola.success(`\n  📊 Total active records: ${activeCount} / ${SEEDVALUES.length}`);
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
  consola.warn(`⚠️  Rolling back ${SEEDVALUES.length} record(s) for identification types...`);

  try {
    // Extract names/identifiers for soft-delete query
    const identifiers = SEEDVALUES.map(v => v.name);

    if (identifiers.length === 0) {
      consola.warn('  ⚠️  No seed values defined - nothing to rollback');
      return;
    }

    // Soft-delete all seeded records (void = 1)
    await sequelize.query(`
      UPDATE \`identification_types\` 
      SET void = 1 
      WHERE name IN (:identifiers) AND void = 0
    `, {
      replacements: { identifiers },
      type: QueryTypes.UPDATE
    });

    consola.success(`  ✅ Soft-deleted ${identifiers.length} record(s)`);
  } catch (error: any) {
    consola.error('❌ Rollback failed:', error.message);
    throw error;
  }
}