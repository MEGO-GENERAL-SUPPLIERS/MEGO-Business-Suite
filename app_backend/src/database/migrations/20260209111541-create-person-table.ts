/**
 * Migration: create person table
 * Generated: 2026-02-09T11:15:41.054Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'person', {
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Person first official/given name'
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull:  false,
        comment: 'Person last/family name'
      },
      other_names: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Other legal person names or initials'
      },
      gender_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Gender ID from `gender` table',
        defaultValue: 3
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Legal of birth of person'
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('person', { fields: ['first_name'], name: 'idx_person_first_name', transaction });
    await queryInterface.addIndex('person', { fields: ['last_name'], name: 'idx_person_last_name', transaction });
    await queryInterface.addIndex('person', { fields: ['other_names'], name: 'idx_person_other_names', transaction });
    await queryInterface.addIndex('person', { fields: ['first_name', 'last_name'], name: 'idx_person_first_name_last_name', transaction });
    await queryInterface.addIndex('person', { fields: ['first_name', 'other_names', 'last_name'], name: 'idx_person_first_name_other_names_last_name', transaction });

    await queryInterface.addConstraint('person', {
      fields: ['gender_id'],
      type: 'foreign key',
      name: 'fk_person_gender_id',
      references: {
        table: 'gender',
        field: 'id'
      },
      onDelete: 'RESTRICT', // Options: CASCADE | SET NULL | RESTRICT | NO ACTION
      onUpdate: 'CASCADE',
      transaction
    })

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-person-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.removeConstraint('person', 'fk_person_gender_id', { transaction });

    await queryInterface.dropTable('person', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-person-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}