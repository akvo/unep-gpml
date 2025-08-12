#!/usr/bin/env bash

set -Eeuxo pipefail

image_prefix="eu.gcr.io/akvo-lumen/unep-gpml-hpa"
image_version="${1}"
cluster_name="${2}"


backend_build () {

  # Clean any existing target directory to avoid permission issues
  rm -rf backend/target

  # Create cache directories if they don't exist
  mkdir -p "$HOME/.m2" "$HOME/.lein"

  docker run \
     --rm \
     --env-file .env \
     -v "$(pwd)/backend:/app" \
     -v "$HOME/.m2:/root/.m2" \
     -v "$HOME/.lein:/root/.lein" \
     -w /app \
     akvo/akvo-clojure-lein:20210124.114043.4437caf \
     bash release-ci.sh

  cd backend

  docker build \
         --quiet \
         --build-arg APP_VERSION=${image_version} \
         --tag "${image_prefix}/backend:latest-${cluster_name}" \
         --tag "${image_prefix}/backend:${image_version}" \
         -f Dockerfile-hpa .

}

backend_build
