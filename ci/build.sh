#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

CI_COMMIT="${SEMAPHORE_GIT_SHA:=local}"
CI_COMMIT="${CI_COMMIT:0:7}"
export CI_COMMIT

backend_image=$(awk '/akvo-clojure/ {print $2}' docker-compose.override.yml)
frontend_image=$(awk '/akvo-node/ {print $2}' docker-compose.override.yml)

lein_path="${HOME}/.lein"
m2_path="${HOME}/.m2"
image_prefix="eu.gcr.io/akvo-lumen/unep-gpml"

mkdir -p "${lein_path}"
mkdir -p "${m2_path}"

backend_build () {
    docker run \
	   --rm \
	   --volume "$(pwd)/backend:/app" \
	   --workdir /app \
	   borkdude/clj-kondo:2020.12.12 \
	   clj-kondo --lint src --lint test

    docker run \
	   --rm \
	   --volume "${lein_path}:/home/akvo/.lein" \
	   --volume "${m2_path}:/home/akvo/.m2" \
	   --volume "$(pwd)/backend:/app" \
	   "${backend_image}" \
	   bash release.sh

    docker build \
	   --tag "${image_prefix}/backend:latest" \
	   --tag "${image_prefix}/backend:${CI_COMMIT}" backend
}

frontend_build () {
    docker run \
	   --rm \
	   --volume "$(pwd)/frontend:/app" \
	   --workdir /app \
	   "${frontend_image}" \
	   bash release.sh

    docker build \
	   --tag "${image_prefix}/frontend:latest" \
	   --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend

}

backend_build
frontend_build

dci () {
    docker-compose \
	--no-ansi \
	-f docker-compose.yml \
	-f docker-compose.ci.yml "$@"
}

dci run ci ./basic.sh
