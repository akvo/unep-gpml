#!/usr/bin/env bash
#shellcheck disable=SC2016

set -eu

docker-compose exec -T db bash -c 'pg_dump --user unep --clean --create --format plain gpml > /docker-entrypoint-initdb.d/001-init.sql; echo "Export done"'
