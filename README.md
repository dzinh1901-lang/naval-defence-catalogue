# Naval Defence Digital Twin Platform

A production-oriented web application foundation for naval defence design and engineering workflows.

This repository is being evolved from a catalogue-style experience into a modular digital twin platform that supports:

- system design definition
- subsystem modelling
- requirements traceability
- configuration and variant management
- simulation orchestration
- engineering review workflows
- evidence capture and digital thread provenance
- SaaS-ready multi-tenant deployment

## Monorepo structure

```text
apps/
  web/        Next.js frontend for engineering workspaces and review dashboards
  api/        NestJS backend API for projects, twins, requirements, reviews, and simulations
packages/
  domain/     Shared domain types and business rules
  config/     Shared TypeScript, lint, and tooling configuration
  ui/         Shared UI components for traceability and engineering workflows
  database/   Prisma schema, migrations, seed data
infra/
  docker/     Container assets
  k8s/        Kubernetes manifests (future-ready baseline)
docs/
  architecture/
  product/
  operations/
.github/workflows/
```

## Target architecture

- **Frontend:** Next.js 15 + TypeScript + App Router
- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL + Prisma
- **Auth:** OIDC/SAML-ready architecture with RBAC
- **Search:** PostgreSQL full-text initially, OpenSearch later for evidence/simulation indexing
- **Infra:** Docker Compose for local development, GitHub Actions for CI, Kubernetes-ready deployment path

## Core domain model

The first implementation pass includes these core entities:

- Project
- DigitalTwin
- Subsystem
- Requirement
- Interface
- Simulation
- Variant
- Review
- Evidence
- User / Role / Organization

See [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md) and [`docs/product/domain-model.md`](docs/product/domain-model.md).

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop or Docker Engine

### Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

### Services

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

## Delivery phases

1. Foundation monorepo and domain model
2. Core project/twin/requirement/review workflows
3. Variant management and evidence chain
4. Simulation orchestration and result ingestion
5. Multi-tenant SaaS hardening and observability

## Repository status

This scaffold is the starting point for transforming the repository from a static catalogue into an engineering-grade collaborative platform.
