#!/usr/bin/env bash

set -Eeuxo pipefail

backend_qa() {
  # Clean any existing build artifacts to avoid permission issues
  rm -rf backend/target
  rm -f backend/.eastwood

  # Run QA using docker compose (starts db automatically, uses compose volume mounts)
  docker compose run \
    --rm \
    backend \
    bash release.sh

  # Stop database container to clean up (match ci/build.sh pattern)
  docker stop unep-gpml-db-1 || true

  # Clean up files created by Docker (owned by root)
  rm -f backend/.eastwood
  rm -f backend/test-resources/local.edn
}

backend_qa
