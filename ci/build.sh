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


nginx_build () {
    docker build \
           --tag "${image_prefix}/nginx:latest" \
           --tag "${image_prefix}/nginx:${CI_COMMIT}" nginx
}

strapi_build () {
    docker build -f strapi/Dockerfile.prod \
           --tag "${image_prefix}/strapi:latest" \
           --tag "${image_prefix}/strapi:${CI_COMMIT}" strapi
}


backend_build
frontend_build
strapi_build
nginx_build

if ! dci run -T ci ./basic.sh; then
  dci logs
  echo "Build failed when running basic.sh"
  exit 1
fi
