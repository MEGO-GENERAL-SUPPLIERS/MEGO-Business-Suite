/**
 * Migration: create user roles table
 * Generated: 2026-02-09T13:58:54.507Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'user_roles', {
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      role_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, { transaction });

    await queryInterface.addIndex('user_roles', { fields: ['user_id', 'role_id'], unique: true, where: { void: 0 }, name: 'idx_user_roles_user_id_role_id', transaction });

    await queryInterface.addConstraint('user_roles', {
      name: 'fk_user_roles_user_id',
      fields: ['user_id'],
      type: 'foreign key',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await queryInterface.addConstraint('user_roles', {
      name: 'fk_user_roles_role_id',
      type: 'foreign key',
      fields: ['role_id'],
      references: {
        table: 'roles',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-user-roles-table');
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
    await queryInterface.removeConstraint('user_roles', 'fk_user_roles_user_id', { transaction });
    await queryInterface.removeConstraint('user_roles', 'fk_user_roles_role_id', { transaction });

    await queryInterface.dropTable('user_roles', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-user-roles-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}