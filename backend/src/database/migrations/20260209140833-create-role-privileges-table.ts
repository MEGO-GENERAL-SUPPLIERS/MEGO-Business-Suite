/**
 * Migration: create role privileges table
 * Generated: 2026-02-09T14:08:33.794Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'role_privileges', {
      role_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      privilege_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
    }, { transaction })

    await queryInterface.addIndex('role_privileges', { fields: ['role_id', 'privilege_id'], where: { void: 0 }, unique: true, transaction });

    await queryInterface.addConstraint('role_privileges', {
      name: 'fk_role_privileges_role_id',
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

    await queryInterface.addConstraint('role_privileges', {
      name: 'fk_role_privileges_privilege_id',
      type: 'foreign key',
      fields: ['privilege_id'],
      references: {
        table: 'privileges',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-role-privileges-table');
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
    await queryInterface.removeConstraint('role_privileges', 'fk_role_privileges_role_id', { transaction });
    await queryInterface.removeConstraint('role_privileges', 'fk_role_privileges_privilege_id', { transaction });

    await queryInterface.dropTable('role_privileges', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-role-privileges-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}