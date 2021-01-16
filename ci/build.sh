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

dc () {
    docker-compose \
	--no-ansi \
	"$@"
}
export -f dc

dci () {
    dc -f docker-compose.yml \
       -f docker-compose.ci.yml "$@"
}
export -f dci

backend_build () {
    docker run \
	   --rm \
	   --volume "$(pwd)/backend:/app" \
	   --workdir /app \
	   borkdude/clj-kondo:2020.12.12 \
	   clj-kondo --lint src --lint test

    dc run -T \
       --rm \
       backend \
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
dci run -T ci ./basic.sh
