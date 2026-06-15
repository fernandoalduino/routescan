export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD'
  | 'ALL';

export interface Route {
  method: HttpMethod;
  path: string;
  file: string;
  line: number;
}