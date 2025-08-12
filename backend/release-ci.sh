#!/usr/bin/env bash
#shellcheck disable=SC1010

set -Eeuxo pipefail

find ./resources/migrations/ -name '*.up.sql' | \
  awk -F '/' '{print substr($4,1,3)}' | \
  sort --numeric-sort | \
  uniq --repeated > /tmp/duplicated

if [[ -s /tmp/duplicated  ]]; then
  echo "Error: Duplicated migration prefix"
  cat /tmp/duplicated
  exit 1
fi

# Skip tests and linting for CI build - only build the uberjar
lein clean
UBERJAR_IN_COURSE=true lein with-profile uberjar uberjar

jar tf target/uberjar/app.jar | grep --silent duct_hierarchy.edn || exit 1
jar tf target/uberjar/app.jar | grep --silent migrations/203-add-missing-on-delete-cascade-constraints.up.sql || exit 1
jar tf target/uberjar/app.jar | grep --silent gpml/db/action.sql || exit 1