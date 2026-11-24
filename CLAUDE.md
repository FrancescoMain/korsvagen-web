# CLAUDE.md

KORSVAGEN: website and CMS for a construction company. `client/` is a React 18.3.1 +
TypeScript SPA (styled-components), `server/` an Express API (ES modules) on Supabase and
Cloudinary, both deployed on Vercel.

## Commands
```bash
cd server && npm run dev     # backend dev server
cd client && npm start       # frontend dev server
npm run build                # build client + server (what Vercel runs)
npm run dev                  # Vercel local development
npm run migrate              # database migrations (migrate:status to check)
npm run db:backup            # database backup (db:stats for statistics)
cd client && npm test        # Jest + React Testing Library (few tests); no backend tests
```

## Environment variables
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `API_BASE_URL` (http://localhost:3001 in
dev), `CORS_ORIGIN` (http://localhost:3000 in dev), `JWT_SECRET`, `NODE_ENV`.

## Things the code does not tell you
- React is pinned to 18.3.1 with `overrides` in package.json for Vercel compatibility: do
  not upgrade it.
- Auth: JWT in httpOnly cookies, roles admin, editor, super_admin; protected routes are
  `/dashboard/*` and `/editor/*`.
- CORS allows several domains (localhost and production); rate limit 100 requests per
  15 minutes; `/api/health` is the health check.
- `vercel.json` at the root configures the serverless function; static files come from
  `build/`.
- Style: dark theme with gold accents (`#d4af37`), mobile first, fonts in `public/fonts/`.

## Development workflow
- Dopo ogni implementazione fai il test di compilazione di client e server, poi committa.
  Il push su `main` fa partire il deploy: lo fai col via di Francesco.
- `.claude/commands/` contiene i comandi delle singole funzionalità di settembre 2026.
