/**
 * Migration: create client types table
 * Generated: 2026-02-09T11:04:22.751Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'client_types', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Client type name e.g. Institution, Shop, Other'
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('client_types', { fields: ['name'], where: { void: 0 }, unique: true, name: 'idx_client_types_name_void', transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-client-types-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.dropTable('client_types', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-client-types-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}