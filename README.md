# Naval Defence Digital Twin Platform

A production-oriented monorepo for the **Naval Digital Twin Platform** — an engineering workspace for naval defence system definition, digital twin management, requirements traceability, and simulation orchestration.

---

## Repository structure

```
apps/
  web/        Next.js 15 engineering workspace (primary frontend)
  api/        NestJS REST API — /api/v1/* (primary backend)
  worker/     Background job processor (simulation, async tasks)

packages/
  domain/     Shared TypeScript domain types, enums, and API contracts
  ui/         Shared UI primitives (Badge, StatusDot, etc.)
  config/     Shared TypeScript/tooling configuration
  database/   Prisma schema (schema.prisma), migrations, and seed data

infra/
  docker/     Dockerfiles for api, web, and worker

legacy/       Original Vite/React naval catalogue — preserved as reference

docs/
  architecture/  System design and migration documentation

.github/
  workflows/  GitHub Actions CI (install → typecheck → build → Prisma validate)
```

---

## Getting started (local development)

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker Desktop or Docker Engine with Compose

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env if needed — defaults point to the Docker Compose database
```

### 3. Start the database

```bash
docker compose up db -d
```

### 4. Initialise the database

```bash
pnpm db:migrate      # Run Prisma migrations
pnpm db:seed         # Seed with realistic naval domain sample data
```

### 5. Start the platform

```bash
# Start API + Web concurrently
pnpm dev

# Or start individually
pnpm dev:api         # http://localhost:4000/api/v1
pnpm dev:web         # http://localhost:3000
pnpm dev:worker      # background worker
```

### Full containerised stack

```bash
docker compose up
```

---

## Services

| Service     | URL                             | Description                        |
|-------------|----------------------------------|------------------------------------|
| Web         | http://localhost:3000            | Next.js engineering workspace      |
| API         | http://localhost:4000/api/v1     | NestJS REST API                    |
| API Health  | http://localhost:4000/api/v1/health | Health check endpoint           |
| PostgreSQL  | localhost:5432                   | Database (naval / naval_dev)       |

---

## Useful commands

```bash
# Database
pnpm db:generate    # Regenerate Prisma client after schema changes
pnpm db:migrate     # Run pending migrations (dev)
pnpm db:seed        # Re-seed the database
pnpm db:studio      # Open Prisma Studio in browser

# Build
pnpm build          # Build all apps and packages
pnpm build:web      # Build Next.js app
pnpm build:api      # Build NestJS API

# Type checking
pnpm typecheck      # Type check all apps and packages

# Formatting
pnpm format         # Prettier format everything
```

---

## API overview

All API routes are versioned under `/api/v1/`:

```
GET  /api/v1/health               Service health check
GET  /api/v1/projects             List projects
POST /api/v1/projects             Create project
GET  /api/v1/projects/:id         Get project
GET  /api/v1/twins/project/:id    List twins for a project
POST /api/v1/twins                Create twin
GET  /api/v1/subsystems?twinId=   List subsystems for a twin (with tree)
GET  /api/v1/subsystems/:id       Get subsystem with requirements/interfaces
POST /api/v1/subsystems           Create subsystem
GET  /api/v1/requirements/project/:id  List requirements for a project
POST /api/v1/requirements         Create requirement
GET  /api/v1/reviews/project/:id  List reviews
POST /api/v1/reviews              Create review
```

---

## Domain model

```
Organization → Project → DigitalTwin → Subsystem (hierarchical)
                                              └── Interface
                                              └── Requirement (allocated)
                               └── Variant
                               └── Simulation → SimulationRun
            └── Requirement (project-level)
            └── Review → Evidence, Attachment
User → OrganizationMember → Organization
User → AuditEvent
```

See `docs/architecture/overview.md` for the full system design.

---

## Legacy catalogue

The original Vite/React naval defence catalogue is preserved at the repository root:

```bash
pnpm dev:legacy    # Start legacy Vite catalogue on http://localhost:3000
```

See `legacy/README.md` and `docs/architecture/migration.md` for the migration strategy.

---

## Delivery phases

1. **M1** — Foundation: monorepo, schema v1, workspace shell, API baseline ✅
2. **M2** — Auth, full CRUD, live API integration in web
3. **M3** — Variant management, evidence chain, digital thread
4. **M4** — Simulation orchestration and result ingestion
5. **M5** — Multi-tenant SaaS hardening, observability
6. **M6** — Kubernetes deployment, staging/production CI/CD

---

## Tech stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | Next.js 15, TypeScript, Tailwind CSS v3 |
| Backend     | NestJS 10, TypeScript, class-validator |
| Database    | PostgreSQL 16, Prisma 5  |
| Packages    | pnpm workspaces          |
| Container   | Docker Compose           |
| CI          | GitHub Actions           |
