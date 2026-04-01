# Legacy Catalogue

This directory contains the original Vite/React naval defence catalogue application that preceded the Naval Digital Twin Platform.

## Contents

The legacy catalogue source lives in `legacy/catalogue/`:
- `catalogue/client/` — Vite + React frontend (naval defence catalogue UI)
- `catalogue/server/` — Express development server
- `catalogue/shared/` — Shared constants/types for the legacy app
- `catalogue/vite.config.ts` — Vite configuration
- `catalogue/components.json` — shadcn/ui component registry
- `catalogue/tsconfig.json` / `catalogue/tsconfig.node.json` — TypeScript config

## Running the legacy catalogue

```bash
# From repository root
pnpm dev:legacy
```

## Status

The legacy catalogue is preserved as **reference material and a visual/content source** for the new platform. It is **not** the primary development path. New development targets:

- `apps/web` — Next.js 15 engineering workspace (primary frontend)
- `apps/api` — NestJS API (primary backend)

## Migration notes

Visual patterns, colour language, and naval domain content from the catalogue are being incorporated into the new platform. The component architecture and static data patterns are **not** being migrated; instead, the new platform uses an API-backed domain model built on Prisma + PostgreSQL.

See `docs/architecture/migration.md` for the full transition strategy.
