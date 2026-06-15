#!/usr/bin/env node

import { parseArgs } from './args';
import { VERSION } from './index';
import { collectSourceFiles } from './collector';
import { parseRoutes } from './parser';
import { createColorizer, shouldUseColor } from './colors';
import { formatTerminal } from './format/terminal';

function printHelp(): void {
  console.log(`
routescan v${VERSION}

Static analysis CLI that scans Express projects and documents their routes.

USAGE
  routescan <directory> [options]

ARGUMENTS
  <directory>        Path to the source folder to scan (e.g. "src")

OPTIONS
  -f, --format <fmt> Output format: "terminal" (default) or "markdown"
  -o, --output <file> Write the result to a file instead of stdout
  -h, --help         Show this help message
  -v, --version      Show the version number

EXAMPLES
  routescan src
  routescan src --format markdown
  routescan src -f markdown -o ROUTES.md
`);
}

function main(argv: string[]): void {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}\n`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  if (parsed.help) {
    printHelp();
    return;
  }

  if (parsed.version) {
    console.log(VERSION);
    return;
  }

  if (!parsed.directory) {
    console.error('Error: missing required <directory> argument.\n');
    printHelp();
    process.exitCode = 1;
    return;
  }

  let files: string[];
  try {
    files = collectSourceFiles(parsed.directory);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exitCode = 1;
    return;
  }

  const routes = parseRoutes(files);

  const colorize = createColorizer(shouldUseColor());
  const output = formatTerminal(routes, { colorize });
  console.log(output);

}

main(process.argv.slice(2));