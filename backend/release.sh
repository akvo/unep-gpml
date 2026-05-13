#!/usr/bin/env bash
#shellcheck disable=SC1010

set -Eeuxo pipefail

# Fail fast on stalled Maven Central / Clojars sockets instead of hanging
# indefinitely. Lein's default Aether/Wagon transport has no socket timeout,
# so a half-open TCP connection during dep resolution can freeze the JVM for
# the runner's entire 6h timeout window.
export LEIN_JVM_OPTS="${LEIN_JVM_OPTS:-} \
-Djava.net.preferIPv4Stack=true \
-Daether.connector.threads=1 \
-Daether.connector.http.reuseConnections=false \
-Daether.connector.connectTimeout=30000 \
-Daether.connector.requestTimeout=120000 \
-Daether.connector.http.connectionRequestTimeout=60000 \
-Daether.connector.http.retryHandler.count=5 \
-Dhttp.connection.timeout=30000 \
-Dhttp.socket.timeout=120000 \
-Dsun.net.client.defaultConnectTimeout=30000 \
-Dsun.net.client.defaultReadTimeout=120000"

find ./resources/migrations/ -name '*.up.sql' | \
  awk -F '/' '{print substr($4,1,3)}' | \
  sort --numeric-sort | \
  uniq --repeated > /tmp/duplicated

if [[ -s /tmp/duplicated  ]]; then
  echo "Error: Duplicated migration prefix"
  cat /tmp/duplicated
  exit 1
fi

# `make` isn't available in the Docker images atm - disable for now:
# make lint test uberjar

# Security check using nvd-clojure.
# Currently cannot be run in Semaphore since it hits:
#     Error retrieving https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
# ...which probably means a problem on Semaphore's end.

# classpath=$(lein with-profile -user,-dev classpath)
# cd .nvd
# lein with-profile -user,-dev run -m nvd.task.check "nvd.edn" $classpath
# cd -

# TEMPORARY (revert after diagnosis): thread-dump watchdog so a future
# JVM hang produces actionable state in the CI log instead of 65 min of
# silence. Runs in a subshell with -x disabled to avoid noise.
(
  set +x
  while sleep 60; do
    # jps is JDK-provided and present in the lein image; use it instead of
    # pgrep/ps (procps not installed). -q prints just pids.
    pid=$(jps -q 2>/dev/null | head -1)
    [ -n "$pid" ] || continue
    echo "=== WATCHDOG @ $(date -u +%H:%M:%S) pid=$pid ==="
    jstack -l "$pid" 2>&1 | head -300 || true
    echo "=== WATCHDOG end ==="
  done
) &
__WATCHDOG_PID=$!
trap 'kill $__WATCHDOG_PID 2>/dev/null || true' EXIT

lein with-profile -dev,+test,+seeder,+clj-kondo clj-kondo
lein with-profile -user,-dev,+test,+seeder,+eastwood eastwood
CI=true lein with-profile -user,-dev,+test,+seeder,+eftest eftest
lein clean
UBERJAR_IN_COURSE=true lein with-profile uberjar uberjar

jar tf target/uberjar/app.jar | grep --silent duct_hierarchy.edn || exit 1
jar tf target/uberjar/app.jar | grep --silent migrations/203-add-missing-on-delete-cascade-constraints.up.sql || exit 1
jar tf target/uberjar/app.jar | grep --silent gpml/db/action.sql || exit 1
