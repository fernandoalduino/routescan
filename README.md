# routescan

> Static analysis CLI that scans Express projects and documents their routes — no need to run your app.

## Status

🚧 Work in progress.

## Idea

Point `routescan` at your source folder and get an instant route map:

```bash
routescan src
```

Output:

```text
GET    /users
POST   /users
DELETE /users/:id
```

## License

MIT