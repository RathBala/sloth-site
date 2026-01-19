import { spawnSync } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'build', 'dist']);

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectJsFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      files.push(...(await collectJsFiles(path.join(dirPath, entry.name))));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(path.join(dirPath, entry.name));
    }
  }

  return files;
}

function checkJsFile(filePath) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    encoding: 'utf8',
  });

  if (result.status === 0) return null;

  return {
    filePath,
    stderr: result.stderr?.trim() || result.stdout?.trim() || 'Unknown error',
  };
}

async function main() {
  const targets = [];

  const srcDir = path.join(projectRoot, 'src');
  if (await exists(srcDir)) targets.push(...(await collectJsFiles(srcDir)));

  const tailwindConfig = path.join(projectRoot, 'tailwind.config.js');
  if (await exists(tailwindConfig)) targets.push(tailwindConfig);

  if (targets.length === 0) {
    console.log('No JS files found to typecheck.');
    return;
  }

  const failures = targets
    .map(checkJsFile)
    .filter((failure) => failure !== null);

  if (failures.length === 0) return;

  for (const failure of failures) {
    console.error(`\n[typecheck] Syntax error in ${failure.filePath}\n${failure.stderr}`);
  }

  process.exitCode = 1;
}

try {
  await main();
} catch (error) {
  console.warn('[typecheck] Unexpected failure while checking JS syntax:', error);
  process.exit(1);
}

