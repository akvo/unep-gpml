#!/usr/bin/env bash
#shellcheck disable=SC2039

set -exuo pipefail

backend_image=$(awk '/clojure/ {print $2}' docker-compose.yml)
lein_path="${HOME}/.lein"
m2_path="${HOME}/.m2"

mkdir -p "${lein_path}"
mkdir -p "${m2_path}"

docker run \
       --rm \
       --volume "${lein_path}:/home/akvo/.lein" \
       --volume "${m2_path}:/home/akvo/.m2" \
       --volume "$(pwd)/backend:/app" \
       "${backend_image}" \
       run-as-user.sh lein 'do' eastwood, test
