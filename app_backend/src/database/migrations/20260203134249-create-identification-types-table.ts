/**
 * Migration: create identification types table
 * Generated: 2026-02-03T13:42:50.002Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';
import { BOOLEAN } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'identification_types', {
      name:{
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Identification types e.g. Driver\'s license, National ID'
      },
      alias_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'identification type alias e.g. NID, DL'
      },
      usable_after_expiration: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, { includeVoid: true, transaction });
    
    await queryInterface.addIndex('identification_types', {
      fields: ['name', 'void'],
      unique: true,
      name: 'idx_identification_types_name_void',
      transaction
    });

    await queryInterface.addIndex('identification_types',
      {
        fields: ['alias_name', 'void'],
        unique: true,
        name: 'idx_identification_types_alias_name_void',
        transaction
      }
    )

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-identification-types-table');
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
    await queryInterface.dropTable('identification_types', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-identification-types-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}