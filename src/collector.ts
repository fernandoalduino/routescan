import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, extname } from 'path';

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.next',
  'out',
]);

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

export interface CollectOptions {
  ignore?: string[];
}

export function collectSourceFiles(dir: string, options: CollectOptions = {}): string[] {
  const root = resolve(dir);

  if (!existsSync(root)) {
    throw new Error(`Path does not exist: ${dir}`);
  }
  if (!statSync(root).isDirectory()) {
    throw new Error(`Path is not a directory: ${dir}`);
  }

  const ignored = new Set([...IGNORED_DIRS, ...(options.ignore ?? [])]);
  const results: string[] = [];

  walk(root, ignored, results);

  return results.sort();
}

function walk(current: string, ignored: Set<string>, acc: string[]): void {
  const entries = readdirSync(current, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(current, entry.name);

    if (entry.isDirectory()) {
      if (ignored.has(entry.name)) continue;
      walk(fullPath, ignored, acc);
    } else if (entry.isFile() && isSourceFile(entry.name)) {
      acc.push(fullPath);
    }
  }
}

function isSourceFile(name: string): boolean {
  if (name.endsWith('.d.ts')) return false;
  return SOURCE_EXTENSIONS.has(extname(name));
}