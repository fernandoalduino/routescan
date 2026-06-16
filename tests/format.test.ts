import { describe, it, expect } from 'vitest';
import { Route } from '../src/types';
import { formatMarkdown } from '../src/format/markdown';
import { formatTerminal } from '../src/format/terminal';
import { sortRoutes } from '../src/format/sort';
import { createColorizer } from '../src/colors';

const routes: Route[] = [
  { method: 'POST', path: '/users', file: 'a.js', line: 2 },
  { method: 'GET', path: '/users', file: 'a.js', line: 1 },
  { method: 'GET', path: '/health', file: 'a.js', line: 3 },
];

describe('sortRoutes', () => {
  it('sorts by path then method order', () => {
    const sorted = sortRoutes(routes).map((r) => `${r.method} ${r.path}`);
    expect(sorted).toEqual(['GET /health', 'GET /users', 'POST /users']);
  });
});

describe('formatMarkdown', () => {
  it('produces a GFM table with all routes', () => {
    const md = formatMarkdown(routes);
    expect(md).toContain('| Method | Path |');
    expect(md).toContain('| `GET` | `/health` |');
    expect(md).toContain('| `POST` | `/users` |');
    expect(md).toContain('3 route(s) found.');
  });

  it('handles the empty case', () => {
    expect(formatMarkdown([])).toMatch(/no routes found/i);
  });
});

describe('formatTerminal', () => {
  it('produces plain aligned output when color is disabled', () => {
    const colorize = createColorizer(false);
    const out = formatTerminal(routes, { colorize });
    expect(out).not.toContain('\x1b[');
    expect(out).toContain('GET');
    expect(out).toContain('/health');
    expect(out).toContain('3 route(s) found.');
  });

  it('adds ANSI codes when color is enabled', () => {
    const colorize = createColorizer(true);
    const out = formatTerminal(routes, { colorize });
    expect(out).toContain('\x1b[');
  });

  it('handles the empty case', () => {
    const colorize = createColorizer(false);
    expect(formatTerminal([], { colorize })).toMatch(/no routes found/i);
  });
});