# Legacy-to-Platform Migration Guide

## Summary

This document describes the transition from the original Vite/React naval defence catalogue
to the Naval Digital Twin Platform monorepo architecture.

## What existed before (legacy catalogue)

| Asset                 | Location                           | Description                                   |
|-----------------------|------------------------------------|-----------------------------------------------|
| Vite + React frontend | `legacy/catalogue/client/`         | Static naval systems catalogue with rich UI   |
| Express dev server    | `legacy/catalogue/server/`         | Simple static-serving Express server          |
| Shared constants      | `legacy/catalogue/shared/`         | Shared catalogue data constants               |
| Vite config           | `legacy/catalogue/vite.config.ts`  | Build configuration with debug plugins        |
| shadcn/ui registry    | `legacy/catalogue/components.json` | Component configuration                       |

The legacy catalogue is a **polished single-page application** with:
- Naval system category browser
- System detail pages with specifications
- AI assistant page
- Visualisation page
- Map view
- Spec database browser

It is built on **Vite + Wouter + Tailwind CSS v4 + Radix UI**.

## What the new platform adds (Milestone 1)

| Asset                 | Location               | Description                                 |
|-----------------------|------------------------|---------------------------------------------|
| Next.js 15 workspace  | `apps/web/`            | Engineering workspace shell with dark theme |
| NestJS API            | `apps/api/`            | Versioned REST API with domain modules      |
| Worker scaffold       | `apps/worker/`         | Background job processor (M1 scaffold)      |
| Prisma schema v1      | `packages/database/`   | Production-grade domain model               |
| Shared types          | `packages/domain/`     | TypeScript enums and interfaces             |
| Shared UI primitives  | `packages/ui/`         | Badge, StatusDot components                 |
| Shared config         | `packages/config/`     | TypeScript compiler bases                   |
| Docker Compose        | `docker-compose.yml`   | Full local dev stack (db, api, web, worker) |
| GitHub Actions CI     | `.github/workflows/`   | Install, typecheck, build, Prisma validation|
| Architecture docs     | `docs/architecture/`   | This documentation                          |

## What was preserved

- **Visual language**: The dark engineering workspace palette is inspired by the catalogue's
  existing design system (Space Grotesk, JetBrains Mono, dark theme, naval colour tokens).
- **Domain content**: Naval domain entities (frigates, subsystems, sensor suites, propulsion
  systems) from the catalogue are used as seed data in `packages/database/prisma/seed.ts`.
- **Component library**: The Radix UI / shadcn approach from the catalogue is preserved
  conceptually in `packages/ui/` (adapting to the new stack over time).

## What changed

| Legacy                          | New Platform                                  |
|---------------------------------|-----------------------------------------------|
| Root package.json = Vite app    | Root package.json = pnpm workspace root       |
| Static in-memory data           | Prisma + PostgreSQL API-backed domain model   |
| Wouter client-side routing      | Next.js App Router (server + client)          |
| Tailwind CSS v4 (Vite plugin)   | Tailwind CSS v3 (PostCSS, standard)           |
| Express-served SPA              | Next.js standalone server                     |
| Single-package repo             | pnpm monorepo (apps/* + packages/*)           |
| No versioning on API            | /api/v1/* with URI versioning                 |
| Minimal Prisma schema           | Production-grade schema with full domain      |

## Running the legacy catalogue

The legacy catalogue is now isolated in `legacy/catalogue/` as a proper pnpm workspace package (`@naval/legacy-catalogue`).

```bash
# Install dependencies (run once)
pnpm install

# Start the legacy Vite dev server
pnpm dev:legacy
```

## Running the new platform

```bash
# 1. Install all dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env

# 3. Start the database
docker compose up db -d

# 4. Run migrations and seed
pnpm db:migrate
pnpm db:seed

# 5. Start API and Web concurrently
pnpm dev
```

Or use Docker Compose for a fully containerised stack:

```bash
docker compose up
```

## Migration path for content

The catalogue contains rich naval domain content (system descriptions, specifications,
classifications). This content will be migrated to the database seed in later milestones,
ensuring the platform UI reflects the same naval domain knowledge as the catalogue.

Phase 1 migration tasks (Milestone 2):
1. Extract catalogue system data into Prisma seed records
2. Map catalogue categories to Subsystem/Interface hierarchy
3. Port catalogue visual styles to Next.js workspace design system

## Known coexistence issues

1. **Port conflict**: Both the legacy catalogue and `apps/web` use port 3000.
   Run `pnpm dev:legacy` (catalogue) or `pnpm dev:web` (new platform) — not both simultaneously.
2. **`@builder.io/vite-plugin-jsx-loc` peer warning**: the legacy catalogue uses this Vite plugin which
   declares a peer dep on Vite 4/5 while the workspace installs Vite 7. This warning is benign and
   limited to the legacy app only.
