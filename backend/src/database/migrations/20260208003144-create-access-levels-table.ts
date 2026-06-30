/**
 * Migration: create role levels table
 * Generated: 2026-02-03T14:17:26.682Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'access_levels', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Role Access level e.g. Global'
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('access_levels', { fields: ['name'], where: { void: 0 },  unique: true, name: 'idx_access_levels_void', transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-access-levels-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Drop table:
    await queryInterface.dropTable('access_levels', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-access-levels-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}