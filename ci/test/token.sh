#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

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
export -f get_token
