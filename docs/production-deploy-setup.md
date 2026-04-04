# Production deploy setup

This repository deploys through GitHub Actions, GHCR image publishing, and a remote deploy hook.

## Current reality

A production deploy will **not** succeed until the GitHub repository has the required environments,
secrets, variables, and image pipeline in place.

## Required GitHub environments

Create these GitHub environments in the repository:

- `staging`
- `production`

## Required secrets

### Staging environment

- `DATABASE_URL`
- `STAGING_DEPLOY_HOOK_URL`
- `STAGING_API_AUTH_TOKEN` (optional if verifying with a pre-issued token)
- `STAGING_AUTH_BOOTSTRAP_SECRET` (required if verification uses bootstrap auth)
- `STAGING_API_SERVICE_USER_ID`
- `STAGING_API_SERVICE_EMAIL`
- `STAGING_API_SERVICE_ORGANIZATION_ID`
- `STAGING_API_SERVICE_ROLE`

### Production environment

- `DATABASE_URL`
- `PRODUCTION_DEPLOY_HOOK_URL`
- `AUTH_BOOTSTRAP_SECRET` (only if deployment verification uses bootstrap auth)

## Required variables

### Staging environment

- `DEPLOYMENT_VERIFY_API_URL`
- `DEPLOYMENT_VERIFY_WEB_URL`

### Production environment

- `DEPLOYMENT_VERIFY_API_URL`
- `DEPLOYMENT_VERIFY_WEB_URL`

## Required image pipeline

The deploy workflows expect prebuilt GHCR images with the same tag for:

- `ghcr.io/<owner>/naval-api:<tag>`
- `ghcr.io/<owner>/naval-web:<tag>`
- `ghcr.io/<owner>/naval-worker:<tag>`

Before running deploy workflows:

1. run the `Docker` workflow
2. confirm all three images exist in GHCR
3. use the same image tag in deploy workflows

## Recommended order

1. Merge to `main`
2. Run `Release Readiness`
3. Run `Docker` with a chosen image tag
4. Confirm GHCR images exist
5. Run `Deploy – Staging`
6. Run `Staging Verification`
7. Run `Deploy – Production`
8. Verify API, web, auth, and worker behavior

## Runtime config expectations

Production/staging runtimes must be compatible with these defaults:

- `ALLOW_BOOTSTRAP_TOKEN_ISSUANCE=false` unless intentionally required
- `JWT_EXPIRES_IN_SECS` defaults to 8 hours
- `CORS_ALLOWED_ORIGINS` must be explicitly set if direct browser cross-origin API access is required
- `/api/v1/workspace/*` endpoints now require authentication

## Go / no-go checks

Do **not** deploy if any of the following are missing:

- GitHub `staging` / `production` environments
- deploy hook secret for the target environment
- production/staging database secret
- published GHCR images for the selected tag
- deployment verification URLs for the target environment

## Notes

The deploy workflows now fail fast if the required deploy hook secret is missing. This is intentional.
It is safer to fail immediately than to silently report a partial deployment.
