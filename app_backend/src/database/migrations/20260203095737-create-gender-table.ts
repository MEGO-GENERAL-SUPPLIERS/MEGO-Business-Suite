/**
 * Migration: create gender table
 * Generated: 2026-02-03T09:57:37.678Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'gender', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Gender display name e.g. Male, Female"
      },
      alias_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Showrt alisas e.g. M, F'
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('gender', { fields: ['name', 'void'], unique: true, name: 'idx_gender_name_void', transaction });
    await queryInterface.addIndex('gender', { fields: ['alias_name', 'void'], unique: true, name: 'idx_gender_alias_name_void', transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-gender-table');
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
    await queryInterface.dropTable('gender', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-gender-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}