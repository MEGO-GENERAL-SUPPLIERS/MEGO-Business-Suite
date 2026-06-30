/**
 * Migration: create seeder storage table
 * Generated: 2026-02-03T08:40:10.987Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface, Sequelize } from 'sequelize';
import consola from 'consola';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.createTable('SeederStorage', {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        comment: 'Primary key'
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'seeder file name'
      },
      executed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: "Execution timestamp"
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Record creation timestamp'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Record last update timestamp'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      engine: 'innoDB',
      transaction
    });


    await queryInterface.sequelize.query(`
      ALTER TABLE \`SeederStorage\`
      MODIFY updated_at TIMESTAMP
      NOT NULL
      DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP  
    `, { transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-seeder-storage-table');
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
    await queryInterface.dropTable('SeederStorage', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-seeder-storage-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}