import { HttpMethod, Route } from '../types';

const METHOD_ORDER: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
  'ALL',
];

export function sortRoutes(routes: Route[]): Route[] {
  return [...routes].sort((a, b) => {
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method);
  });
}