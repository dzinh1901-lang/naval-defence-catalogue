# Production smoke hardening

## Summary of changes

- Added a deterministic `pnpm smoke:production` path that validates Prisma, production builds, Docker images, runtime startup, health, auth, and core routes from a clean environment.
- Added fail-fast production start wrappers for API, web, and worker so missing env vars or missing compiled entrypoints stop startup immediately with explicit errors.
- Removed hardcoded auth token fallbacks from runtime code and moved interactive workspace mutations behind a server-side Next.js proxy.

## Risks removed

- Production startup no longer depends on watch mode, source mounts, or implicit local auth defaults.
- The web app no longer needs a browser-exposed API bearer token for workspace mutations.
- Worker readiness is now explicit via a startup-ready file and Docker healthcheck.

## Required env/config changes

- `JWT_SECRET` is now required everywhere the API starts and must be at least 32 characters.
- The web app must have either:
  - `API_AUTH_TOKEN`, or
  - `AUTH_BOOTSTRAP_SECRET` plus `API_SERVICE_USER_ID`, `API_SERVICE_EMAIL`, `API_SERVICE_ORGANIZATION_ID`, and `API_SERVICE_ROLE`.
- `NEXT_PUBLIC_API_AUTH_TOKEN` is no longer supported.

## Deployment considerations

- Run `pnpm smoke:production` before promotion when validating a merged branch locally.
- The production smoke workflow builds `infra/docker/Dockerfile.api`, `infra/docker/Dockerfile.web`, and `infra/docker/Dockerfile.worker`, seeds PostgreSQL, and exercises runtime auth + route checks on the built images.
- Web production images now rely on Next.js standalone output.

## Rollback notes

- Roll back by restoring the prior release image set and reverting the new env requirements if bootstrap-based web auth is not yet configured.
- If the smoke workflow fails after rollout prep, inspect the uploaded `production-smoke-artifacts` bundle before retrying deployment.

## Remaining follow-up items

- The repository still has no dedicated unit/integration test suite beyond the production smoke pipeline and existing lint/typecheck/build checks.
- If a non-bootstrap identity provider is introduced later, the web server-side token bootstrap path can be swapped behind the same env contract.
