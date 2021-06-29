#!/usr/bin/env bash
#shellcheck disable=SC2016

set -eu

docker-compose exec db \
	       psql \
	       --dbname=gpml \
	       --username=postgres \
	       --no-password \
	       --command "UPDATE stakeholder SET role='ADMIN', review_status='APPROVED' WHERE email='${1}'"
echo "Done"
