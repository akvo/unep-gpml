#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

yarn install --no-progress --frozen-lock
#yarn eslint src/
yarn build