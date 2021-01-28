#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

docker run \
       --rm \
       --volume "${HOME}/.config:/home/akvo/.config" \
       --volume "$(pwd):/app" \
       --interactive \
       --tty \
       akvo/akvo-devops:20201203.085214.79bec73 \
       promote-test-to-prod.sh unep-gpml unep-gpml-version unep-gpml zulip unep
