import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { collectSourceFiles } from '../src/collector';
import { parseRoutes } from '../src/parser';

const fixtures = resolve(__dirname, 'fixtures');

function scan(fixture: string) {
  const files = collectSourceFiles(resolve(fixtures, fixture));
  return parseRoutes(files);
}

function asPairs(fixture: string): string[] {
  return scan(fixture)
    .map((r) => `${r.method} ${r.path}`)
    .sort();
}

describe('parseRoutes — basic app', () => {
  it('detects direct app routes with method and path', () => {
    expect(asPairs('basic-app')).toEqual([
      'DELETE /users/:id',
      'GET /users',
      'POST /users',
    ]);
  });

  it('captures file and line for each route', () => {
    const routes = scan('basic-app');
    for (const route of routes) {
      expect(route.file).toMatch(/app\.js$/);
      expect(route.line).toBeGreaterThan(0);
    }
  });
});

describe('parseRoutes — mounted routers', () => {
  it('resolves router prefixes from app.use()', () => {
    expect(asPairs('router-mount')).toEqual([
      'DELETE /users/:id',
      'GET /health',
      'GET /users',
      'POST /users',
    ]);
  });
});

describe('parseRoutes — edge cases', () => {
  it('ignores false positives and keeps valid routes only', () => {
    expect(asPairs('edge-cases')).toEqual(['GET /ping', 'PATCH /items/:id']);
  });
});