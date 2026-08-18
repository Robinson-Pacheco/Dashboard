# AGENTS.md

Monorepo: `backend-nodejs/` (Express + MongoDB), `frontend-angular/` (Angular 21).

## Quick start

```bash
# backend (requires MongoDB running)
cd backend-nodejs
cp .env.example .env   # edit secrets
npm install
npm run seed           # creates admin/analyst/viewer users
npm run dev            # nodemon on :3000

# frontend
cd frontend-angular
npm install --legacy-peer-deps   # required, never omit
npm start              # ng serve on :4200
```

## Key commands

| Context | Command | Note |
|---------|---------|------|
| backend | `npm run dev` | nodemon, hot-reload |
| backend | `npm start` | production, no reload |
| backend | `npm run seed` | seeds 3 default users |
| backend | `npm run export-docs` | export Swagger JSON locally |
| frontend | `npm start` | `ng serve` |
| frontend | `ng build` | production build |
| frontend | `ng test` | Karma + Jasmine unit tests |
| frontend | `ng lint` | linter |

No linter/formatter config tracked in repo (Prettier config in frontend `package.json` only). No backend tests exist. No CI/CD pipelines.

## Architecture

### Backend — Hexagonal (Ports & Adapters)

```
domain/models/        → User, AdmissionData (Mongoose schemas)
application/services/ → business logic per feature
infrastructure/       → DB connection, AI providers (Factory pattern)
presentation/         → controllers, routes, middleware (auth, error)
```

Entrypoint: `src/index.js`. Route groups: `auth`, `admission`, `bi`, `data-mining`, `advanced-analytics`, `statistical`, `ai`.

### Frontend — Feature-based, standalone components

```
core/       → guards, interceptors, auth service
features/   → lazy-loaded per domain (dashboard, reports, ai-analytics, etc.)
layout/     → main-layout, sub-layout
shared/     → pipes, streaming service, confirm-dialog, ai-loader
```

Entrypoint: `src/main.ts` bootstraps `App` standalone. All components are standalone (no NgModules). Uses `inject()` not constructor DI. Uses Signals for state, zoneless change detection.

### AI Providers

Three providers via `AIProviderFactory`:
- `openrouter` (Claude, GPT-4 via cloud)
- `ollama` (local models)
- `opencode` (opencode.ai API)

Set via `AI_PROVIDER` env var. Fallback via `AI_FALLBACK_PROVIDER`. Dev-only AI test endpoints at `/api/dev/ai/` (no auth, only in `NODE_ENV=development`).

## Gotchas

- **`--legacy-peer-deps` required** for frontend `npm install` — do not skip.
- **`skipTests: true`** in angular.json schematics — `ng generate` never creates `.spec.ts`. Write test files manually.
- **CORS config must appear before Helmet** in `src/index.js` line 29-62.
- **Swagger only in dev mode** at `/api-docs`. Not available in production.
- **Rate limit**: 100 req / 15 min per IP on `/api/`.
- **Uploads**: Excel only (`.xlsx`). Period/year extracted from filename (e.g. `admisiones_2025-2.xlsx`). Files stored in `uploads/` (tracked via `.gitkeep`).
- **`.env` is gitignored** in backend `backend-nodejs/.gitignore`. Root `.gitignore` only ignores `.env.local`.
- **Default credentials** (run `npm run seed` first): `admin/admin123`, `analyst/analyst123`, `viewer/viewer123`.
- **AG Charts Enterprise** used for box plots — modules registered in `main.ts` line 7-19.
- **Chart.js** for all other charts via `ng2-charts`.
- **App routes**: `/dashboard` (default redirect), `/reports`, `/admission`, `/advanced-analytics`, `/users` (admin only), `/ai-analytics`, `/statistical-distribution`.
- **Full stack flow**: MongoDB → backend :3000 → frontend :4200.

## Existing guidance

See `CLAUDE.md` and `ARQUITECTURA.md` for detailed architecture, design patterns, and AI feature docs. `RBAC-GUIDE.md` (frontend) covers role permissions.
