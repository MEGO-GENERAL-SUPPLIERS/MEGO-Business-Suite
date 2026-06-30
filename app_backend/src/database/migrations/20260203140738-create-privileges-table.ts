/**
 * Migration: create privileges table
 * Generated: 2026-02-03T14:07:38.888Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'privileges', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Privilege name e.g. Manage Clients Section'
      },
      action_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Privilege action names e.g. can_add_client, can_edit_client, can_void_client'
      },
      parent_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
      }
    }, { includeVoid: true, transaction});

    await queryInterface.addIndex('privileges', { fields: ['name'], where: { void: 0 }, unique: true, name: 'idx_privileges_name_void', transaction });
    await queryInterface.addIndex('privileges', { fields: ['action_name'], where: { void: 0 }, unique: true, name: 'idx_privileges_action_name_void', transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-privileges-table');
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
    await queryInterface.dropTable('privileges', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-privileges-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}