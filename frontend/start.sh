#!/usr/bin/env bash
#shellcheck disable=SC2039

set -eu

yarn install --no-progress
yarn build
yarn start
