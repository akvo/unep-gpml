#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

backend_image=$(awk '/akvo-clojure/ {print $2}' docker-compose.yml)
frontend_image=$(awk '/akvo-node/ {print $2}' docker-compose.yml)

lein_path="${HOME}/.lein"
m2_path="${HOME}/.m2"

mkdir -p "${lein_path}"
mkdir -p "${m2_path}"

backend_build() {
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
	   lein 'do' eastwood, test
}

frontend_build() {
    docker run \
	   --rm \
	   --volume "$(pwd)/frontend:/app" \
	   --workdir /app \
	   "${frontend_image}" \
	   bash -c 'yarn install --no-progress --production=true --frozen-lock && yarn build'

}

backend_build
frontend_build
