#!/usr/bin/env bash
#shellcheck disable=SC2039

set -eu

[[ ! -d "node_modules" ]] && yarn

yarn start
