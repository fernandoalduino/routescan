import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { collectSourceFiles } from '../src/collector';

const fixtures = resolve(__dirname, 'fixtures');

describe('collectSourceFiles', () => {
  it('collects js and ts source files', () => {
    const files = collectSourceFiles(resolve(fixtures, 'router-mount'));
    expect(files).toHaveLength(2);
    expect(files.some((f) => f.endsWith('app.js'))).toBe(true);
    expect(files.some((f) => f.endsWith('users.ts'))).toBe(true);
  });

  it('returns a sorted, deterministic list', () => {
    const files = collectSourceFiles(resolve(fixtures, 'router-mount'));
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });

  it('throws for a non-existent path', () => {
    expect(() => collectSourceFiles(resolve(fixtures, 'does-not-exist'))).toThrow(
      /does not exist/i,
    );
  });

  it('throws when the path is a file, not a directory', () => {
    expect(() =>
      collectSourceFiles(resolve(fixtures, 'basic-app', 'app.js')),
    ).toThrow(/not a directory/i);
  });
});