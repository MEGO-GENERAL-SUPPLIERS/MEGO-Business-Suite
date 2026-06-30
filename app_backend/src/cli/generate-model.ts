// src/cli/generate-model.ts
import { writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import consola from 'consola';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

function toSnakeCasePlural(pascalName: string): string {
  return pascalName
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/s$/, '') + 's';
}

async function generateModel() {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  const modelName = args[0]?.replace(/^--/, '');

  if (!modelName || !/^[A-Z][a-zA-Z0-9]*$/.test(modelName)) {
    consola.fatal('\n❌ Usage: npm run db:generate:model -- ModelName');
    consola.info('   Example: npm run db:generate:model -- User');
    process.exit(1);
  }

  const tableName = toSnakeCasePlural(modelName);
  const fileName = `${modelName.charAt(0).toLowerCase() + modelName.slice(1)}.ts`;
  const modelsDir = join(PROJECT_ROOT, 'src', 'models');
  const filePath = join(modelsDir, fileName);

  try {
    await access(modelsDir);
  } catch {
    await mkdir(modelsDir, { recursive: true });
  }

  const template = `import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { sequelize } from '../config/database.js';

export class ${modelName} extends Model<
  InferAttributes<${modelName}>,
  InferCreationAttributes<${modelName}>
> {
  declare id: CreationOptional<number>;
  declare void: CreationOptional<number>;
  // TODO: Declare properties (e.g., foreign keys: person_id, role_id)
}

${modelName}.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    void: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
    // TODO: Add attributes (foreign keys use BIGINT, required fields set allowNull: false)
    // person_id: {
    //   type: DataTypes.BIGINT,
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    tableName: '${tableName}',
    timestamps: false,
  }
);

// TODO: Define associations after importing related models
// ${modelName}.belongsTo(Person, { foreignKey: 'person_id' });

export default ${modelName};
`;

  await writeFile(filePath, template.trim(), 'utf8');
  
  consola.success(`\n✨ ${modelName} model created`);
  consola.info(`   📁 src/models/${fileName}`);
  consola.info(`   🗂️  Table: ${tableName}`);
  consola.info(`\n💡 Next: Add your columns and associations`);
}

const IS_CLI = process.argv.some(arg => 
  arg.includes('generate-model') && 
  (arg.endsWith('.ts') || arg.endsWith('.js') || arg.includes('/generate-model'))
);

if (IS_CLI) {
  generateModel().catch(err => {
    consola.fatal('Generation failed:', err.message);
    process.exit(1);
  });
}