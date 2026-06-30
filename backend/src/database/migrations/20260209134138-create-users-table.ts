/**
 * Migration: create users table
 * Generated: 2026-02-09T13:41:38.190Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'users', {
      username: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      person_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      access_level_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 1
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      enabled_2fa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, { transaction });

    await queryInterface.addIndex('users', { fields: ['username'], where: { void: 0 }, unique: true, name: 'idx_users_username', transaction });
    await queryInterface.addIndex('users', { fields: ['username','password'], name: 'idx_users_username_password', transaction });

    await queryInterface.addConstraint('users', {
      name: 'fk_users_person_id',
      type: 'foreign key',
      fields: ['person_id'],
      references: {
        table: 'person',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await queryInterface.addConstraint('users', {
      name: 'fk_users_access_level_id',
      type: 'foreign key',
      fields: ['access_level_id'],
      references: {
        table: 'access_levels',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-users-table');
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
    await queryInterface.removeConstraint('users', 'fk_users_person_id', { transaction });
    await queryInterface.removeConstraint('users', 'fk_users_access_level_id', { transaction });

    await queryInterface.dropTable('users', { transaction });


    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-users-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}