/**
 * Migration: create company table
 * Generated: 2026-02-03T09:58:30.694Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'companies', {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Company legal name"
      },
      logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Company logo url"
      },
      country_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'country company using the admin dashboard reside'
      }
    }, {includeVoid: true, transaction});

    await queryInterface.addIndex('companies', {
      fields: ['name'],
      where: { void : 0},
      unique: true,
      transaction
    });

    await queryInterface.addConstraint('companies', {
      name: 'fk_companies_country_id',
      type: 'foreign key',
      fields: ['country_id'],
      references: {
        table: 'countries',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-companies');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.removeConstraint('companies', 'fk_companies_country_id', { transaction });
    await queryInterface.dropTable('companies', { transaction });
    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-companies');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}