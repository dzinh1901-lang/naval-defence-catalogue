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

Enable Corepack before running workspace commands:

```bash
corepack enable
```

### 1. Install dependencies

```bash
pnpm install --frozen-lockfile
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env if needed -- defaults point to the Docker Compose database
# and include the local development bearer token for seeded sample data
```

### 3. Start the database

```bash
docker compose up db -d
```

### 4. Initialise the database

```bash
pnpm db:validate     # Validate Prisma schema and DATABASE_URL wiring
pnpm db:generate     # Generate Prisma client after a clean install
pnpm db:migrate      # Run Prisma migrations in local development
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

### 6. Verify a fresh checkout

```bash
pnpm verify
```

### Full containerised stack

```bash
docker compose up --build
pnpm smoke:http
```

`docker compose up --build` is clean-room safe: the API and worker containers install
dependencies into named volumes, generate Prisma client code, and the API applies committed
migrations plus the local seed before it starts.

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
pnpm db:validate    # Validate Prisma schema
pnpm db:generate    # Regenerate Prisma client after schema changes
pnpm db:migrate     # Run pending migrations (dev)
pnpm db:migrate:deploy  # Apply committed migrations (CI/staging/prod)
pnpm db:migrate:status  # Show migration status against DATABASE_URL
pnpm db:seed        # Re-seed the database
pnpm db:studio      # Open Prisma Studio in browser

# Verification
pnpm test           # Runtime contract tests for startup validation helpers
pnpm verify         # Lint + Prisma validate/generate + typecheck + build + artifact checks
pnpm smoke:startup  # Boot built API/web/worker artifacts and verify health checks
pnpm smoke:http     # HTTP smoke test for local API/web
pnpm smoke:production  # Build images, run containers, and verify production startup
pnpm verify:deployment  # Verify a deployed staging/prod environment via URLs + auth

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
GET  /api/v1/workspace/:twinId           Workspace summary (project, twin, presets, KPI summaries)
GET  /api/v1/workspace/:twinId/hotspots  Vessel viewport hotspots
GET  /api/v1/workspace/:twinId/alerts    Alert feed for workspace overlays
GET  /api/v1/workspace/:twinId/history   Twin activity/history feed
GET  /api/v1/workspace/:twinId/performance Simulation/performance summary
GET  /api/v1/workspace/:twinId/rules     Compliance/rules summary
GET  /api/v1/workspace/:twinId/team      Team activity summary
GET  /api/v1/workspace/:twinId/view-config Current design-studio camera/material/light config
PATCH /api/v1/workspace/:twinId/view-config Persist design-studio camera/material/light config
```

### Workspace route

After seeding, open the engineering workspace at:

- `http://localhost:3000/workspace/twin-t52-baseline`

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
| `JWT_SECRET` | API runtime | HS256 signing secret (min 32 chars). The API refuses to boot if it is missing or too short. |
| `JWT_EXPIRES_IN_SECS` | Optional | Token lifetime in seconds (default: 28800 = 8 hours). |
| `CORS_ALLOWED_ORIGINS` | Optional | Comma-separated browser origins allowed to call the API directly. Leave unset when the API should not accept direct browser cross-origin traffic. Production example: `https://auren-workspace.com,https://byte.dns-parking.com,https://pixel.dns-parking.com` |
| `AUTH_BOOTSTRAP_SECRET` | Web/API bootstrap | Secret for `POST /auth/token` — service-account token issuance. Must be at least 8 characters when set. |
| `API_URL` | Web runtime | Server-side base URL used by the Next.js app to call the API. |
| `NEXT_PUBLIC_API_URL` | Browser runtime | Browser-visible API base URL. |
| `API_AUTH_TOKEN` | Optional | Pre-issued server-side bearer token used by the web app for protected API calls. |
| `API_SERVICE_USER_ID` | Web bootstrap | Service principal user ID used when the web app bootstraps its own token. |
| `API_SERVICE_EMAIL` | Web bootstrap | Service principal email used when the web app bootstraps its own token. |
| `API_SERVICE_ORGANIZATION_ID` | Web bootstrap | Service principal organization ID used when the web app bootstraps its own token. |
| `API_SERVICE_ROLE` | Web bootstrap | Service principal role (`ADMIN`, `MEMBER`, or `VIEWER`) used when the web app bootstraps its own token. |

### Development

- Set `JWT_SECRET` and `AUTH_BOOTSTRAP_SECRET` in local development before starting the API.
- The seeded values in `.env.example` let the web app bootstrap a JWT for the seeded admin service account.
- Routes decorated with `@Public()` still bypass token checking.

### Issuing JWT tokens

`POST /api/v1/auth/token` accepts a `bootstrapSecret` + user fields and returns a signed JWT.
This route is intended for local development and tightly controlled service environments.
In production, replace this endpoint with a proper identity provider flow (OIDC/OAuth2) or a pre-issued server-side token.

**Production guardrail:** bootstrap token issuance is disabled by default when `NODE_ENV=production`.
To explicitly allow it in a controlled deployment, set `ALLOW_BOOTSTRAP_TOKEN_ISSUANCE=true`.

### Production expectations

- Set `NODE_ENV=production`.
- Set a strong `JWT_SECRET` before starting the API. Startup fails fast without it.
- Keep `JWT_EXPIRES_IN_SECS` short-lived unless there is a strong operational reason to extend it.
- Configure either `API_AUTH_TOKEN` or `AUTH_BOOTSTRAP_SECRET` + `API_SERVICE_*` before starting the web app.
- In production, prefer `API_AUTH_TOKEN` or a real identity provider. Bootstrap token issuance stays disabled unless `ALLOW_BOOTSTRAP_TOKEN_ISSUANCE=true` is explicitly set.
- `NEXT_PUBLIC_API_AUTH_TOKEN` is no longer supported; interactive workspace mutations now proxy through the Next.js server.
- Run `pnpm db:migrate:deploy` before rolling out API or worker changes.
- Set `API_URL` and `NEXT_PUBLIC_API_URL` explicitly for deployed web environments.
- Set `CORS_ALLOWED_ORIGINS` explicitly if browsers are expected to call the API cross-origin; otherwise the API denies cross-origin browser access by default.

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

## Prisma workflow

### Local schema changes

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### CI / staging / production

```bash
pnpm db:validate
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:migrate:status
```

Use `db:migrate` only for local development when creating new migrations. Use
`db:migrate:deploy` everywhere else so committed migrations apply deterministically.

---

## Deployment and smoke-test checklist

### Local / fresh checkout

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm verify
pnpm smoke:production
```

### Docker / Compose

```bash
docker compose -f docker-compose.production-smoke.yml down -v
pnpm smoke:production
```

### Staging / production expectations

1. Build and publish the API, web, and worker images from `infra/docker/`.
2. Apply committed Prisma migrations with `pnpm db:migrate:deploy`.
3. Confirm `JWT_SECRET`, `API_URL`, `NEXT_PUBLIC_API_URL`, and either `API_AUTH_TOKEN` or `AUTH_BOOTSTRAP_SECRET` + `API_SERVICE_*` are set.
4. If `NODE_ENV=production`, keep `ALLOW_BOOTSTRAP_TOKEN_ISSUANCE=false` unless you intentionally need bootstrap token issuance in a tightly controlled deployment.
5. Smoke-test:
    - `GET /api/v1/health/live`
    - `GET /api/v1/health/ready`
    - `GET /api/v1/auth/me` with missing, invalid, expired, and valid auth
    - `GET /api/v1/projects` with a valid bearer token
    - Web homepage plus seeded project/twin routes render live project data
    - Web workspace proxy can persist `/api/workspace/:twinId/view-config`
    - Worker starts, reaches database readiness, and reports healthy

See `docs/release-checklist.md` for the concise release gate and deployment assumptions.
See `docs/release-notes/production-smoke-hardening.md` for rollout-focused notes, rollback guidance, and follow-up items.
See `docs/deployment-readiness.md` for the explicit env contract, staging verification workflow, migration order, rollback expectations, and operator troubleshooting.
See `docs/production-deploy-setup.md` for the exact GitHub environments, secrets, variables, image tags, and workflow order required before staging/production deployment.

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
4. **M4** -- JWT auth, RBAC enforcement, simulation orchestration (done)
5. **M5** -- Multi-tenant SaaS hardening, observability (done)
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
