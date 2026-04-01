# Architecture Overview — Naval Digital Twin Platform

## System context

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Naval Digital Twin Platform                        │
│                                                                      │
│  ┌──────────────────┐     HTTP/REST     ┌──────────────────────┐    │
│  │  apps/web         │ ◄──────────────► │  apps/api             │    │
│  │  Next.js 15       │                  │  NestJS 10            │    │
│  │  App Router       │                  │  Versioned REST API   │    │
│  │  TypeScript       │                  │  /api/v1/...          │    │
│  └──────────────────┘                  └──────────┬───────────┘    │
│                                                    │ Prisma ORM     │
│                                         ┌──────────▼───────────┐    │
│                                         │  PostgreSQL 16        │    │
│                                         │  packages/database    │    │
│                                         └──────────────────────┘    │
│                                                    │                 │
│  ┌──────────────────┐                  ┌──────────▼───────────┐    │
│  │  apps/worker      │ ◄──────────────► │  packages/domain     │    │
│  │  Background jobs  │                  │  Shared types/enums  │    │
│  │  Simulation runs  │                  └──────────────────────┘    │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Monorepo structure

```
apps/
  web/              Next.js 15 engineering workspace UI (primary frontend)
  api/              NestJS 10 REST API (primary backend)
  worker/           Background job processor (simulation, async tasks)

packages/
  config/           Shared TypeScript compiler configuration
  domain/           Shared domain types, enums, and API contracts
  ui/               Shared UI primitives (Badge, StatusDot, etc.)
  database/         Prisma schema, migrations, and seed data

infra/
  docker/           Dockerfiles for api, web, worker

legacy/             Original Vite/React naval catalogue (preserved as reference)
  catalogue/        → client/, server/, shared/ content (legacy dev path)

docs/
  architecture/     This directory
  product/          Product requirements and wireframes (future)

.github/workflows/  CI/CD pipelines
```

## Domain model (v1)

```
Organization
  └── OrganizationMember (n:n with User, role: ADMIN | MEMBER | VIEWER)
  └── Project (slug unique per org)
        └── DigitalTwin (version, status)
              └── Subsystem (hierarchical, parentId, depth)
                    └── Interface (protocol, direction)
                    └── Requirement (allocated from project)
              └── Variant (isBaseline)
              └── Simulation → SimulationRun (status, result JSON)
        └── Requirement (project-level)
        └── Review (type, status) → Evidence, Attachment

User
  └── OrganizationMember (membership)
  └── AuditEvent (actorId)
  └── Review (createdById)
```

## API versioning

All API routes are prefixed with `/api/v1/`. NestJS URI versioning is used:

```
GET  /api/v1/health
GET  /api/v1/projects
GET  /api/v1/projects/:id
POST /api/v1/projects

GET  /api/v1/twins/project/:projectId
POST /api/v1/twins

GET  /api/v1/subsystems?twinId=<id>
GET  /api/v1/subsystems/:id
POST /api/v1/subsystems
PATCH /api/v1/subsystems/:id

GET  /api/v1/requirements/project/:projectId
POST /api/v1/requirements

GET  /api/v1/reviews/project/:projectId
POST /api/v1/reviews

GET  /api/v1/evidence/review/:reviewId
POST /api/v1/evidence
```

## Web routing (Next.js App Router)

```
/                              → Project list (server component)
/(workspace)/
  projects/[projectId]/        → Project workspace dashboard
  projects/[projectId]/
    twins/[twinId]/            → Twin workspace (explorer + canvas + inspector)
```

## Technology decisions

| Concern               | Choice                 | Rationale                              |
|-----------------------|------------------------|----------------------------------------|
| Frontend              | Next.js 15 App Router  | Server/client boundary, SEO, ecosystem |
| Backend               | NestJS 10              | Modular, DI, production-grade          |
| ORM                   | Prisma 5               | Type-safe, migration-first, PostgreSQL |
| Database              | PostgreSQL 16          | Relational, full-text, JSONB           |
| Package manager       | pnpm workspaces        | Fast, disk-efficient, strict           |
| Styling               | Tailwind CSS v3        | Utility-first, dark theme, design sys  |
| Language              | TypeScript 5.6         | End-to-end type safety                 |
| Container             | Docker + Compose       | Reproducible local dev                 |
| CI                    | GitHub Actions         | Standard, cache-efficient              |

## Infrastructure (local development)

```
localhost:3000  → apps/web  (Next.js dev server)
localhost:4000  → apps/api  (NestJS dev server)
localhost:5432  → PostgreSQL (Docker)
```

## Future milestones

| Milestone | Focus                                           | Status |
|-----------|-------------------------------------------------|--------|
| M1        | Foundation, monorepo, schema, workspace shell   | done   |
| M2        | Auth (JWT/OAuth), full CRUD, live API in web    | done   |
| M3        | Variant management, evidence chain              | done   |
| M4        | Simulation orchestration, result ingestion      | done   |
| M5        | Multi-tenant SaaS hardening, observability      | done   |
| M6        | Kubernetes deployment, staging/production CI/CD |        |
