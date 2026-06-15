import { HttpMethod, Route } from '../types';
import { Colorize } from '../colors';
import { sortRoutes } from './sort';

const METHOD_COLORS: Record<HttpMethod, Parameters<Colorize>[1]> = {
  GET: 'green',
  POST: 'yellow',
  PUT: 'blue',
  PATCH: 'cyan',
  DELETE: 'red',
  OPTIONS: 'magenta',
  HEAD: 'gray',
  ALL: 'bold',
};

export interface TerminalFormatOptions {
  colorize: Colorize;
}

export function formatTerminal(routes: Route[], options: TerminalFormatOptions): string {
  const { colorize } = options;

  if (routes.length === 0) {
    return colorize('No routes found.', 'gray');
  }

  const sorted = sortRoutes(routes);

  const methodWidth = Math.max(...sorted.map((r) => r.method.length));

  const lines = sorted.map((route) => {
    const method = colorize(route.method.padEnd(methodWidth), METHOD_COLORS[route.method]);
    return `${method}  ${route.path}`;
  });

  const summary = colorize(
    `\n${routes.length} route(s) found.`,
    'gray',
  );

  return `${lines.join('\n')}${summary}`;
}