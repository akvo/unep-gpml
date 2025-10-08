#!/usr/bin/env bash

set -Eeuo pipefail

# Wait for services to be ready (using wait4ports installed by entrypoint.sh)
wait4ports -q -s 1 -t 300 tcp://localhost:80 tcp://localhost:3000 tcp://db:5432

# Run HTTP endpoint tests
http_get "http://localhost/index.html" 200
http_get "http://localhost/api/swagger.json" 200
http_get "http://localhost/api/docs/index.html" 200
http_get "http://localhost/api/country" 200

# Authentication tests
token=$(get_token)

# Verify token was retrieved
if [[ -z "${token}" || "${token}" == "null" ]]; then
  echo "ERROR: Failed to retrieve Auth0 token"
  exit 1
fi

http_get "http://localhost/api/profile" 401
http_get "http://localhost/api/profile" 403 --header "Authorization: Bearer"
http_get "http://localhost/api/profile" 403 --header "Authorization: Bearer foo"
http_get "http://localhost/api/profile" 200 --header "Authorization: Bearer ${token}"

echo "All integration tests passed!"
