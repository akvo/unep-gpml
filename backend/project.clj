(def jackson-version
  "Ensuring a consistent and recent Jackson version helps avoiding a variety of issues."
  "2.16.1")

(defproject gpml "1.0.0"
  :description "UNEP - GPML Digital Platform"
  :url "https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
  :license {:name "AGPL-3.0"
            :url "https://www.gnu.org/licenses/agpl-3.0.en.html"}
  :min-lein-version "2.0.0"
  :exclusions [dev.gethop/sql-utils] ;; favor our own copy of this artifact's single ns
  :dependencies [[camel-snake-kebab "0.4.3"]
                 [cheshire "5.12.0"]
                 [clj-commons/iapetos "0.1.13" :exclusions [io.prometheus/simpleclient]]
                 [clj-http "3.12.3"]
                 [clj-time "0.12.0"]
                 [clojure.java-time "1.4.2"]
                 [commons-codec "1.16.1"]
                 [commons-io "2.15.1"]
                 [com.auth0/auth0 "1.25.0" :exclusions [org.jetbrains.kotlin/kotlin-stdlib-common]]
                 [com.auth0/java-jwt "3.12.0"]
                 [com.auth0/jwks-rsa "0.15.0"]
                 [com.fasterxml.jackson.core/jackson-annotations ~jackson-version]
                 [com.fasterxml.jackson.core/jackson-core ~jackson-version]
                 [com.fasterxml.jackson.core/jackson-databind ~jackson-version]
                 [com.fasterxml.jackson.dataformat/jackson-dataformat-cbor ~jackson-version]
                 [com.fasterxml.jackson.datatype/jackson-datatype-jsr310 ~jackson-version]
                 [com.fasterxml.jackson.dataformat/jackson-dataformat-smile ~jackson-version]
                 [com.github.seancorfield/honeysql "2.5.1103"]
                 [com.github.seancorfield/next.jdbc "1.3.909"]
                 [com.google.cloud.sql/postgres-socket-factory "1.16.0"]
                 [com.google.cloud/google-cloud-storage "2.34.0" :exclusions [com.google.guava/failureaccess
                                                                              org.checkerframework/checker-qual]]
                 [com.google.errorprone/error_prone_annotations "2.24.1"]
                 [com.google.guava/guava "33.0.0-jre" :exclusions [org.checkerframework/checker-qual]]
                 [com.layerware/hugsql "0.5.1"]
                 [com.squareup.okhttp3/logging-interceptor "4.12.0" :exclusions [org.jetbrains.kotlin/kotlin-stdlib-jdk8]]
                 [com.squareup.okhttp3/okhttp "4.12.0" :exclusions [org.jetbrains.kotlin/kotlin-stdlib-jdk8]]
                 [com.squareup.okio/okio "3.8.0"]
                 [com.taoensso/encore "3.80.0"]
                 [com.taoensso/timbre "6.3.1"]
                 [com.zaxxer/HikariCP "3.4.5" :exclusions [org.slf4j/slf4j-api]]
                 [dev.gethop/rbac "0.1.0-alpha-7" :exclusions [com.h2database/h2]]
                 [diehard "0.10.3" :exclusions [org.clojure/spec.alpha]]
                 [duct/core "0.8.0"]
                 [duct/module.logging "0.5.0"]
                 [duct/module.sql "0.6.1"]
                 [duct/module.web "0.7.3" :exclusions [ring/ring-core ring/ring-codec]]
                 [integrant "0.8.0"]
                 [io.prometheus/simpleclient_hotspot "0.9.0"]
                 [io.prometheus/simpleclient_jetty "0.9.0"]
                 [io.prometheus/simpleclient_jetty_jdk8 "0.9.0"]
                 [medley "1.4.0"]
                 [metosin/jsonista "0.3.6"]
                 [metosin/malli "0.14.0"]
                 [metosin/reitit-malli "0.5.18" :exclusions [org.clojure/tools.reader
                                                             org.clojure/core.rrb-vector]]
                 [metosin/reitit-middleware "0.5.18" :exclusions [ring/ring-core
                                                                  org.clojure/spec.alpha metosin/muuntaja]]
                 [metosin/reitit-ring "0.5.18" :exclusions [ring/ring-core]]
                 [metosin/reitit-swagger "0.5.18"]
                 [metosin/reitit-swagger-ui "0.5.18" :exclusions [ring/ring-core]]
                 [org.apache.commons/commons-compress "1.26.1"]
                 [org.apache.httpcomponents/httpclient "4.5.14"]
                 [org.apache.httpcomponents/httpcore "4.4.16"]
                 [org.clojure/clojure "1.11.2"]
                 [org.clojure/core.async "1.6.681"]
                 [org.clojure/data.csv "1.0.0"]
                 [org.eclipse.jetty/jetty-server "11.0.20"]
                 [org.eclipse.jetty/jetty-servlet "11.0.20"]
                 [org.eclipse.jetty/jetty-webapp "11.0.20"]
                 [org.eclipse.jetty/jetty-xml "11.0.20"]
                 [org.jsoup/jsoup "1.15.3"]
                 [org.postgresql/postgresql "42.7.2"]
                 [org.slf4j/slf4j-nop "2.0.12"]
                 [pogonos "0.2.1"]
                 [ovotech/clj-gcp "0.6.15" :exclusions [com.google.auth/google-auth-library-oauth2-http
                                                        cheshire
                                                        clj-time]]
                 [raven-clj "1.5.2" :exclusions [cheshire]]
                 [ring-cors "0.1.13"]
                 [ring/ring-jetty-adapter "1.11.0"]
                 [twarc "0.1.15"]
                 [viesti/timbre-json-appender "0.2.12" :exclusions [metosin/jsonista]]]
  :resource-paths ["resources"]
  :prep-tasks     ["javac" "compile"]
  :jvm-opts ["-Djava.awt.headless=true"]
  :target-path "target/%s/" ;; use different targets, on a per-profile basis
  :profiles
  {:uberjar {:aot []
             :pedantic? :abort
             :global-vars {*assert* false}
             :jar-inclusions [#"\.sql$"]
             :uberjar-name "app.jar"
             :plugins [[duct/lein-duct "0.12.3"]]
             :middleware [lein-duct.plugin/middleware]
             :main ^:skip-aot gpml.main
             :prep-tasks ["javac" "compile" ["run" ":duct/compiler"]]}
   :seeder {:main seeder
            :source-paths ["seeder"]
            :resource-paths ["seeder-resources"]}
   :test {:dependencies [[ring/ring-mock "0.4.0"]]
          :resource-paths ["test-resources"]
          :jvm-opts ["-Dclojure.spec.compile-asserts=true"
                     "-Dclojure.spec.check-asserts=true"]}
   :eftest {:dependencies [[eftest "0.6.0"]]
            :plugins [[lein-eftest "0.6.0"]]
            :eftest {:multithread :vars
                     :capture-output? false
                     ;; Please don't specify `:thread-count`, so that all cores will be used.
                     :fail-fast? ~(not (System/getenv "CI"))
                     :report clojure.test/report}}
   :dev  {:source-paths   ["dev/src"]
          :resource-paths ["dev/resources"]
          :dependencies   [[fipp "0.6.21"]
                           [hawk "0.2.11"]
                           [integrant/repl "0.3.2"]
                           [kerodon "0.9.1"]
                           [ns-tracker "0.4.0"]]
          :repl-options {:init-ns dev
                         :init (do
                                 (require 'dev)
                                 (in-ns 'dev)
                                 (if (System/getProperty "unep.gpml.skip-reset-on-startup")
                                   (println "Not resetting on startup")
                                   (@(requiring-resolve 'integrant.repl/reset))))
                         :host "0.0.0.0"
                         :port 47480}}
   :cljfmt {:plugins [[dev.weavejester/lein-cljfmt "0.12.0"]]
            :cljfmt {:load-config-file? true}}
   :clj-kondo {:plugins [[com.github.clj-kondo/lein-clj-kondo "2024.02.12"]]}
   :eastwood {:plugins [[jonase/eastwood "1.4.2"]]
              :eastwood {:linters [:all]
                         :config-files ["eastwood_cfg.clj"]
                         :ignored-faults {:unused-fn-args {dev.gethop.sql-utils true}}
                         :exclude-linters [:keyword-typos
                                           :boxed-math
                                           :unused-locals
                                           :non-clojure-file
                                           :unused-namespaces
                                           :performance]}}})
