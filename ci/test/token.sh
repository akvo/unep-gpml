#!/usr/bin/env bash
#shellcheck disable=SC2039

set -euo pipefail

get_token () {
    curl --silent \
	 --data "client_id=dxfYNPO4D9ovQr5NHFkOU3jwJzXhcq5J" \
	 --data "username=${AUTH0_USER}" \
	 --data "password=${AUTH0_PASSWORD}" \
	 --data "grant_type=password" \
	 --data "scope=openid email" \
	 --data "connection=Username-Password-Authentication" \
	 --url "https://unep-gpml-test.eu.auth0.com/oauth/token" \
	 | jq -r -M '.id_token'
}

get_token
