#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

wait4ports -q -t 60 tcp://frontend:80 tcp://backend:3000 tcp://db:5432

http_get() {
    curl --verbose --url "http://frontend/index.html" 2>&1 | grep "< HTTP.*200 OK"
}

http_get "http://frontend/index.html"
http_get "http://frontend/api/"
http_get "http://frontend/api/swagger.json"
http_get "http://frontend/api/docs/index.html"
http_get "http://frontend/api/country"
