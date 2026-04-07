#!/bin/sh
set -eu

service_name="${1:?service name is required}"

corepack enable >/dev/null 2>&1
pnpm config set store-dir /pnpm/store >/dev/null

if [ ! -d node_modules/.pnpm ]; then
  pnpm install --frozen-lockfile
fi

case "$service_name" in
  api)
    pnpm db:generate
    pnpm db:migrate:deploy
    pnpm db:seed
    exec pnpm --filter @naval/api start:dev
    ;;
  web)
    exec pnpm --filter @naval/web dev
    ;;
  worker)
    pnpm db:generate
    exec pnpm --filter @naval/worker dev
    ;;
  *)
    echo "Unknown service: $service_name" >&2
    exit 1
    ;;
esac
