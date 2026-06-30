/**
 * Migration: create person contacts table
 * Generated: 2026-02-09T11:48:08.747Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'person_contacts', {
      person_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "Person Id of contact owner"
      },
      contact_type_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Contact type id of contact from contact_types table'
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Contact value e.g. email@domain.com, 265999111222'
      },
      in_use: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, { includeVoid: true , transaction });

    await queryInterface.addIndex('person_contacts', { fields: ['value'], unique: true, name: 'idx_person_contacts_value_void', transaction });
    
    await queryInterface.addIndex('person_contacts', { 
      fields: ['person_id', 'contact_type_id'], 
      unique: true, 
      where: { is_primary: true }, 
      name: 'idx_person_contacts_person_id_contact_type_id',
      transaction 
    });

    await queryInterface.addConstraint('person_contacts', {
      name: 'fk_person_contacts_person_id',
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

    await queryInterface.addConstraint('person_contacts', {
      name: 'fk_person_contacts_contact_type_id',
      type: 'foreign key',
      fields: ['contact_type_id'],
      references: {
        table: 'contact_types',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-person-contacts-table');
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
    await queryInterface.removeConstraint('person_contacts', 'fk_person_contacts_person_id', { transaction });
    await queryInterface.removeConstraint('person_contacts', 'fk_person_contacts_contact_type_id', { transaction });

    await queryInterface.dropTable('person_contacts', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-person-contacts-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}