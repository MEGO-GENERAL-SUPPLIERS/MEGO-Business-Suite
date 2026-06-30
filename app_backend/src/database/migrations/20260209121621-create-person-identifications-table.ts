/**
 * Migration: create person identifications table
 * Generated: 2026-02-09T12:16:21.518Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'person_identifications', {
      person_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Person id from person table'
      },
      identification_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'identification type id from identification_types table'
      },
      identifier: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Person\'s ID number'
      },
      country_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Country code like MW, ZA for IDs like passports'
      },
      issue_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('person_identifications', { fields: ['identifier'], where: { void: 0 }, unique: true, name: 'idx_person_identifications_identifier', transaction });

    await queryInterface.addIndex('person_identifications', { 
      fields: ['person_id', 'identification_type_id'], 
      unique: true, 
      where: { is_primary: true }, 
      name: 'idx_person_identifications_person_id_identification_type_id',
      transaction 
    });

    await queryInterface.addConstraint('person_identifications', {
      name: 'fk_person_identifications_person_id',
      fields: ['person_id'],
      type: 'foreign key',
      references: {
        table: 'person',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await queryInterface.addConstraint('person_identifications', {
      name: 'fx_person_identifications_identification_type_id',
      fields: ['identification_type_id'],
      type: 'foreign key',
      references: {
        table:'identification_types',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    })

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-person-identifications-table');
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
    await queryInterface.removeConstraint('person_identifications','fk_person_identifications_person_id', { transaction });
    await queryInterface.removeConstraint('person_identifications','fx_person_identifications_identification_type_id', { transaction });

    await queryInterface.dropTable('person_identifications', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-person-identifications-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}