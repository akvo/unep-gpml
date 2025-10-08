#!/usr/bin/env bash

set -Eeuxo pipefail

backend_qa() {
  # Create Maven and Lein directories to avoid permission issues
  mkdir -p "${HOME}/.m2"
  mkdir -p "${HOME}/.lein"

  # Clean up any stale lock files from cached dependencies
  find "${HOME}/.m2" -name "*.part.lock" -delete 2>/dev/null || true
  find "${HOME}/.lein" -name "*.part.lock" -delete 2>/dev/null || true

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
