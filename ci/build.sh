#!/usr/bin/env bash
#shellcheck disable=SC2039

set -Eeuxo pipefail

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
  docker compose --ansi never "$@"
}

export -f dc

dci () {
  dc -f docker-compose.yml -f docker-compose.ci.yml "$@"
}

export -f dci

backend_build () {
  dc run \
     --rm \
     backend \
     bash release.sh

  docker build \
         --quiet \
	       --tag "${image_prefix}/backend:latest" \
         --tag "${image_prefix}/backend:${CI_COMMIT}-staging" \
         --tag "${image_prefix}/backend:${CI_COMMIT}-prod" \
	       --tag "${image_prefix}/backend:${CI_COMMIT}" backend
}

frontend_build () {

  rm -rf frontend/.env
  echo 'REACT_APP_AUTH0_CLIENT_ID="dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J"' >> frontend/.env
  echo 'REACT_APP_AUTH0_DOMAIN="unep-gpml-test.eu.auth0.com"' >> frontend/.env
  echo 'NEXT_PUBLIC_CHAT_API_DOMAIN_URL="https://rocket-chat.akvotest.org"' >> frontend/.env
  echo 'NEXT_PUBLIC_ENV=test' >> frontend/.env
  echo 'NEXT_PUBLIC_DSC_URL="https://deadsimplechat.com"' >> frontend/.env
  echo 'NEXT_PUBLIC_DSC_API_URL="https://api.deadsimplechat.com"' >> frontend/.env
  echo 'NEXT_PUBLIC_DSC_PUBLIC_KEY="pub_42747a344c7475336e2d4f46624c3333494d68745a784c316d4150626c4c32714a5146494c6b4d44764a4556456f5847"' >> frontend/.env

  dc run \
     --rm \
     --no-deps \
     frontend \
     bash release.sh

  docker build \
         --quiet \
	       --tag "${image_prefix}/frontend:latest" \
	       --tag "${image_prefix}/frontend:${CI_COMMIT}" frontend
}

frontend_build_staging () {

  rm -rf frontend/.env
  echo 'REACT_APP_AUTH0_CLIENT_ID="dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J"' >> frontend/.env
  echo 'REACT_APP_AUTH0_DOMAIN="unep-gpml-test.eu.auth0.com"' >> frontend/.env
  echo 'NEXT_PUBLIC_CHAT_API_DOMAIN_URL="https://rocket-chat.akvotest.org"' >> frontend/.env
  echo 'NEXT_PUBLIC_ENV=staging' >> frontend/.env

  dc run \
     --rm \
     --no-deps \
     frontend \
     bash release.sh

  docker build \
         --quiet \
         --tag "${image_prefix}/frontend:${CI_COMMIT}-staging" frontend
}


nginx_build () {
  docker build \
         --quiet \
         --tag "${image_prefix}/nginx:latest" \
         --tag "${image_prefix}/nginx:${CI_COMMIT}-staging" \
         --tag "${image_prefix}/nginx:${CI_COMMIT}-prod" \
         --tag "${image_prefix}/nginx:${CI_COMMIT}" nginx
}

strapi_build () {
  docker build -f strapi/Dockerfile.prod \
         --quiet \
         --tag "${image_prefix}/strapi:latest" \
         --tag "${image_prefix}/strapi:${CI_COMMIT}-staging" \
         --tag "${image_prefix}/strapi:${CI_COMMIT}-prod" \
         --tag "${image_prefix}/strapi:${CI_COMMIT}" strapi
}


backend_build
docker stop unep-gpml-db-1

frontend_build
frontend_build_staging
strapi_build
nginx_build

docker start unep-gpml-db-1
if ! dci run --no-TTY ci ./basic.sh; then
  echo "Build failed when running basic.sh. Logs:"
  dci logs
  exit 1
fi
