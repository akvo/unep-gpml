#!/usr/bin/env bash
#shellcheck disable=SC1010

set -Eeuxo pipefail

# Same CI hardening as release.sh (see that file for the diagnosis):
# - Bound Aether/Wagon HTTP transport so a stalled Maven Central fetch
#   fails fast instead of hanging the runner.
# - Single-threaded connector + no connection reuse to avoid the
#   Apache HttpClient pool-lease deadlock.
# - Route Maven Central via Google's free mirror, since Azure runner
#   egress to repo1.maven.org is intermittently throttled / 429ed.
export LEIN_JVM_OPTS="${LEIN_JVM_OPTS:-} \
-Djava.net.preferIPv4Stack=true \
-Daether.connector.basic.threads=1 \
-Dmaven.artifact.threads=1 \
-Daether.connector.http.maxConnectionsPerRoute=1 \
-Daether.connector.http.reuseConnections=false \
-Daether.connector.connectTimeout=30000 \
-Daether.connector.requestTimeout=120000 \
-Daether.connector.http.connectionRequestTimeout=60000 \
-Daether.connector.http.retryHandler.count=5 \
-Dhttp.connection.timeout=30000 \
-Dhttp.socket.timeout=120000 \
-Dsun.net.client.defaultConnectTimeout=30000 \
-Dsun.net.client.defaultReadTimeout=120000"

export LEIN_HOME="${LEIN_HOME:-/tmp/lein-ci}"
mkdir -p "$LEIN_HOME" "$HOME/.lein"
__mirror_profiles='{:base {:mirrors {"central" {:name "Google Maven Central Mirror" :url "https://maven-central.storage-download.googleapis.com/maven2/" :repo-manager true}}}}'
printf '%s\n' "$__mirror_profiles" > "$LEIN_HOME/profiles.clj"
printf '%s\n' "$__mirror_profiles" > "$HOME/.lein/profiles.clj"

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
UBERJAR_IN_COURSE=true lein with-profile base,uberjar uberjar

jar tf target/uberjar/app.jar | grep --silent duct_hierarchy.edn || exit 1
jar tf target/uberjar/app.jar | grep --silent migrations/203-add-missing-on-delete-cascade-constraints.up.sql || exit 1
jar tf target/uberjar/app.jar | grep --silent gpml/db/action.sql || exit 1