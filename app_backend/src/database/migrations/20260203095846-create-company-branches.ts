/**
 * Migration: create company branches
 * Generated: 2026-06-30T13:41:49.569Z
 * Author: ...
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'company_branches', {
      company_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "Reference to the parent company"
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Branch name"
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Physical address of the branch"
      },
      phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Branch contact phone"
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Branch contact email"
      }
    }, { includeVoid: true, transaction });

    await queryInterface.addIndex('company_branches', {
      fields: ['company_id', 'name'],
      where: { void: 0 },
      unique: true,
      transaction
    });

    await queryInterface.addConstraint('company_branches', {
      name: 'fk_company_branches_company_id',
      type: 'foreign key',
      fields: ['company_id'],
      references: { table: 'companies', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-company-branches');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.removeConstraint('company_branches', 'fk_company_branches_company_id', { transaction });
    await queryInterface.dropTable('company_branches', { transaction });
    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-company-branches');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}