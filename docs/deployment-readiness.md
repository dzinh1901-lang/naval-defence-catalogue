# Deployment readiness and release verification

## Deployment prerequisites

- Node.js 20.x with Corepack-enabled pnpm 10.4.1 for local/operator runs.
- Docker with Compose for `pnpm smoke:production` and local release rehearsal.
- PostgreSQL 16 with the `vector` extension available (`pgvector/pgvector:pg16` in local CI/smoke).
- A release candidate branch/commit that has passed:
  - `pnpm verify`
  - `pnpm smoke:production`
  - `.github/workflows/release-readiness.yml` if you want a single reusable release gate.

## Runtime env contract

### API

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Must be a valid `postgresql://` or `postgres://` URL. Required before API boot. |
| `JWT_SECRET` | Yes | Minimum 32 characters. API refuses to boot without it. |
| `PORT` | Optional | Must be an integer between 1 and 65535. Defaults to `4000`. |
| `AUTH_BOOTSTRAP_SECRET` | Conditional | Minimum 8 characters when set. Required only if the web runtime bootstraps its own API token. |
| `NODE_ENV` | Recommended | Set `production` in deployed environments for predictable logging/runtime behaviour. |

### Web

| Variable | Required | Notes |
| --- | --- | --- |
| `API_URL` | Yes | Server-side API base URL. Must be a valid absolute `http(s)` URL and should point at the internal API address. |
| `NEXT_PUBLIC_API_URL` | Yes | Browser-visible API base URL. Must be a valid absolute `http(s)` URL. |
| `API_AUTH_TOKEN` | Conditional | Pre-issued server-side bearer token for protected API access. |
| `AUTH_BOOTSTRAP_SECRET` | Conditional | Required with `API_SERVICE_*` when `API_AUTH_TOKEN` is not provided. |
| `API_SERVICE_USER_ID` | Conditional | Required with bootstrap auth. |
| `API_SERVICE_EMAIL` | Conditional | Required with bootstrap auth. |
| `API_SERVICE_ORGANIZATION_ID` | Conditional | Required with bootstrap auth. |
| `API_SERVICE_ROLE` | Conditional | Required with bootstrap auth. Must be `ADMIN`, `MEMBER`, or `VIEWER`. |
| `NEXT_PUBLIC_API_AUTH_TOKEN` | No | Unsupported. Startup fails if it is set. |

### Worker

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Must be a valid `postgresql://` or `postgres://` URL. |
| `WORKER_READY_FILE` | Optional | File touched after DB readiness for container health checks. |
| `NODE_ENV` | Recommended | Set `production` for deployment runs. |

### Auth callback / identity expectations

- The current production path does **not** use an external OIDC/OAuth callback URL.
- Authenticated release verification relies on either:
  - `API_AUTH_TOKEN`, or
  - `AUTH_BOOTSTRAP_SECRET` + `API_SERVICE_*`.
- If a real identity provider is introduced later, callback URL registration becomes a new deployment prerequisite and should be added to this contract before rollout.

## Deployment-safe migration order

1. Build and publish the candidate images/artifacts.
2. Apply committed Prisma migrations with `pnpm db:migrate:deploy`.
3. Run `pnpm db:migrate:status` against the target database.
4. Start or roll the API and worker using the migrated schema.
5. Start or roll the web app with the final API URLs/auth settings.
6. Run staging or production verification before promotion/traffic cutover.

### Failure modes

- `db:migrate:deploy` fails:
  - stop rollout
  - do not continue starting new API/worker instances against a partially migrated target
  - inspect Prisma output and database locks before retrying
- `db:migrate:status` reports drift/pending work after deploy:
  - treat the release as not ready
  - resolve the schema state before promotion
- API or worker boots fail after migrations:
  - inspect startup logs first for `DATABASE_URL`, `JWT_SECRET`, `AUTH_BOOTSTRAP_SECRET`, and readiness output
  - verify `/api/v1/health/ready` before continuing rollout

### Rollback expectations

- Prisma migrations are forward-only; assume schema changes are **not automatically reversible**.
- Roll back application images independently from the database when possible.
- For releases with destructive schema changes, take a database backup/snapshot before running `db:migrate:deploy`.
- If a migration must be undone, use a manual database restore or a new corrective migration; do not rely on `prisma migrate reset` outside disposable environments.

## Repeatable verification paths

### Production-like local/staging-equivalent verification

Use this when you want the full built-image rehearsal, including worker startup:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm smoke:production
```

What it verifies:

- API build + production startup
- web build + production startup
- worker startup and DB readiness logs
- API liveness/readiness endpoints
- Prisma migration deploy/status + seed path
- authenticated API token issuance and `/auth/me`
- API project/workspace reads
- web project/twin routes
- authenticated web proxy mutation for workspace view config
- failure artifacts under `artifacts/production-smoke/`

### Deployed staging or production verification

Use `.github/workflows/staging-verification.yml` or run the script locally:

```bash
DEPLOYMENT_VERIFY_API_URL=https://staging-api.example.com \
DEPLOYMENT_VERIFY_WEB_URL=https://staging.example.com \
AUTH_BOOTSTRAP_SECRET=... \
API_SERVICE_USER_ID=... \
API_SERVICE_EMAIL=... \
API_SERVICE_ORGANIZATION_ID=... \
API_SERVICE_ROLE=ADMIN \
pnpm verify:deployment
```

Optional:

- set `DEPLOYMENT_VERIFY_API_AUTH_TOKEN` if you want to verify with a pre-issued token instead of bootstrap auth
- set `DEPLOYMENT_VERIFY_WORKER_HEALTH_URL` if your platform exposes a worker health endpoint

What it verifies:

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- web root render
- authenticated `/api/v1/auth/me`
- authenticated `/api/v1/projects`
- data-backed `/api/v1/projects/:id`
- data-backed `/api/v1/workspace/:twinId`
- authenticated web proxy mutation via `/api/workspace/:twinId/view-config`
- web project/twin routes
- captured HTTP artifacts under `artifacts/deployment-verification/`

### Operator checklist for worker verification

The worker does not currently expose a first-party HTTP readiness endpoint. For staging/production rollouts:

1. confirm the worker deployment/container is marked healthy by the platform
2. inspect startup logs for:
   - `Startup checks passed`
   - `Database connection OK`
   - `Ready`
3. confirm the worker is pointing at the same migrated database as the API

## CI/CD release gating

- `.github/workflows/release-readiness.yml` is a deterministic reusable gate that runs:
  - `pnpm verify`
  - `pnpm smoke:production`
- future deploy workflows should call `release-readiness.yml` before promotion so deployment depends on smoke success and validated image builds
- `.github/workflows/staging-verification.yml` is an operator-triggered post-deploy verifier for remote staging
- keep both workflows non-interactive; all required credentials should be injected through GitHub secrets

## Startup diagnostics and where to look first

### API

- startup logs now emit:
  - sanitized database target
  - configured port
  - bootstrap-auth enabled/disabled
  - live/ready endpoint paths
- operator-first checks:
  1. process/container logs
  2. `GET /api/v1/health/live`
  3. `GET /api/v1/health/ready`

### Web

- startup logs emit:
  - `API_URL`
  - `NEXT_PUBLIC_API_URL`
  - auth mode (`token` vs `bootstrap`)
- if page rendering fails, check web startup logs before investigating browser errors because all protected API calls originate server-side

### Worker

- startup logs emit:
  - sanitized database target
  - ready-file path
  - DB readiness confirmation
- if the worker is unhealthy, inspect worker logs before API logs unless `/api/v1/health/ready` is already degraded

## Production verification checklist

1. confirm migrations applied successfully
2. confirm `/api/v1/health/live` returns `200`
3. confirm `/api/v1/health/ready` returns `200`
4. confirm an authenticated `/api/v1/auth/me` succeeds
5. confirm at least one project route and one twin/workspace route render live data
6. confirm worker health/log readiness
7. archive verification artifacts or workflow logs with the release record

## Remaining risks / follow-ups

- The worker still relies on log-based verification unless the deployment platform exposes a worker health URL.
- The repo has no dedicated unit/integration suite beyond lint/typecheck/build/smoke/deployment verification.
- Introducing a real identity provider will require callback URL registration and a new release validation step.
