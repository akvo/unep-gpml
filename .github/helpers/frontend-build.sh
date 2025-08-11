#!/usr/bin/env bash

set -Eeuxo pipefail

image_prefix="eu.gcr.io/akvo-lumen/unep-gpml-hpa"
image_version="${1}"
cluster_name="${2}"


frontend_build () {

  rm -rf frontend/.env
  echo 'REACT_APP_AUTH0_CLIENT_ID="dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J"' >> frontend/.env
  echo 'REACT_APP_AUTH0_DOMAIN="unep-gpml-test.eu.auth0.com"' >> frontend/.env
  echo 'NEXT_PUBLIC_CHAT_API_DOMAIN_URL="https://rocket-chat.akvotest.org"' >> frontend/.env
  echo 'NEXT_PUBLIC_ENV=test' >> frontend/.env
  echo 'NEXT_PUBLIC_DSC_URL="https://deadsimplechat.com"' >> frontend/.env
  echo 'NEXT_PUBLIC_DSC_API_URL="https://api.deadsimplechat.com"' >> frontend/.env
  echo 'NEXT_PUBLIC_DSC_PUBLIC_KEY="pub_42747a344c7475336e2d4f46624c3333494d68745a784c316d4150626c4c32714a5146494c6b4d44764a4556456f5847"' >> frontend/.env

  docker compose --ansi never run \
     --rm \
     --no-deps \
     frontend \
     bash release.sh

  docker build \
         --quiet \
         --tag "${image_prefix}/frontend:latest-${cluster_name}" \
         --tag "${image_prefix}/frontend:${image_version}" frontend

  docker compose down
}

frontend_build
