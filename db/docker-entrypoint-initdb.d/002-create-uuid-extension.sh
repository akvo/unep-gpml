#!/usr/bin/env bash

set -eu

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname="${APP_DB_NAME}" <<-EOSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
EOSQL

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname="${APP_TEST_DB_NAME}" <<-EOSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
EOSQL
