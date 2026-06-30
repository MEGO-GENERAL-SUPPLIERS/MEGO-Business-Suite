/**
 * Admin User Seeder - Fixed Query Result Handling
 * 
 * CRITICAL FIX: Removed incorrect array destructuring on SELECT queries
 *   ❌ WRONG: const [genders] = await sequelize.query(...)  // Extracts FIRST ROW
 *   ✅ CORRECT: const genders = await sequelize.query(...)   // Gets FULL RESULTS ARRAY
 */

import type { QueryInterface, Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import consola from 'consola';
import { env } from '../../config/env.js';

// Type-safe row interfaces
interface DbRow { id: bigint }
interface PersonRow extends DbRow { first_name: string; last_name: string }
interface UserRow extends DbRow { username: string }

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: env.NODE_ENV === 'production' 
    ? 'CHANGE_THIS_IMMEDIATELY' 
    : 'admin',
  email: 'admin@megogeneralsuppliers.com',
  first_name: 'System',
  last_name: 'Administrator'
};

export async function seed(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  consola.info('🌱 Seeding admin user account...');

  const transaction = await sequelize.transaction();
  try {
    // 🔑 CRITICAL FIX: NO DESTRUCTURING FOR SELECT QUERIES
    // Query returns ARRAY of rows - assign directly
    consola.info('  🔍 Verifying prerequisite data...');
    
    // Gender lookup
    const genders = await sequelize.query<DbRow>(
      `SELECT id FROM \`gender\` WHERE LOWER(name) = 'male' AND void = 0 LIMIT 1`,
      { type: QueryTypes.SELECT, transaction }
    );
    if (genders.length === 0) throw new Error('MISSING: Gender "Male" not found. Run gender seeder.');
    const genderId = genders[0].id;
    consola.success(`    ✅ Gender ID: ${genderId}`);

    // Access level lookup
    const accessLevels = await sequelize.query<DbRow>(
      `SELECT id FROM \`access_levels\` WHERE LOWER(name) = 'global' AND void = 0 LIMIT 1`,
      { type: QueryTypes.SELECT, transaction }
    );
    if (accessLevels.length === 0) throw new Error('MISSING: Access level "Global" not found.');
    const accessLevelId = accessLevels[0].id;
    consola.success(`    ✅ Access Level ID: ${accessLevelId}`);

    // Role lookup
    const roles = await sequelize.query<DbRow>(
      `SELECT id FROM \`roles\` WHERE LOWER(name) = 'super admin' AND void = 0 LIMIT 1`,
      { type: QueryTypes.SELECT, transaction }
    );
    if (roles.length === 0) throw new Error('MISSING: Role "Super Admin" not found.');
    const roleId = roles[0].id;
    consola.success(`    ✅ Role ID: ${roleId}`);

    // Hash password
    consola.info('  🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

    // Create person (CORRECT TABLE NAME: person)
    consola.info('  👤 Creating person record...');
    await sequelize.query(
      `INSERT INTO \`person\` (
        first_name, last_name, other_names, gender_id, date_of_birth, void, created_at, updated_at
      ) VALUES (
        :first_name, :last_name, NULL, :gender_id, NULL, 0, NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        void = 0,
        updated_at = NOW()`,
      {
        replacements: {
          first_name: ADMIN_CREDENTIALS.first_name,
          last_name: ADMIN_CREDENTIALS.last_name,
          gender_id: genderId
        },
        type: QueryTypes.INSERT,
        transaction
      }
    );

    // Get person ID (NO DESTRUCTURING)
    const personCheck = await sequelize.query<PersonRow>(
      `SELECT id FROM \`person\` WHERE first_name = :first_name AND last_name = :last_name AND void = 0 LIMIT 1`,
      { 
        replacements: ADMIN_CREDENTIALS,
        type: QueryTypes.SELECT,
        transaction
      }
    );
    if (personCheck.length === 0) throw new Error('FAILED: Could not retrieve person ID');
    const personId = personCheck[0].id;
    consola.success(`    ✅ Person ID: ${personId}`);

    // Create user
    consola.info('  🔑 Creating user account...');
    await sequelize.query(
      `INSERT INTO \`users\` (
        username, password, person_id, access_level_id, 
        is_active, is_verified, enabled_2fa, void, created_at, updated_at
      ) VALUES (
        :username, :password, :person_id, :access_level_id,
        1, 1, 0, 0, NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE
        password = VALUES(password),
        access_level_id = VALUES(access_level_id),
        is_active = 1,
        void = 0,
        updated_at = NOW()`,
      {
        replacements: {
          username: ADMIN_CREDENTIALS.username.toLowerCase().trim(),
          password: hashedPassword,
          person_id: personId,
          access_level_id: accessLevelId
        },
        type: QueryTypes.INSERT,
        transaction
      }
    );

    // Get user ID (NO DESTRUCTURING + case-insensitive)
    const userCheck = await sequelize.query<UserRow>(
      `SELECT id FROM \`users\` WHERE LOWER(username) = LOWER(:username) AND void = 0 LIMIT 1`,
      {
        replacements: { username: ADMIN_CREDENTIALS.username },
        type: QueryTypes.SELECT,
        transaction
      }
    );
    if (userCheck.length === 0) throw new Error(`FAILED: User "${ADMIN_CREDENTIALS.username}" not found after insertion`);
    const userId = userCheck[0].id;
    consola.success(`    ✅ User ID: ${userId}`);

    // Assign role
    consola.info('  🎭 Assigning role...');
    await sequelize.query(
      `UPDATE \`user_roles\` SET is_primary = 1 WHERE user_id = :user_id AND void = 0`,
      { replacements: { user_id: userId }, transaction }
    );
    await sequelize.query(
      `INSERT INTO \`user_roles\` (user_id, role_id, is_primary, void, created_at, updated_at)
      VALUES (:user_id, :role_id, 1, 0, NOW(), NOW())
      ON DUPLICATE KEY UPDATE is_primary = 1, void = 0, updated_at = NOW()`,
      { replacements: { user_id: userId, role_id: roleId }, type: QueryTypes.INSERT, transaction }
    );

    // Grant privileges
    consola.info('  🔒 Granting privileges...');
    const privileges = await sequelize.query<DbRow>(
      `SELECT id FROM \`privileges\` WHERE void = 0`,
      { type: QueryTypes.SELECT, transaction }
    );
    for (const priv of privileges) {
      await sequelize.query(
        `INSERT INTO \`user_privileges\` (user_id, privilege_id, void, created_at, updated_at)
        VALUES (:user_id, :privilege_id, 0, NOW(), NOW())
        ON DUPLICATE KEY UPDATE void = 0, updated_at = NOW()`,
        { replacements: { user_id: userId, privilege_id: priv.id }, type: QueryTypes.INSERT, transaction }
      );
    }

    await transaction.commit();
    consola.success(`\n✅ Admin user created successfully!`);
    consola.info(`   Username: ${ADMIN_CREDENTIALS.username}`);
    if (env.NODE_ENV !== 'production') {
      consola.warn(`   Password: ${ADMIN_CREDENTIALS.password} (CHANGE IN PRODUCTION!)`);
    }
    consola.info(`   Role: Super Admin | Access Level: Global`);
    consola.info(`   IDs → Person: ${personId} | User: ${userId}`);
  } catch (error) {
    await transaction.rollback();
    const msg = error instanceof Error ? error.message : 'Unknown error';
    consola.fatal(`\n❌ Seeder failed: ${msg}`);
    consola.info('\n💡 Verify these exist in database:');
    consola.info('   • gender table with "Male" record (void=0)');
    consola.info('   • access_levels table with "Global" record (void=0)');
    consola.info('   • roles table with "Super Admin" record (void=0)');
    consola.info('   • privileges table with records (void=0)');
    throw error;
  }
}

export async function unseed(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  consola.warn('⚠️  Soft-deleting admin user...');
  const transaction = await sequelize.transaction();
  try {
    await sequelize.query(
      `UPDATE \`users\` SET void = 1 WHERE LOWER(username) = LOWER(:username) AND void = 0`,
      { replacements: { username: ADMIN_CREDENTIALS.username }, type: QueryTypes.UPDATE, transaction }
    );
    await transaction.commit();
    consola.success('  ✅ Admin user soft-deleted');
  } catch (error) {
    await transaction.rollback();
    throw error instanceof Error ? error : new Error('Rollback failed');
  }
}