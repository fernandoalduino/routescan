import { Project, SyntaxKind, Node, CallExpression } from 'ts-morph';
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

export function parseRoutes(files: string[]): Route[] {
  const project = new Project({
    compilerOptions: { allowJs: true },
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });

  for (const file of files) {
    project.addSourceFileAtPath(file);
  }

  const routes: Route[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();

    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) return;

      const route = extractRoute(node, filePath);
      if (route) routes.push(route);
    });
  }

  return routes;
}

function extractRoute(call: CallExpression, filePath: string): Route | null {
  const expression = call.getExpression();

  if (!Node.isPropertyAccessExpression(expression)) return null;

  const methodName = expression.getName().toLowerCase();
  const method = HTTP_METHODS[methodName];
  if (!method) return null;

  const args = call.getArguments();
  if (args.length === 0) return null;

  const pathArg = args[0];
  const path = getStringLiteralValue(pathArg);
  if (path === null || !path.startsWith('/')) return null;

  if (args.length < 2) return null;

  return {
    method,
    path,
    file: filePath,
    line: call.getStartLineNumber(),
  };
}

function getStringLiteralValue(node: Node): string | null {
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }
  return null;
}

export { SyntaxKind };