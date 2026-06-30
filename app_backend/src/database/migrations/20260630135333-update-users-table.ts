/**
 * Migration: update users table
 * Generated: 2026-06-30T13:53:33.776Z
 * Author: ...
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.addColumn('users', 'company_branch_id', {
      type: DataTypes.BIGINT,
      allowNull: true, 
      comment: "Reference to the user's assigned branch"
    }, { transaction });

    await queryInterface.addConstraint('users', {
      name: 'fk_users_company_branch_id',
      type: 'foreign key',
      fields: ['company_branch_id'],
      references: { table: 'company_branches', field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      transaction
    });

    await transaction.commit();
    consola.success('⬆️  Migration executed: add-company-branch-id-to-users');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Migration failed, rolled back');
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.removeConstraint('users', 'fk_users_company_branch_id', { transaction });
    await queryInterface.removeColumn('users', 'company_branch_id', { transaction });
    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: add-company-branch-id-to-users');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}