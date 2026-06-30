/**
 * Migration: create person signatures table
 * Generated: 2026-02-09T13:22:15.964Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'person_signatures', {
      person_id: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      signature_image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      signatory_title: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, { transaction });

    await queryInterface.addIndex('person_signatures', {
      fields: ['signature_image_url'],
      where: { void: 0 },
      unique: true,
      name: 'idx_person_signatures_signature_image_url',
      transaction
    });

    await queryInterface.addConstraint('person_signatures', {
      name: "fk_person_signatures_person_id",
      type: 'foreign key',
      fields: ['person_id'],
      references: {
        table: 'person',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    })

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-person-signatures-table');
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
    await queryInterface.removeConstraint('person_signatures', 'fk_person_signatures_person_id', { transaction });

    await queryInterface.dropTable('person_signatures', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-person-signatures-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}