#!/usr/bin/env bash
#shellcheck disable=SC2039

set -Eeuo pipefail

# Get Auth0 token for integration tests
get_token () {
  curl --silent \
    --data "client_id=dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J" \
    --data "username=${GPML_AUTH0_USER}" \
    --data "password=${GPML_AUTH0_PASSWORD}" \
    --data "grant_type=password" \
    --data "scope=openid email" \
    --data "connection=Username-Password-Authentication" \
    --url "https://unep-gpml-test.eu.auth0.com/oauth/token" \
  | jq -r -M '.id_token'
}

# HTTP test helper - checks if response contains expected status code
http_get() {
  url="${1}"
  shift
  code="${1}"
  shift
  curl --verbose --url "${url}" "$@" 2>&1 | grep "< HTTP.*${code}"
}

export -f get_token
export -f http_get
