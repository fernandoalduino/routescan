import { describe, it, expect } from 'vitest';
import { parseArgs } from '../src/args';

describe('parseArgs', () => {
  it('parses a directory argument', () => {
    const opts = parseArgs(['src']);
    expect(opts.directory).toBe('src');
    expect(opts.format).toBe('terminal');
  });

  it('parses format and output options', () => {
    const opts = parseArgs(['src', '--format', 'markdown', '-o', 'ROUTES.md']);
    expect(opts.format).toBe('markdown');
    expect(opts.output).toBe('ROUTES.md');
  });

  it('sets help and version flags', () => {
    expect(parseArgs(['--help']).help).toBe(true);
    expect(parseArgs(['-v']).version).toBe(true);
  });

  it('throws on an invalid format', () => {
    expect(() => parseArgs(['src', '--format', 'xml'])).toThrow(/invalid format/i);
  });

  it('throws on an unknown option', () => {
    expect(() => parseArgs(['src', '--nope'])).toThrow(/unknown option/i);
  });

  it('throws when a value-option is missing its value', () => {
    expect(() => parseArgs(['src', '--format'])).toThrow(/requires a value/i);
  });

  it('throws on multiple directories', () => {
    expect(() => parseArgs(['src', 'lib'])).toThrow(/only one directory/i);
  });
});