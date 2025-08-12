#!/usr/bin/env bash

set -Eeuxo pipefail

image_prefix="eu.gcr.io/akvo-lumen/unep-gpml-hpa"
image_version="${1}"
cluster_name="${2}"


backend_build () {

  # Clean any existing target directory to avoid permission issues
  rm -rf backend/target
  
  docker run \
     --rm \
     --env-file .env \
     -v "$(pwd)/backend:/app" \
     -v ~/.m2:/home/akvo/.m2 \
     -v ~/.lein:/home/akvo/.lein \
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
