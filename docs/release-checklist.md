# Release candidate checklist

## Release gate

Run the reusable gate or equivalent local commands before promotion:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm test
pnpm verify
pnpm smoke:startup
pnpm smoke:production
```

## Runtime assumptions

- API:
  - `DATABASE_URL` uses `postgresql://` or `postgres://`
  - `JWT_SECRET` is set and at least 32 characters
  - `AUTH_BOOTSTRAP_SECRET` is at least 8 characters when used
  - `ALLOW_BOOTSTRAP_TOKEN_ISSUANCE` remains `false` in production unless explicitly required for a tightly controlled deployment
- Web:
  - `API_URL` is the server-side/internal API address
  - `NEXT_PUBLIC_API_URL` is browser-reachable and not a container-only hostname
  - set either `API_AUTH_TOKEN` or the full `AUTH_BOOTSTRAP_SECRET` + `API_SERVICE_*` set
- Worker:
  - `DATABASE_URL` matches the migrated API database
  - `WORKER_READY_FILE` is absolute when configured for container health checks

## Smoke expectations

- Built artifacts:
  - API answers `/api/v1/health/ready`
  - web answers `/api/health/ready`
  - worker writes its ready file and logs DB readiness
- Containers:
  - API answers `/api/v1/health/live` and `/api/v1/health/ready`
  - web answers `/api/health/live` and `/api/health/ready`
  - worker reaches healthy state in Compose/platform health checks

## Promotion checklist

1. Build/publish API, web, and worker images from `infra/docker/`.
2. Apply `pnpm db:migrate:deploy`.
3. Confirm `pnpm db:migrate:status` is clean.
4. Roll API and worker first, then roll web with final API URLs/auth config.
5. Confirm auth bootstrap or token-based access works with `/api/v1/auth/me`.
6. Confirm `/api/v1/workspace/:twinId` requires authentication in non-demo deployments.
7. Archive startup-smoke and production-smoke artifacts with the release record.

## Residual risks

- Worker readiness is still file/log based unless the deployment platform exposes it separately.
- There is no broader application test suite beyond runtime contract tests and smoke verification.
