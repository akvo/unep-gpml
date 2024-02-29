#!/usr/bin/env bash
#shellcheck disable=SC2039

set -Eeuxo pipefail
cd "${BASH_SOURCE%/*}"

yarn install --no-progress
yarn build
yarn start
