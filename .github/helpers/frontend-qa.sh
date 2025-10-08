#!/usr/bin/env bash

set -Eeuxo pipefail

frontend_qa() {
  # Start mainnetwork container (required for network_mode: service:mainnetwork)
  docker compose up -d mainnetwork

  # Run QA using docker compose (no-deps to skip database)
  docker compose run \
    --rm \
    --no-deps \
    frontend \
    bash release.sh

  # Stop mainnetwork container to clean up
  docker stop unep-gpml-mainnetwork-1 || true
}

frontend_qa
