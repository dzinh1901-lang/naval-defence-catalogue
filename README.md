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

k8s/
  base/       Base Kubernetes manifests (namespace, postgres, api, web, worker)
  overlays/
    staging/      Staging environment overrides (1 replica, staging hostname)
    production/   Production environment overrides (3 replicas, HA limits)

legacy/       Original Vite/React naval catalogue — preserved as reference

docs/
  architecture/  System design and migration documentation

.github/
  workflows/  GitHub Actions CI/CD (ci, docker build/push, deploy staging/production)
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

## Kubernetes deployment (Milestone 6)

Production Kubernetes manifests live under `k8s/` and are managed with **Kustomize**:

```
k8s/
  base/               Base manifests (namespace, configmap, postgres, api, web, worker)
  overlays/
    staging/          Staging overrides (1 replica, staging hostname, smaller PVC)
    production/       Production overrides (3 replicas, prod hostname, larger PVC, HA limits)
```

### Deploy to staging

```bash
kubectl apply -k k8s/overlays/staging
```

### Deploy to production

```bash
kubectl apply -k k8s/overlays/production
```

### Secrets

Kubernetes Secrets are **not** committed to source control. Apply them separately:

```bash
kubectl create secret generic naval-dt-secrets \
  --namespace=naval-dt-staging \
  --from-literal=DATABASE_URL='postgresql://naval:<password>@postgres:5432/naval_dt' \
  --from-literal=JWT_SECRET='<min-32-char-random-secret>' \
  --from-literal=POSTGRES_PASSWORD='<db-password>' \
  --dry-run=client -o yaml | kubectl apply -f -
```

### CI/CD pipelines

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push / PR | Install, type-check, build, Prisma validate |
| `docker.yml` | Push to `main` or version tags | Build & push Docker images to GHCR |
| `deploy-staging.yml` | After `docker.yml` succeeds on `main` | Deploy to staging namespace |
| `deploy-production.yml` | GitHub Release published or manual | Deploy to production namespace |

Docker images are published to GitHub Container Registry (GHCR):

```
ghcr.io/dzinh1901-lang/naval-defence-catalogue/api:<tag>
ghcr.io/dzinh1901-lang/naval-defence-catalogue/web:<tag>
ghcr.io/dzinh1901-lang/naval-defence-catalogue/worker:<tag>
```

---

## Delivery phases

1. **M1** -- Foundation: monorepo, schema v1, workspace shell, API baseline (done)
2. **M2** -- Auth foundation, project membership, live API vertical slice (done)
3. **M3** -- Variant management UI, review workflows, live counts (done)
4. **M4** -- JWT auth, RBAC enforcement, simulation orchestration (done)
5. **M5** -- Multi-tenant SaaS hardening, observability (done)
6. **M6** -- Kubernetes deployment, staging/production CI/CD (done)

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
| Kubernetes  | Kustomize overlays (staging/production) |
