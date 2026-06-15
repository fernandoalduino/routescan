import { Route } from '../types';
import { sortRoutes } from './sort';

export function formatMarkdown(routes: Route[]): string {
  if (routes.length === 0) {
    return '_No routes found._\n';
  }

  const sorted = sortRoutes(routes);

  const header = '| Method | Path |\n| --- | --- |';
  const rows = sorted.map((r) => `| \`${r.method}\` | \`${escapePipes(r.path)}\` |`);

  const title = '## Routes\n';
  const summary = `\n_${routes.length} route(s) found._\n`;

  return `${title}\n${header}\n${rows.join('\n')}\n${summary}`;
}

function escapePipes(value: string): string {
  return value.replace(/\|/g, '\\|');
}