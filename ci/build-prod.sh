#!/usr/bin/env bash
#shellcheck disable=SC2039

set -Eeuxo pipefail

[[ -z "${CI_TAG:=}" ]] && { echo "Skip build"; exit 0; }

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

frontend_build () {
  rm -rf frontend/.env
  echo 'REACT_APP_AUTH0_CLIENT_ID="mSuWoeUEN3Z8XWZMbUqiOIOHwdk0R6dm"' >> frontend/.env
  echo 'REACT_APP_AUTH0_DOMAIN="auth.gpmarinelitter.org"' >> frontend/.env
  echo 'NEXT_PUBLIC_CHAT_API_DOMAIN_URL="https://rocket-chat-unep.akvo.org"' >> frontend/.env
  echo 'NEXT_PUBLIC_ENV=prod' >> frontend/.env

  dc run \
     --rm \
     --no-deps \
     frontend \
     bash release.sh

  docker build \
	       --tag "${image_prefix}/frontend:latest-prod" \
	       --tag "${image_prefix}/frontend:${CI_COMMIT}-prod" frontend
}

frontend_build
