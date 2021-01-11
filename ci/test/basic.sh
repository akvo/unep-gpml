#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

wait4ports -q -t 60 tcp://localhost:80 tcp://localhost:3000 tcp://db:5432

http_get() {
    curl --verbose --url "${1}" 2>&1 | grep "< HTTP.*200 OK"
}

http_get "http://localhost/index.html"
http_get "http://localhost/api/swagger.json"
http_get "http://localhost/api/docs/index.html"
http_get "http://localhost/api/country"
