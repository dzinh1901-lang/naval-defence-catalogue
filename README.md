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
  workflows/  GitHub Actions CI (install -> typecheck -> build -> Prisma validate)
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
# Edit .env if needed -- defaults point to the Docker Compose database
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
# Start API + Web concurrently (uses concurrently -- portable, no shell backgrounding)
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
GET  /api/v1/health                    Service health check
GET  /api/v1/auth/me                   Get current user (requires auth token)
GET  /api/v1/auth/whoami               Guest identity check (public)
GET  /api/v1/projects                  List projects (optional ?organizationId= ?status=)
POST /api/v1/projects                  Create project
GET  /api/v1/projects/:id              Get project with twins
GET  /api/v1/twins/project/:id         List twins for a project (with subsystems, variants)
POST /api/v1/twins                     Create twin
GET  /api/v1/twins/:id                 Get twin with full detail (subsystems, variants, simulations)
GET  /api/v1/subsystems?twinId=        List subsystems for a twin (with tree)
GET  /api/v1/subsystems/:id            Get subsystem with requirements/interfaces
POST /api/v1/subsystems                Create subsystem
PATCH /api/v1/subsystems/:id           Update subsystem
DELETE /api/v1/subsystems/:id          Delete subsystem
GET  /api/v1/requirements/project/:id  List requirements for a project (optional ?subsystemId=)
POST /api/v1/requirements              Create requirement
GET  /api/v1/variants/twin/:id         List variants for a twin
POST /api/v1/variants                  Create variant
GET  /api/v1/variants/:id              Get a variant
PATCH /api/v1/variants/:id             Update variant
DELETE /api/v1/variants/:id            Delete variant
GET  /api/v1/reviews/project/:id       List reviews (includes evidence and creator)
POST /api/v1/reviews                   Create review
GET  /api/v1/reviews/:id               Get a review
PATCH /api/v1/reviews/:id              Update review status
GET  /api/v1/evidence/review/:id       List evidence for a review
POST /api/v1/evidence                  Create evidence
```

---

## Domain model

```
Organization --> OrganizationMember <-- User
             --> Project --> ProjectMember <-- User   (M2: project-level access)
                         --> DigitalTwin --> Subsystem (hierarchical, depth 0-n)
                                                    --> Interface
                                                    --> Requirement (allocated)
                                         --> Variant (+ configuration JSON)  (M2)
                                         --> Simulation --> SimulationRun
                                                               --> requestedBy: User  (M2)
                         --> Requirement (project-level)
                         --> Review --> Evidence, Attachment
User --> AuditEvent
```

See `docs/architecture/overview.md` for the full system design.

---

## Authentication (Milestone 4)

The API uses JWT-based authentication via `@nestjs/passport` and `passport-jwt`.

### Configuration

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Production only | HS256 signing secret (min 32 chars). Falls back to `dev-secret-change-in-production` in dev. |
| `JWT_EXPIRES_IN_SECS` | Optional | Token lifetime in seconds (default: 604800 = 7 days). |
| `AUTH_BOOTSTRAP_SECRET` | Optional | Secret for `POST /auth/token` — dev/service-account token issuance. |

### Development

Without `JWT_SECRET` set, the API falls back to the legacy dev-token sentinel:

- `Authorization: Bearer dev-token` → ADMIN user
- Any other non-empty token → MEMBER user
- Routes decorated with `@Public()` bypass token checking.

### Issuing JWT tokens

`POST /api/v1/auth/token` accepts a `bootstrapSecret` + user fields and returns a signed JWT.
In production, replace this endpoint with a proper identity provider flow (OIDC/OAuth2).

### Access model — RBAC (Milestone 4)

Fine-grained RBAC is enforced on all write endpoints:

| Role | Capabilities |
|---|---|
| `VIEWER` | Read-only access to all resources. |
| `MEMBER` | Read + create/update resources within their projects. |
| `ADMIN` | Full access including deletions and sensitive operations. |

**Project-level precedence:** A user's `ProjectMember` role overrides their org-level role for
project-scoped operations. For example, a `VIEWER` at org level with a `MEMBER` `ProjectMember`
record can create resources within that specific project.

---

## Simulation Orchestration (Milestone 4)

Simulation endpoints are now live:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/simulations` | Create a simulation definition |
| `GET` | `/api/v1/simulations/twin/:twinId` | List simulations for a twin |
| `GET` | `/api/v1/simulations/:id` | Get simulation with run history |
| `POST` | `/api/v1/simulations/:id/runs` | Trigger a new simulation run |
| `GET` | `/api/v1/simulations/:id/runs` | List runs for a simulation |
| `GET` | `/api/v1/simulations/:id/runs/:runId` | Get a single run |
| `PATCH` | `/api/v1/simulations/:id/runs/:runId` | Cancel a pending/running run |

Runs are created in `PENDING` status. The worker process is responsible for advancing
the state through `RUNNING → COMPLETED | FAILED`.

---

## Data status (Milestone 4)

| Data source        | Status                                          |
|--------------------|-------------------------------------------------|
| Project list       | Live -- loaded from API (`/api/v1/projects`)    |
| Project workspace  | Live -- loaded from API (live counts)           |
| Twin workspace     | Live -- subsystem tree loaded from API          |
| Requirements       | Live -- loaded from API per project             |
| Subsystem inspect  | Live -- loaded from API                         |
| Variants           | Live -- API-backed with configuration JSON UI   |
| Simulations        | Live -- CRUD + run orchestration API in M4      |
| Reviews/Evidence   | Live -- review list with evidence in project    |

---

## Legacy catalogue

The original Vite/React naval defence catalogue is preserved at the repository root:

```bash
pnpm dev:legacy    # Start legacy Vite catalogue on http://localhost:3000
```

See `legacy/README.md` and `docs/architecture/migration.md` for the migration strategy.

---

## Delivery phases

1. **M1** -- Foundation: monorepo, schema v1, workspace shell, API baseline (done)
2. **M2** -- Auth foundation, project membership, live API vertical slice (done)
3. **M3** -- Variant management UI, review workflows, live counts (done)
4. **M4** -- JWT auth, RBAC enforcement, simulation orchestration
5. **M5** -- Multi-tenant SaaS hardening, observability
6. **M6** -- Kubernetes deployment, staging/production CI/CD

---

## Tech stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | Next.js 15, TypeScript, Tailwind CSS v3 |
| Backend     | NestJS 10, TypeScript, class-validator |
| Database    | PostgreSQL 16, Prisma 5  |
| Packages    | pnpm workspaces          |
| Dev scripts | concurrently (portable process orchestration) |
| Container   | Docker Compose           |
| CI          | GitHub Actions           |
