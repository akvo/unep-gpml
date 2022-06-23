#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

wait4ports -q -s 1 -t 120 tcp://localhost:80 tcp://localhost:3000 tcp://db:5432

http_get() {
    url="${1}"
    shift
    code="${1}"
    shift
    curl --verbose --url "${url}" "$@" 2>&1 | grep "< HTTP.*${code}"
}

http_get "http://localhost/index.html" 200
http_get "http://localhost/api/swagger.json" 200
http_get "http://localhost/api/docs/index.html" 200
http_get "http://localhost/api/country" 200

# Authentication
source ./token.sh
token=$(get_token)

http_get "http://localhost/api/profile" 401
http_get "http://localhost/api/profile" 403 --header "Authorization: Bearer"
http_get "http://localhost/api/profile" 403 --header "Authorization: Bearer foo"
http_get "http://localhost/api/profile" 200 --header "Authorization: Bearer ${token}"
