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

k8s/
  base/             Base Kubernetes manifests (Kustomize)
  overlays/
    staging/        Staging environment overrides
    production/     Production environment overrides

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
| Kubernetes            | Kustomize overlays     | Staging/production environment parity  |
| Container registry    | GHCR                   | Native GitHub integration, free for public repos |

## Infrastructure (local development)

```
localhost:3000  → apps/web  (Next.js dev server)
localhost:4000  → apps/api  (NestJS dev server)
localhost:5432  → PostgreSQL (Docker)
```

## Infrastructure (Kubernetes — Milestone 6)

Production and staging deployments use Kubernetes with Kustomize overlays:

```
k8s/
  base/
    namespace.yaml          naval-dt namespace
    configmap.yaml          Non-sensitive env configuration
    secret.yaml             Secret template (not committed with real values)
    postgres/
      pvc.yaml              10 Gi PersistentVolumeClaim for database data
      deployment.yaml       PostgreSQL 16 single-instance deployment
      service.yaml          ClusterIP service on port 5432
    api/
      deployment.yaml       NestJS API (2 replicas, health checks, resource limits)
      service.yaml          ClusterIP service on port 4000
    web/
      deployment.yaml       Next.js web (2 replicas, health checks, resource limits)
      service.yaml          ClusterIP service on port 3000
      ingress.yaml          nginx Ingress routing /api → api, / → web
    worker/
      deployment.yaml       Background worker (1 replica)
    kustomization.yaml      Base Kustomize manifest list
  overlays/
    staging/
      kustomization.yaml    1 replica, staging hostname, 5 Gi PVC, :staging image tag
    production/
      kustomization.yaml    3 replicas, prod hostname, 50 Gi PVC, HA resource limits
```

### CI/CD pipeline (M6)

```
Push to main ──► docker.yml ──► build & push images to GHCR
                    │
                    └──► deploy-staging.yml ──► kubectl apply -k k8s/overlays/staging
                                                wait for rollout + smoke test

GitHub Release ──► deploy-production.yml ──► kubectl apply -k k8s/overlays/production
                                              wait for rollout + smoke test
```

## Future milestones

| Milestone | Focus                                           |
|-----------|-------------------------------------------------|
| M1        | Foundation, monorepo, schema, workspace shell   |
| M2        | Auth (JWT/OAuth), full CRUD, live API in web    |
| M3        | Variant management, evidence chain              |
| M4        | Simulation orchestration, result ingestion      |
| M5        | Multi-tenant SaaS hardening, observability      |
| M6        | Kubernetes deployment, staging/production CI/CD |

All milestones M1–M6 are complete.
