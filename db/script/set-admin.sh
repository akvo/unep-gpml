#!/usr/bin/env bash
#shellcheck disable=SC2016

set -eu

[[ ! -f "./docker-compose.yml" ]] && { echo "Execute ${0##*/} from project top folder"; exit 1; }

docker-compose exec db \
	       psql \
	       --dbname=gpml \
	       --username=postgres \
	       --no-password \
	       --command "UPDATE stakeholder SET role='ADMIN', review_status='APPROVED' WHERE email='${1}'"
echo "Done"
