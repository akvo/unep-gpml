#!/usr/bin/env bash
#shellcheck disable=SC1010

set -euo pipefail

find ./resources/migrations/ -name '*.up.sql' | \
  awk -F '/' '{print substr($4,1,3)}' | \
  sort --numeric-sort | \
  uniq --repeated > /tmp/duplicated

if [[ -s /tmp/duplicated  ]]; then
  echo "Error: Duplicated migration prefix"
  cat /tmp/duplicated
  exit 1
fi

make lint test uberjar

jar tf target/app.jar | grep --silent duct_hierarchy.edn || exit 1
jar tf target/app.jar | grep --silent migrations/203-add-missing-on-delete-cascade-constraints.up.sql || exit 1
jar tf target/app.jar | grep --silent gpml/db/action.sql || exit 1
