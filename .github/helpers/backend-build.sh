#!/usr/bin/env bash

set -Eeuxo pipefail

image_prefix="eu.gcr.io/akvo-lumen/unep-gpml-hpa"
image_version="${1}"
cluster_name="${2}"


backend_build () {

  # Clean any existing target directory to avoid permission issues
  rm -rf backend/target
  
  docker compose --ansi never run \
     --rm \
     backend \
     bash release.sh

  cd backend

  docker build \
         --quiet \
         --build-arg APP_VERSION=${image_version} \
         --tag "${image_prefix}/backend:latest-${cluster_name}" \
         --tag "${image_prefix}/backend:${image_version}" \
         -f Dockerfile-hpa .

  docker compose down
}

backend_build
