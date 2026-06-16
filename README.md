# routescan

[![npm version](https://img.shields.io/npm/v/routescan.svg)](https://www.npmjs.com/package/routescan)
[![CI](https://github.com/fernandoalduino/routescan/actions/workflows/ci.yml/badge.svg)](https://github.com/fernandoalduino/routescan/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

> **Static analysis CLI that scans your Express project and documents its routes: without ever running your app.**

`routescan` walks your source folder, parses the code with TypeScript's AST (via [`ts-morph`](https://ts-morph.com)), resolves mounted routers and path prefixes, and prints a clean route map. Perfect for quick documentation, onboarding, and keeping your README in sync.

---

## Features

- **Static analysis**: never executes your code, so it's safe on any project.
- **Router-aware**: resolves `app.use('/users', router)` into fully-qualified paths, even across files.
- **Colored terminal output**: one color per HTTP method for fast scanning.
- **Markdown export**: drop a route table straight into your README.
- **Zero runtime dependencies** beyond the parser: fast and lightweight.
- **Works with JS & TS**: `.js`, `.ts`, `.mjs`, `.cjs`, and more.

---

## Installation

Run it instantly with `npx`:

```bash
npx routescan src
```

Or install globally:

```bash
npm install -g routescan
```

---

## Usage

```bash
routescan <directory> [options]
```

### Example

```bash
routescan src
```

```text
GET     /health
GET     /users
POST    /users
DELETE  /users/:id

4 route(s) found.
```

### Options

| Option | Alias | Description |
| --- | --- | --- |
| `--format <fmt>` | `-f` | Output format: `terminal` (default) or `markdown` |
| `--output <file>` | `-o` | Write the result to a file instead of stdout |
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show the version |

---

## Markdown export

Generate a table ready to paste into your docs:

```bash
routescan src --format markdown
```

Or write it directly to a file:

```bash
routescan src -o ROUTES.md
```

Produces:

## Routes

| Method | Path |
| --- | --- |
| `GET` | `/health` |
| `GET` | `/users` |
| `POST` | `/users` |
| `DELETE` | `/users/:id` |

---

## How it works

`routescan` builds a small **router graph** from your source code:

1. **Collect** all source files (ignoring `node_modules`, `dist`, etc.).
2. **Parse** each file's AST and detect calls like `app.get(...)` / `router.post(...)`.
3. **Resolve mounts**: follow `app.use('/prefix', router)` across files using symbol resolution.
4. **Emit** fully-qualified routes by concatenating prefixes from each root.

Because it's pure static analysis, there's no need to install your target project's dependencies or boot a server.

---

## Known limitations

These are intentional scope choices for the MVP, contributions welcome!

- Dynamic paths (computed at runtime) and variable prefixes are not resolved.
- Array mounts like `app.use('/api', [a, b])` are not yet supported.
- Currently focused on **Express**. Nest and Fastify support are on the roadmap.

---

## Roadmap

- [ ] Fastify support
- [ ] NestJS decorator support (`@Get()`, `@Controller()`)
- [ ] Middleware detection
- [ ] OpenAPI / Swagger export
- [ ] `--ignore` glob option

---

## Contributing

Contributions, issues, and feature requests are welcome! Check the [issues page](https://github.com/fernandoalduino/routescan/issues).

```bash
git clone https://github.com/fernandoalduino/routescan.git
cd routescan
npm install
npm test
```

---

## License

[MIT](./LICENSE) © Fernando P. A. Junior
