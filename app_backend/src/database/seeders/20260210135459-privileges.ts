/**
 * Seeder: privileges
 * Generated: 2026-02-10T13:54:59.427Z
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
const SEEDVALUES = [
  { name: 'Manage Clients', action_name: 'can_manage_clients', parent_id: 0 },
  { name: 'Access Help', action_name: 'can_access_help', parent_id: 0 },
  { name: 'Configurations', action_name: 'can_access_configs', parent_id: 0 },
  { name: 'Reports', action_name: 'can_access_reports', parent_id: 0 },
] as const;

// Type inference from SEEDVALUES array
type SeedValue = typeof SEEDVALUES[number];

/**
 * Seed function - executed by seeder runner
 * 
 * Loops through SEEDVALUES array and inserts/updates each record
 */
export async function seed(queryInterface: QueryInterface): Promise<void> {
  consola.info(`🌱 Seeding ${SEEDVALUES.length} record(s) for privileges...`);

  try {
    // Loop through each seed value
    for (const [index, value] of SEEDVALUES.entries()) {
      try {
        // ✅ Idempotent insert with ON DUPLICATE KEY UPDATE
        // Adjust table name and columns to match your schema
        await sequelize.query(`
          INSERT INTO \`privileges\` 
            (\`name\`, \`action_name\`, \`void\`, \`created_at\`, \`updated_at\`)
          VALUES 
            (:name, :action_name, 0, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            \`action_name\` = VALUES(\`action_name\`),
            \`void\` = 0,  
            \`updated_at\` = NOW()
        `, {
          replacements: {
            name: value.name,
            action_name: value.action_name
            // Add other fields from value object as needed
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
      SELECT COUNT(*) as count FROM \`privileges\` WHERE void = 0
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
  consola.warn(`⚠️  Rolling back ${SEEDVALUES.length} record(s) for privileges...`);

  try {
    // Extract names/identifiers for soft-delete query
    const identifiers = SEEDVALUES.map(v => v.name);

    if (identifiers.length === 0) {
      consola.warn('  ⚠️  No seed values defined - nothing to rollback');
      return;
    }

    // Soft-delete all seeded records (void = 1)
    await sequelize.query(`
      UPDATE \`privileges\` 
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