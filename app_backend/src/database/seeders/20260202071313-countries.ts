/**
 * Seeder: countries
 * Generated: 2026-02-10T07:13:13.268Z
 * 
 * Idempotent seeder using dynamic SEEDVALUES pattern from world-countries package
 * 
 * Pattern Benefits:
 *   • Single source of truth (world-countries npm package)
 *   • Easy maintenance (update package to refresh data)
 *   • Consistent insert/update logic with progress tracking
 *   • Type-safe with runtime validation
 * 
 * ⚠️ REQUIRED: Install dependency first
 *   npm install world-countries
 */

import type { QueryInterface, Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';
import consola from 'consola';
import { env } from '../../config/env.js';

// ========================
// SEED DATA CACHE (Singleton pattern)
// ========================
let countriesDataCache: any[] | null = null;

/**
 * Load country data from world-countries package with caching
 * Handles ESM dynamic import safely
 */
async function loadCountriesData(): Promise<any[]> {
  if (countriesDataCache) return countriesDataCache;
  
  try {
    const module = await import('world-countries');
    countriesDataCache = module.default || module;
    
    if (!Array.isArray(countriesDataCache)) {
      throw new Error('world-countries export is not an array');
    }
    
    consola.debug(`✅ Loaded ${countriesDataCache.length} countries from world-countries`);
    return countriesDataCache;
  } catch (error: any) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message?.includes('world-countries')) {
      consola.fatal('❌ Missing world-countries package!');
      consola.info('💡 Install dependency: npm install world-countries');
      throw new Error('Missing world-countries package. Run: npm install world-countries');
    }
    throw error;
  }
}

/**
 * Seed function - executed by seeder runner
 * 
 * Uses SEEDVALUES pattern with dynamic data loading:
 *   1. Load countries from world-countries package
 *   2. Process each country with idempotent insert/update
 *   3. Verify results with progress tracking
 */
export async function seed(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  // 🔑 DYNAMIC SEEDVALUES: Load from world-countries package
  const SEEDVALUES = await loadCountriesData();
  consola.info(`🌱 Seeding ${SEEDVALUES.length} countries (from world-countries package)...`);

  try {
    // Verify table exists
    const [tables] = await sequelize.query(`SHOW TABLES LIKE 'countries'`);
    if ((tables as any[]).length === 0) {
      throw new Error('Countries table missing. Run migrations first: npm run db:migrate');
    }

    let inserted = 0;
    let updated = 0;
    let failed = 0;

    // Loop through SEEDVALUES array (pattern preserved)
    for (const [index, country] of SEEDVALUES.entries()) {
      try {
        // Extract currency data (handle multiple currencies)
        let currencyCode = null;
        let currencyName = null;
        let currencySymbol = null;
        
        if (country.currencies && Object.keys(country.currencies).length > 0) {
          const primaryCurrency = Object.values(country.currencies)[0] as any;
          currencyCode = Object.keys(country.currencies)[0];
          currencyName = primaryCurrency?.name || null;
          currencySymbol = primaryCurrency?.symbol || null;
        }

        // Prepare border countries and languages
        const borders = country.borders?.join(',') || null;
        const languages = country.languages ? JSON.stringify(Object.keys(country.languages)) : null;

        // ✅ Idempotent insert with ON DUPLICATE KEY UPDATE (SEEDVALUES pattern)
        const [result] = await sequelize.query(`
          INSERT INTO \`countries\` (
            name_common, name_official, iso2, iso3, numeric_code,
            currency_code, currency_name, currency_symbol,
            region, subregion, calling_codes, capital,
            flag_emoji, flag_png, flag_svg, tld, languages, borders,
            area_km2, population, void, created_at, updated_at
          ) VALUES (
            :name_common, :name_official, :iso2, :iso3, :numeric_code,
            :currency_code, :currency_name, :currency_symbol,
            :region, :subregion, :calling_codes, :capital,
            :flag_emoji, :flag_png, :flag_svg, :tld, :languages, :borders,
            :area_km2, :population, 0, NOW(), NOW()
          )
          ON DUPLICATE KEY UPDATE
            name_official = VALUES(name_official),
            currency_code = VALUES(currency_code),
            currency_name = VALUES(currency_name),
            currency_symbol = VALUES(currency_symbol),
            region = VALUES(region),
            subregion = VALUES(subregion),
            calling_codes = VALUES(calling_codes),
            capital = VALUES(capital),
            flag_emoji = VALUES(flag_emoji),
            flag_png = VALUES(flag_png),
            flag_svg = VALUES(flag_svg),
            tld = VALUES(tld),
            languages = VALUES(languages),
            borders = VALUES(borders),
            area_km2 = VALUES(area_km2),
            population = VALUES(population),
            void = 0,
            updated_at = NOW()
        `, {
          replacements: {
            name_common: country.name?.common || 'Unknown',
            name_official: country.name?.official || country.name?.common || 'Unknown',
            iso2: country.cca2,
            iso3: country.cca3,
            numeric_code: country.ccn3 || null,
            currency_code: currencyCode,
            currency_name: currencyName,
            currency_symbol: currencySymbol,
            region: country.region || null,
            subregion: country.subregion || null,
            calling_codes: Array.isArray(country.callingCode) ? country.callingCode.join(',') : country.callingCode || null,
            capital: Array.isArray(country.capital) ? country.capital[0] : country.capital || null,
            flag_emoji: country.flag || null,
            flag_png: country.flags?.png || null,
            flag_svg: country.flags?.svg || null,
            tld: Array.isArray(country.tld) ? country.tld[0] : country.tld || null,
            languages: languages,
            borders: borders,
            area_km2: country.area || null,
            population: country.population || null
          },
          type: QueryTypes.INSERT,
          transaction: null
        });

        const affected = (result as any).affectedRows || 0;
        if (affected === 1) inserted++;
        else updated++;

        // Progress indicator every 50 countries
        if ((index + 1) % 50 === 0 || index === SEEDVALUES.length - 1) {
          consola.info(
            `  ✅ [${String(index + 1).padStart(3)}/${SEEDVALUES.length}] ` +
            `Inserted: ${inserted} | Updated: ${updated} ${failed > 0 ? `| Failed: ${failed}` : ''}`
          );
        }
      } catch (error: any) {
        failed++;
        consola.warn(
          `  ⚠️  [${index + 1}/${SEEDVALUES.length}] Failed "${country.name?.common || 'Unknown'}" (ISO: ${country.cca2}): ${error.message}`
        );
        if (env.NODE_ENV === 'development' && error.sql) {
          consola.debug(`     SQL: ${error.sql.substring(0, 150)}...`);
        }
        // Continue processing other countries
      }
    }

    // 🔑 CRITICAL FIX: Handle MySQL query result structure safely
    // MySQL raw queries return [results, metadata] for SELECT
    const [countResults]: any = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN void = 0 THEN 1 ELSE 0 END) as active
      FROM \`countries\`
    `, {
      type: QueryTypes.SELECT,
      transaction: null
    });

    // Defensive check: countResults might be empty array if table has no rows
    const total = countResults.length > 0 ? countResults[0].total : 0;
    const active = countResults.length > 0 ? countResults[0].active : 0;
    
    consola.success(`\n  📊 Total countries: ${total} | Active: ${active}`);
    consola.success(`  ➕ Inserted: ${inserted} | 🔄 Updated: ${updated} ${failed > 0 ? `| ❌ Failed: ${failed}` : ''}`);
    
    // Show sample data in development (pattern enhanced)
    if (env.NODE_ENV === 'development') {
      const [sampleResults]: any = await sequelize.query(`
        SELECT flag_emoji, name_common, iso2, currency_code, region 
        FROM \`countries\` 
        WHERE void = 0 
        ORDER BY name_common 
        LIMIT 5
      `, { type: QueryTypes.SELECT, transaction: null });
      
      if (sampleResults.length > 0) {
        consola.info(`\n🌍 Sample countries:`);
        (sampleResults as any[]).forEach((c: any) => {
          consola.info(
            `   ${c.flag_emoji} ${c.name_common.padEnd(25)} | ` +
            `ISO: ${c.iso2} | Currency: ${c.currency_code || 'N/A'.padEnd(3)} | Region: ${c.region || 'N/A'}`
          );
        });
      }
    }
  } catch (error: any) {
    consola.error('❌ Seeding failed:', error.message);
    if (error.sql) consola.error('SQL:', error.sql.substring(0, 200) + '...');
    throw error;
  }
}

/**
 * Rollback function - soft-deletes seeded records
 * 
 * Uses SEEDVALUES pattern concept (operate on all seeded data):
 *   • Soft-delete ALL countries (preserves data integrity)
 *   • No dependency on original seed data array
 *   • Safe for re-seeding (void=0 on next seed)
 */
export async function unseed(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  consola.warn(`⚠️  Soft-deleting all countries (preserving data for recovery)...`);

  try {
    // Soft-delete all seeded records (void = 1)
    const [result] = await sequelize.query(`
      UPDATE \`countries\` SET void = 1 WHERE void = 0
    `, {
      type: QueryTypes.UPDATE,
      transaction: null
    });

    const affected = (result as any).affectedRows || 0;
    consola.success(`  ✅ Soft-deleted ${affected} country record(s)`);
    consola.info('💡 Run seeder again to reactivate all countries');
  } catch (error: any) {
    consola.error('❌ Rollback failed:', error.message);
    throw error;
  }
}