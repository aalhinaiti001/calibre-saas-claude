#!/usr/bin/env bash
# Loads the schema into a fresh local Postgres database and runs the smoke test as a non-superuser role.
# Requires: a running Postgres 15+ and a superuser connection (default: the postgres user via peer auth).
# Usage: ./run-local.sh            # uses database "calibre"
#        PSQL="psql -h localhost -U postgres" ./run-local.sh
set -euo pipefail
cd "$(dirname "$0")"
PSQL="${PSQL:-psql}"
DB="${DB:-calibre}"
$PSQL -qc "drop database if exists $DB;" -c "create database $DB;"
$PSQL -v ON_ERROR_STOP=1 -q -d "$DB" -f auth-stub.sql
$PSQL -v ON_ERROR_STOP=1 -q -d "$DB" -f schema.sql
$PSQL -v ON_ERROR_STOP=1 -q -d "$DB" -c "grant usage on schema public, auth to app; grant all on all tables in schema public to app; grant all on all sequences in schema public to app; grant execute on all functions in schema public to app; grant execute on all functions in schema auth to app;"
$PSQL -v ON_ERROR_STOP=1 -d "$DB" -f smoke-test.sql
echo "smoke test passed"
