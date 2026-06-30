// src/cli/cli-utils.ts
/**
 * Detect if script is being executed directly (not imported)
 * Works with: node, tsx, npm run
 */
export function isDirectExecution(scriptFilename: string): boolean {
  // Method 1: Check if script path appears in argv (works with tsx/npm)
  const matchesArgv = process.argv.some(arg => 
    arg.includes(scriptFilename) && 
    (arg.endsWith('.ts') || arg.endsWith('.js'))
  );
  
  if (matchesArgv) return true;
  
  // Method 2: Fallback for direct node execution
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
}