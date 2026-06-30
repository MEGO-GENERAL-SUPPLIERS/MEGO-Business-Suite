// src/database/seeders/20260203101427-seed-gender.ts
import type { QueryInterface, Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';
import consola from 'consola';
import { env } from '../../config/env.js';

const GENDERS = [
  { name: 'Male', alias_name: 'M' },
  { name: 'Female', alias_name: 'F' },
  { name: 'Unknown', alias_name: 'U' }
] as const;

// ✅ MUST accept sequelize instance to bypass Umzug transaction
export async function seed(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  consola.info('🌱 Seeding gender table...');

  try {
    // Verify table exists
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'gender'
    `);
    
    if ((tables as any[]).length === 0) {
      throw new Error('Gender table does not exist. Run migrations first!');
    }

    // Seed records WITHOUT transaction wrapper (CRITICAL)
    for (const [index, gender] of GENDERS.entries()) {
      const [result] = await sequelize.query(`
        INSERT INTO \`gender\` (name, alias_name, void, created_at, updated_at)
        VALUES (:name, :alias_name, 0, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          alias_name = VALUES(alias_name),
          void = 0,
          updated_at = NOW()
      `, {
        replacements: { 
          name: gender.name, 
          alias_name: gender.alias_name 
        },
        type: QueryTypes.INSERT,
        transaction: null // ✅ CRITICAL: Bypass Umzug's transaction wrapper
      });

      const affected = (result as any).affectedRows || 0;
      const action = affected === 1 ? 'Created' : 'Updated';
      consola.success(`  ✅ [${index + 1}/${GENDERS.length}] ${action}: ${gender.name.padEnd(10)} | ${gender.alias_name}`);
    }

    // Verification
    const [verify] = await sequelize.query(`
      SELECT id, name, alias_name FROM \`gender\` WHERE void = 0 ORDER BY id
    `, { 
      type: QueryTypes.SELECT,
      transaction: null 
    });

    consola.success(`\n  📊 Seeded ${Object.values(verify).length} active gender record(s)`);
  } catch (error: any) {
    consola.error('❌ Seeding failed:', error.message);
    if (error.sql) consola.error('SQL:', error.sql.substring(0, 200) + '...');
    throw error; // ✅ Fail loudly
  }
}

export async function unseed(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  consola.warn('⚠️  Rolling back gender seeder (soft-delete)...');
  
  try {
    const [result] = await sequelize.query(`
      UPDATE \`gender\` 
      SET void = 1 
      WHERE name IN (:names) AND void = 0
    `, {
      replacements: { names: GENDERS.map(g => g.name) },
      type: QueryTypes.UPDATE,
      transaction: null
    });

    const affected = (result as any).affectedRows || 0;
    consola.success(`  ✅ Soft-deleted ${affected} gender record(s)`);
  } catch (error: any) {
    consola.error('❌ Rollback failed:', error.message);
    throw error;
  }
}