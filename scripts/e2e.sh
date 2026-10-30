#!/usr/bin/env bash
# Smoke tests against a throw-away database on the docker-compose services (Postgres + MinIO).
# Usage: pnpm test:e2e
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose up -d db s3
until docker compose exec -T db pg_isready -U photographers >/dev/null 2>&1; do sleep 1; done
docker compose run --rm s3-init >/dev/null

psql_db() { docker compose exec -T db psql -v ON_ERROR_STOP=1 -U photographers -d postgres -c "$1" >/dev/null; }
psql_db 'DROP DATABASE IF EXISTS e2e WITH (FORCE)'
psql_db 'CREATE DATABASE e2e'

export DATABASE_URL=postgres://photographers:photographers@localhost:5433/e2e
export PAYLOAD_SECRET=e2e-only-secret-0123456789abcdef
export NEXT_PUBLIC_SITE_URL=http://localhost:3100
export S3_ENDPOINT=http://localhost:9100
export S3_REGION=us-east-1
export S3_ACCESS_KEY_ID=minioadmin
export S3_SECRET_ACCESS_KEY=minioadmin
export S3_PUBLIC_BUCKET=photos-public
export S3_PRIVATE_BUCKET=photos-private
export S3_PUBLIC_URL=http://localhost:9100/photos-public
export S3_FORCE_PATH_STYLE=true
# The attempt limits are off without Upstash credentials (they would also block repeated logins).
unset UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN

pnpm payload migrate
pnpm build
pnpm exec playwright test "$@"
