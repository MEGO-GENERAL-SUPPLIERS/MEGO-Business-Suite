/**
 * Migration: create roles table
 * Generated: 2026-02-09T09:47:03.115Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'roles', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Role name e.g. Super Admin'
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('roles', { fields: ['name'], where: { void: 0 }, unique: true, name: 'idx_roles_name_void', transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-roles-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Reverse the operations from up()
    await queryInterface.dropTable('roles', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-roles-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}