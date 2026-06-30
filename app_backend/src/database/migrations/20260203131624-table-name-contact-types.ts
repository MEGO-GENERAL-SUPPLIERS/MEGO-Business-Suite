/**
 * Migration: table name contact types
 * Generated: 2026-02-03T13:16:24.658Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'contact_types', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Contact type name e.g. Email, Phone, Whatsapp"
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('contact_types', {
      fields: ['name', 'void'],
      unique: true,
      name: 'idx_contact_types_name_void',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: table-name-contact-types');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // === ADD YOUR ROLLBACK LOGIC HERE ===
    // Drop table:
    await queryInterface.dropTable('contact_types', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: table-name-contact-types');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}