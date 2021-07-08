#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

[[ -n "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

CI_COMMIT="${SEMAPHORE_GIT_SHA:=local}"
CI_COMMIT="${CI_COMMIT:0:7}"
export CI_COMMIT

lein_path="${HOME}/.lein"
m2_path="${HOME}/.m2"
image_prefix="eu.gcr.io/akvo-lumen/unep-gpml"

mkdir -p "${lein_path}"
mkdir -p "${m2_path}"

dc () {
    docker-compose \
	--ansi never \
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
	   cljkondo/clj-kondo:2021.06.18-alpine \
	   clj-kondo --lint src --lint test

    dc run \
       --rm \
       backend \
       bash release.sh

    docker build \
	   --tag "${image_prefix}/backend:latest" \
	   --tag "${image_prefix}/backend:${CI_COMMIT}" backend
}

frontend_build () {
    dc run \
       --rm \
       --no-deps \
       frontend \
       bash release.sh

    docker build \
	   --tag "${image_prefix}/frontend:latest" \
	   --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend
}

if [ "${1:-}" == "backend" ];
then
    backend_build
elif [ "${1:-}" == "frontend" ]
then
    frontend_build
else
    echo "Pass an argument 'backend' or 'frontend' to $0"
    exit 1
fi

if ! dci run -T ci ./basic.sh; then
  dci logs
  echo "Build failed when running basic.sh"
  exit 1
fi
