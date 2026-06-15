import { Project, Node, CallExpression, Symbol as TsSymbol } from 'ts-morph';
import { HttpMethod, Route } from './types';

const HTTP_METHODS: Record<string, HttpMethod> = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
  patch: 'PATCH',
  options: 'OPTIONS',
  head: 'HEAD',
  all: 'ALL',
};

interface RawRoute {
  method: HttpMethod;
  path: string;
  file: string;
  line: number;
}

interface Mount {
  parent: TsSymbol | null;
  child: TsSymbol;
  prefix: string;
}

interface RouterNode {
  symbol: TsSymbol;
  routes: RawRoute[];
  children: { child: TsSymbol; prefix: string }[];
  isMounted: boolean;
}

export function parseRoutes(files: string[]): Route[] {
  const project = new Project({
    compilerOptions: { allowJs: true },
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });

  for (const file of files) {
    project.addSourceFileAtPath(file);
  }

  const nodes = new Map<TsSymbol, RouterNode>();
  const mounts: Mount[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) return;
      collectRoute(node, filePath, nodes);
      collectMount(node, mounts);
    });
  }

  const rootMounts: { child: TsSymbol; prefix: string }[] = [];
  for (const mount of mounts) {
    const childNode = ensureNode(nodes, mount.child);
    childNode.isMounted = true;

    if (mount.parent && nodes.has(mount.parent)) {
      nodes.get(mount.parent)!.children.push({ child: mount.child, prefix: mount.prefix });
    } else if (mount.parent) {
      ensureNode(nodes, mount.parent).children.push({
        child: mount.child,
        prefix: mount.prefix,
      });
    } else {
      rootMounts.push({ child: mount.child, prefix: mount.prefix });
    }
  }

  const resolved: Route[] = [];
  for (const node of nodes.values()) {
    if (!node.isMounted) emitRoutes(node, '', nodes, resolved, new Set());
  }
  for (const { child, prefix } of rootMounts) {
    const node = nodes.get(child);
    if (node) emitRoutes(node, prefix, nodes, resolved, new Set());
  }

  return dedupe(resolved);
}

function collectRoute(
  call: CallExpression,
  filePath: string,
  nodes: Map<TsSymbol, RouterNode>,
): void {
  const expression = call.getExpression();
  if (!Node.isPropertyAccessExpression(expression)) return;

  const method = HTTP_METHODS[expression.getName().toLowerCase()];
  if (!method) return;

  const args = call.getArguments();
  if (args.length < 2) return;

  const path = getStringValue(args[0]);
  if (path === null || !path.startsWith('/')) return;

  const objectSymbol = resolveSymbol(expression.getExpression());
  if (!objectSymbol) return;

  const node = ensureNode(nodes, objectSymbol);
  node.routes.push({ method, path, file: filePath, line: call.getStartLineNumber() });
}

function collectMount(call: CallExpression, mounts: Mount[]): void {
  const expression = call.getExpression();
  if (!Node.isPropertyAccessExpression(expression)) return;
  if (expression.getName() !== 'use') return;

  const args = call.getArguments();
  if (args.length < 2) return;

  const prefix = getStringValue(args[0]);
  if (prefix === null || !prefix.startsWith('/')) return;

  const childSymbol = resolveSymbol(args[1]);
  if (!childSymbol) return;

  const parentSymbol = resolveSymbol(expression.getExpression());
  mounts.push({ parent: parentSymbol, child: childSymbol, prefix });
}

function resolveSymbol(node: Node): TsSymbol | null {
  if (!Node.isIdentifier(node)) return null;
  const symbol = node.getSymbol();
  if (!symbol) return null;
  const aliased = symbol.getAliasedSymbol();
  return aliased ?? symbol;
}

function ensureNode(nodes: Map<TsSymbol, RouterNode>, symbol: TsSymbol): RouterNode {
  let node = nodes.get(symbol);
  if (!node) {
    node = { symbol, routes: [], children: [], isMounted: false };
    nodes.set(symbol, node);
  }
  return node;
}

function emitRoutes(
  node: RouterNode,
  prefix: string,
  nodes: Map<TsSymbol, RouterNode>,
  out: Route[],
  stack: Set<TsSymbol>,
): void {
  if (stack.has(node.symbol)) return;
  stack.add(node.symbol);

  for (const r of node.routes) {
    out.push({
      method: r.method,
      path: joinPaths(prefix, r.path),
      file: r.file,
      line: r.line,
    });
  }

  for (const { child, prefix: childPrefix } of node.children) {
    const childNode = nodes.get(child);
    if (childNode) {
      emitRoutes(childNode, joinPaths(prefix, childPrefix), nodes, out, stack);
    }
  }

  stack.delete(node.symbol);
}

function joinPaths(a: string, b: string): string {
  const combined = `${a}/${b}`.replace(/\/{2,}/g, '/');
  if (combined.length > 1 && combined.endsWith('/')) {
    return combined.slice(0, -1);
  }
  return combined === '' ? '/' : combined;
}

function getStringValue(node: Node): string | null {
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }
  return null;
}

function dedupe(routes: Route[]): Route[] {
  const seen = new Set<string>();
  const result: Route[] = [];
  for (const r of routes) {
    const key = `${r.method} ${r.path} ${r.file}:${r.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(r);
  }
  return result;
}