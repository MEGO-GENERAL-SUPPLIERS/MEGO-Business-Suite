// src/utils/migration-helpers.ts
import type { QueryInterface, DataType } from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';

/**
 * Default table columns for Rails-like conventions
 * 
 * Column order: id → void → custom fields → created_at → updated_at
 */
export interface CustomColumns {
  [key: string]: {
    type: DataType;
    allowNull?: boolean;
    defaultValue?: any;
    unique?: boolean;
    comment?: string;
    [key: string]: any;
  };
}

/**
 * Get default table columns with Rails-like conventions
 * 
 * CRITICAL FIX: Uses TIMESTAMP types for MySQL compatibility with ON UPDATE
 * 
 * @param customColumns - Custom columns to merge (inserted between void and timestamps)
 * @param includeVoid - Include soft-delete void column (default: true)
 */
export function getDefaultTableColumns(
  customColumns: CustomColumns = {},
  includeVoid: boolean = true
): Record<string, any> {
  const columns: Record<string, any> = {
    // === ID FIELD (FIRST) ===
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key'
    }
  };

  // === CUSTOM FIELDS (MIDDLE) ===
  Object.assign(columns, customColumns);

    // === VOID FIELD (SOFT DELETE) ===
  if (includeVoid) {
    columns.void = {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
      comment: 'Soft delete flag (0=active, 1=deleted)'
    };

    columns.void_by = {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Voided by'
    };

    columns.void_reason = {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Voided reason'
    };
  }

  // === TIMESTAMPS (LAST) - CRITICAL: Use TIMESTAMP types for MySQL ON UPDATE support ===
  columns.created_at = {
    type: DataTypes.DATE, // Maps to DATETIME in MySQL (no range limits)
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    comment: 'Record creation timestamp'
  };
  
  columns.updated_at = {
    type: DataTypes.DATE, // Will be ALTERed to TIMESTAMP with ON UPDATE
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), //DataTypes.NOW,
    // onUpdated: DataTypes.NOW,
    comment: 'Record last update timestamp (auto-updated)'
  };

  return columns;
}

/**
 * Create table with Rails-like defaults + AUTOMATIC timestamp behavior
 * 
 * ✅ By default ENABLES ON UPDATE CURRENT_TIMESTAMP for updated_at
 * ✅ Handles MySQL type conversion safely
 * ✅ Idempotent-safe for migration reruns
 * 
 * @example
 * await createTableWithDefaults(queryInterface, 'companies', {
 *   name: { type: DataTypes.STRING(255), allowNull: false }
 * }, { transaction });
 * 
 * // Disable auto-update behavior:
 * await createTableWithDefaults(queryInterface, 'logs', { ... }, {
 *   enableAutoUpdate: false,
 *   transaction
 * });
 */
export async function createTableWithDefaults(
  queryInterface: QueryInterface,
  tableName: string,
  customColumns: CustomColumns = {},
  options: {
    includeVoid?: boolean;
    enableAutoUpdate?: boolean; // Auto-enable ON UPDATE behavior (default: true)
    charset?: string;
    collate?: string;
    engine?: string;
    transaction?: any;
  } = {}
): Promise<void> {
  const {
    includeVoid = true,
    enableAutoUpdate = true, // ✅ DEFAULTS TO TRUE FOR RAILS BEHAVIOR
    charset = 'utf8mb4',
    collate = 'utf8mb4_unicode_ci',
    engine = 'InnoDB',
    transaction
  } = options;

  // Create table with base columns
  const columns = getDefaultTableColumns(customColumns, includeVoid);
  
  await queryInterface.createTable(tableName, columns, {
    charset,
    collate,
    engine,
    transaction
  });

  // ✅ AUTOMATICALLY ENABLE RAILS TIMESTAMP BEHAVIOR
  if (enableAutoUpdate) {
    await enableAutoUpdateTimestamps(queryInterface, tableName, { transaction });
  }
}

/**
 * CRITICAL FIX: Properly enables ON UPDATE CURRENT_TIMESTAMP for updated_at
 * 
 * Why this works:
 * 1. Uses MODIFY to change column type to TIMESTAMP (required for ON UPDATE in MySQL)
 * 2. Preserves existing data during migration
 * 3. Handles MySQL 5.6.5+ syntax correctly
 * 4. Idempotent-safe (can run multiple times)
 * 
 * @warning Only works on MySQL. Not compatible with PostgreSQL/SQLite.
 */
export async function enableAutoUpdateTimestamps(
  queryInterface: QueryInterface,
  tableName: string,
  options: { transaction?: any } = {}
): Promise<void> {
  const { transaction } = options;
  
  // Sanitize table name (prevent SQL injection in migrations)
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error(`Invalid table name: ${tableName}. Only alphanumeric and underscore allowed.`);
  }

  // CRITICAL: Convert to TIMESTAMP type to enable ON UPDATE behavior
  // MySQL requires TIMESTAMP type for ON UPDATE CURRENT_TIMESTAMP
  await queryInterface.sequelize.query(`
      ALTER TABLE \`${tableName}\`
      MODIFY \`created_at\` TIMESTAMP 
      NOT NULL 
      DEFAULT CURRENT_TIMESTAMP 
      COMMENT 'Record creayed on timestamp'
    `, { transaction });

  await queryInterface.sequelize.query(`
    ALTER TABLE \`${tableName}\`
    MODIFY \`updated_at\` TIMESTAMP 
    NOT NULL 
    DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
    COMMENT 'Record last update timestamp (auto-updated)'
  `, { transaction });
}

/**
 * Add soft delete functionality via void column
 */
export async function addSoftDelete(
  queryInterface: QueryInterface,
  tableName: string,
  options: { transaction?: any } = {}
): Promise<void> {
  const { transaction } = options;

  // Check if column exists first (idempotent)
  const [result] = await queryInterface.sequelize.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE 'void'`,
    { transaction }
  );
  
  if ((result as any[]).length === 0) {
    await queryInterface.addColumn(tableName, 'void', {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
      comment: 'Soft delete flag (0=active, 1=deleted)'
    }, transaction);

    await queryInterface.addIndex(tableName, ['void'], {
      name: `idx_${tableName}_void`,
      transaction
    });
  }
}

/**
 * Add common indexes with safety checks
 */
export async function addCommonIndexes(
  queryInterface: QueryInterface,
  tableName: string,
  indexedColumns: string[],
  options: { 
    unique?: boolean;
    prefix?: string;
    transaction?: any;
  } = {}
): Promise<void> {
  const { 
    unique = false, 
    prefix = `idx_${tableName}`, 
    transaction 
  } = options;

  for (const column of indexedColumns) {
    // Skip if index already exists (idempotent)
    try {
      await queryInterface.addIndex(tableName, [column], {
        unique,
        name: `${prefix}_${column}`,
        transaction
      });
    } catch (error: any) {
      // Ignore duplicate index errors
      if (!error.message.includes('Duplicate key name') && 
          !error.message.includes('already exists')) {
        throw error;
      }
    }
  }
}

/**
 * Helper to generate table options with defaults
 */
export function getDefaultTableOptions(
  overrides: {
    charset?: string;
    collate?: string;
    engine?: string;
  } = {}
): {
  charset: string;
  collate: string;
  engine: string;
} {
  return {
    charset: overrides.charset || 'utf8mb4',
    collate: overrides.collate || 'utf8mb4_unicode_ci',
    engine: overrides.engine || 'InnoDB'
  };
}