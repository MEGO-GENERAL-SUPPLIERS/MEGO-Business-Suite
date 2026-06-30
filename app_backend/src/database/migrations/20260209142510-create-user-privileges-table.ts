/**
 * Migration: create user privileges table
 * Generated: 2026-02-09T14:25:10.152Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'user_privileges', {
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      privilege_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
    }, { transaction })

    await queryInterface.addIndex('user_privileges', { fields: ['user_id', 'privilege_id'], where: { void: 0 }, unique: true, transaction });

    await queryInterface.addConstraint('user_privileges', {
      name: 'fk_user_privileges_user_id',
      type: 'foreign key',
      fields: ['user_id'],
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await queryInterface.addConstraint('user_privileges', {
      name: 'fk_user_privileges_privilege_id',
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
    consola.success('⬆️  Migration executed: create-user-privileges-table');
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
    await queryInterface.removeConstraint('user_privileges', 'fk_user_privileges_user_id', { transaction });
    await queryInterface.removeConstraint('user_privileges', 'fk_user_privileges_privilege_id', { transaction });

    await queryInterface.dropTable('user_privileges', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-user-privileges-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}