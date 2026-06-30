/**
 * Migration: create countries table
 * Generated: 2026-02-02T06:47:00.200Z
 * Author: Emmanuel Z.K. Nyondo
 */

import { DataTypes, type QueryInterface } from 'sequelize';
import consola from 'consola';
import { createTableWithDefaults } from '../../utils/migration-helpers';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await createTableWithDefaults(queryInterface, 'countries', {
      name_common: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Common country name (e.g. "United States")'
      }, 
      name_official: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Official country name (e.g. "United States of America")'
      },
      iso2: {
        type: DataTypes.CHAR(2),
        allowNull: false,
        unique: true,
        comment: 'ISO 3166-1 alpha-2 code (e.g. "US")'
      },
      iso3: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        unique: true,
        comment: 'ISO 3166-1 alpha-3 code (e.g. "USA")'
      },
      numeric_code: {
        type: DataTypes.CHAR(3),
        allowNull: true,
        comment: 'ISO 3166-1 numeric code (e.g. "840")'
      },
      currency_code: {
        type: DataTypes.CHAR(3),
        allowNull: true,
        comment: 'ISO 4217 currecny code (e.g. "USD")'
      },
      currency_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Currency name (e.g. "United States dollar")'
      },
      currency_symbol: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Currency symbol (e.g. "$")'
      },
      region: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Continent/region (e.g. "Americas")'
      },
      subregion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Sub region (e.g. "North America")'
      },
      calling_codes: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'International calling codes (comma-seperated e.g. "+1"'
      },
      capital: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Capital city'
      },
      flag_emoji: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Flag emoji (e.g. "us")'
      },
      flag_png: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Flag PNG URL'
      },
      flag_svg: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Flag SVG URL'
      },
      tld: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Top-level domain (e.g. "us")'
      },
      languages: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array of language codes (e.g. ["eng"])'
      },
      borders: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Comma-separated ISO2 codes of bordering countries'
      },
      area_km2: {
        type: DataTypes.DECIMAL(12,2),
        allowNull: true,
        comment: 'Total area in square kilometers'
      },
      population: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'Estimated population'
      }
    }, { transaction });

    // Composite indices for common queries
    await queryInterface.addIndex('countries', ['region'], { name: 'idx_countries_region', transaction });
    await queryInterface.addIndex('countries', ['subregion'], { name: 'idx_countries_subregion', transaction });
    await queryInterface.addIndex('countries', ['currency_code'], { name: 'idx_countries_currency_code', transaction });
    await queryInterface.addIndex('countries', ['iso3'], { name: 'idx_countries_iso3', transaction });
    await queryInterface.addIndex('countries', ['flag_emoji'], { name: 'idx_countries_flag_emoji', transaction });
    await queryInterface.addIndex('countries', ['flag_png'], { name: 'idx_countries_flag_png', transaction });
    await queryInterface.addIndex('countries', ['flag_svg'], { name: 'idx_countries_flag_svg', transaction });

    await transaction.commit();
    consola.success('⬆️  Migration executed: create-countries-table');
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
    await queryInterface.dropTable('countries', { transaction });

    await transaction.commit();
    consola.warn('⬇️  Migration rolled back: create-countries-table');
  } catch (error: any) {
    await transaction.rollback();
    consola.error('❌ Rollback failed');
    throw error;
  }
}