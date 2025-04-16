#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

export NODE_OPTIONS="--max-old-space-size=3072"

yarn install --no-progress --frozen-lock
#yarn eslint src/
yarn build