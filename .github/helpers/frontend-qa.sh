#!/usr/bin/env bash

set -Eeuxo pipefail

frontend_qa() {
  # Run QA using docker compose (no-deps to skip database)
  docker compose run \
    --rm \
    --no-deps \
    frontend \
    bash release.sh
}

frontend_qa
