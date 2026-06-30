// src/cli/verify-seed.ts
import { sequelize } from '../config/database.js';
import consola from 'consola';

async function verifySeed() {
  consola.info('='.repeat(60));
  consola.info('SEED VERIFICATION TOOL');
  consola.info('='.repeat(60));

  try {
    // Check seeder storage
    const [seederCheck] = await sequelize.query(`
      SELECT COUNT(*) as count FROM \`SeederStorage\`
    `);
    const seederCount = (seederCheck as any[])[0].count;
    consola.info(`🗃️  SeederStorage records: ${seederCount}`);

    // Check gender table existence
    const [genderTables] = await sequelize.query(`
      SHOW TABLES LIKE 'gender'
    `);
    if ((genderTables as any[]).length === 0) {
      consola.fatal('❌ Gender table MISSING');
      process.exit(1);
    }
    consola.success('✅ Gender table exists');

    // Check gender data
    const [genderData] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN void = 0 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN void = 1 THEN 1 ELSE 0 END) as deleted
      FROM \`gender\`
    `);
    const { total, active, deleted } = (genderData as any[])[0];
    
    consola.info(`\n📊 Gender table stats:`);
    consola.info(`   Total records: ${total || 0}`);
    consola.info(`   Active (void=0): ${active || 0}`);
    consola.info(`   Deleted (void=1): ${deleted || 0}`);

    if ((active || 0) > 0) {
      const [sample] = await sequelize.query(`
        SELECT id, name, alias_name, void 
        FROM \`gender\` 
        WHERE void = 0 
        ORDER BY id 
        LIMIT 5
      `);
      
      consola.success(`\n✅ Active gender records found:`);
      (sample as any[]).forEach((row: any) => {
        consola.info(`   ID ${String(row.id).padStart(2)} | ${row.name.padEnd(10)} | ${row.alias_name} | void=${row.void}`);
      });
    } else {
      consola.warn('⚠️  No active gender records found (void=0)');
      consola.info('💡 Possible causes:');
      consola.info('   • Seeder ran but data was soft-deleted (void=1)');
      consola.info('   • Seeder failed silently (check seeder logs)');
      consola.info('   • Transaction rollback prevented commit');
    }

    consola.info('='.repeat(60));
  } catch (error: any) {
    consola.fatal('Verification failed:', error.message);
    if (error.sql) consola.error('SQL:', error.sql);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Execute immediately
verifySeed();