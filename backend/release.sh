#!/usr/bin/env bash

set -euo pipefail


# The only reason to build the uberjar is to get the duct_hierarhcy.edn file
# More info: https://github.com/duct-framework/duct/issues/102#issuecomment-555545655

lein do eastwood, test, uberjar

jar xf target/uberjar.jar duct_hierarchy.edn

lein with-profile metajar metajar

jar uf target/app.jar duct_hierarchy.edn
