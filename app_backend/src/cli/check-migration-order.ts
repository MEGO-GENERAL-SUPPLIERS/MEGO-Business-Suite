// src/cli/check-migration-order.ts
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../..');

async function checkOrder() {
  const migrationPaths = await glob(
    new URL('../database/migrations/*.ts', import.meta.url).pathname
  );
  
  console.log('='.repeat(60));
  console.log('MIGRATION EXECUTION ORDER (BEFORE SORT)');
  console.log('='.repeat(60));
  migrationPaths.forEach((path, idx) => {
    console.log(`${idx + 1}. ${path.split(/[\\/]/).pop()}`);
  });
  
  // Sort them
  migrationPaths.sort((a, b) => {
    const nameA = a.split(/[\\/]/).pop()!;
    const nameB = b.split(/[\\/]/).pop()!;
    return nameA.localeCompare(nameB);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION EXECUTION ORDER (AFTER SORT)');
  console.log('='.repeat(60));
  migrationPaths.forEach((path, idx) => {
    console.log(`${idx + 1}. ${path.split(/[\\/]/).pop()}`);
  });
  console.log('='.repeat(60));
}

checkOrder();