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

# The only reason to build the uberjar is to get the duct_hierarhcy.edn file
# More info: https://github.com/duct-framework/duct/issues/102#issuecomment-555545655

lein do eastwood, eftest, uberjar

jar xf target/uberjar.jar duct_hierarchy.edn

lein with-profile metajar metajar

jar uf target/app.jar duct_hierarchy.edn
