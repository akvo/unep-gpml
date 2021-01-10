#!/bin/sh

set -ex

apk add \
    --no-cache \
    --no-progress \
    bash~=5 \
    curl~=7 \
    wait4ports=~0.3

exec "$@"
