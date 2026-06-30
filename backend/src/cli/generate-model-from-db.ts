// src/cli/generate-model-from-db.ts
import { sequelize } from '../config/database.js';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import consola from 'consola';

async function generateModelFromTable(tableName: string) {
  const [columns] = await sequelize.query(`
    SELECT 
      COLUMN_NAME as name,
      COLUMN_TYPE as type,
      IS_NULLABLE as nullable,
      COLUMN_DEFAULT as defaultValue,
      COLUMN_KEY as key
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
  `, { replacements: [tableName] });

  const modelName = tableName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const attributes: string[] = [];
  
  (columns as any[]).forEach((col: any) => {
    // Skip auto-managed timestamps
    if (['created_at', 'updated_at'].includes(col.name)) return;
    
    let tsType = 'string';
    if (col.type.includes('int')) tsType = 'number';
    if (col.type.includes('tinyint(1)')) tsType = 'boolean';
    
    attributes.push(`  ${col.name}${col.nullable === 'NO' && !col.defaultValue ? '' : '?'}: ${tsType};`);
  });

  const template = `// src/models/${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export class ${modelName} extends Model {
${attributes.join('\n')}
}

${modelName}.init(
  {
    // Minimal column definitions - DB handles defaults/constraints
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    // TODO: Add other columns you actually use in app logic
    // void: {
    //   type: DataTypes.TINYINT,
    //   defaultValue: 0
    // }
  },
  {
    sequelize,
    tableName: '${tableName}',
    timestamps: false,
  }
);

export default ${modelName};
`;

  await writeFile(join(process.cwd(), 'src', 'models', `${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.ts`), template);
  consola.success(`✅ Generated model skeleton for ${tableName}`);
}

// Usage: tsx src/cli/generate-model-from-db.ts users
const tableName = process.argv[2];
if (!tableName) {
  consola.error('Usage: tsx generate-model-from-db.ts <table_name>');
  process.exit(1);
}
generateModelFromTable(tableName);