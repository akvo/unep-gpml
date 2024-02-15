(defproject gpml "1.0.0"
  :description "UNEP - GPML Digital Platform"
  :url "https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
  :license {:name "AGPL-3.0"
            :url "https://www.gnu.org/licenses/agpl-3.0.en.html"}
  :min-lein-version "2.0.0"
  :dependencies [[camel-snake-kebab "0.4.3"]
                 [clj-commons/iapetos "0.1.13" :exclusions [io.prometheus/simpleclient]]
                 [clj-http "3.12.0"]
                 [clj-time "0.12.0"]
                 [clojure.java-time "1.4.2"]
                 [commons-codec "1.15"]
                 [com.auth0/auth0 "1.25.0" :exclusions [org.jetbrains.kotlin/kotlin-stdlib-common
                                                        com.fasterxml.jackson.core/jackson-databind]]
                 [com.auth0/java-jwt "3.12.0" :exclusions [com.fasterxml.jackson.core/jackson-databind]]
                 [com.auth0/jwks-rsa "0.15.0" :exclusions [com.fasterxml.jackson.core/jackson-databind
                                                           com.google.guava/guava]]
                 [com.google.cloud.sql/postgres-socket-factory "1.2.0"]
                 [com.google.cloud/google-cloud-storage "2.26.0" :exclusions [org.checkerframework/checker-qual]]
                 [com.layerware/hugsql "0.5.1"]
                 [com.zaxxer/HikariCP "3.4.5" :exclusions [org.slf4j/slf4j-api]]
                 [dev.gethop/rbac "0.1.0-alpha-7"]
                 [diehard "0.10.3" :exclusions [org.clojure/spec.alpha]]
                 [duct/core "0.8.0"]
                 [duct/module.logging "0.5.0"]
                 [duct/module.sql "0.6.1" :exclusions [medley]]
                 [duct/module.web "0.7.1" :exclusions [medley ring/ring-core]]
                 [integrant "0.8.0"]
                 [io.prometheus/simpleclient_hotspot "0.9.0"]
                 [io.prometheus/simpleclient_jetty "0.9.0"]
                 [io.prometheus/simpleclient_jetty_jdk8 "0.9.0"]
                 [metosin/jsonista "0.3.6"]
                 [metosin/reitit-malli "0.5.18" :exclusions [org.clojure/tools.reader
                                                             org.clojure/core.rrb-vector]]
                 [metosin/reitit-middleware "0.5.18" :exclusions [ring/ring-core
                                                                  org.clojure/spec.alpha metosin/muuntaja]]
                 [metosin/reitit-ring "0.5.18" :exclusions [ring/ring-core]]
                 [metosin/reitit-swagger "0.5.18"]
                 [metosin/reitit-swagger-ui "0.5.18" :exclusions [ring/ring-core]]
                 [org.clojure/clojure "1.11.1"]
                 [org.clojure/data.csv "1.0.0"]
                 [org.eclipse.jetty/jetty-server "9.4.31.v20200723"]
                 [org.eclipse.jetty/jetty-servlet "9.4.31.v20200723"]
                 [org.jsoup/jsoup "1.15.3"]
                 [org.postgresql/postgresql "42.2.18"]
                 [ovotech/clj-gcp "0.6.15" :exclusions [com.google.errorprone/error_prone_annotations
                                                        com.google.auth/google-auth-library-oauth2-http
                                                        com.google.guava/guava
                                                        cheshire
                                                        medley
                                                        clj-time]]
                 [raven-clj "1.5.2" :exclusions [cheshire]]
                 [ring-cors "0.1.13"]
                 [ring/ring-jetty-adapter "1.8.2"]
                 [twarc "0.1.15"]]
  :main ^:skip-aot gpml.main
  :resource-paths ["resources" "target/resources"]
  :prep-tasks     ["javac" "compile"]
  :jvm-opts ["-Djava.awt.headless=true"]
  :profiles
  {:uberjar {:aot []
             :pedantic? :abort
             :global-vars {*assert* false}
             :jar-inclusions [#"\.sql$"]
             :uberjar-name "app.jar"}
   :seeder {:main seeder
            :source-paths ["dev/src"] ;; XXX does it still work
            :resource-paths ["dev/resources"]
            :prep-tasks ^:replace []}
   :test {:dependencies [[ring/ring-mock "0.4.0"]]
          :resource-paths ["test-resources"]
          :jvm-opts ["-Dclojure.spec.compile-asserts=true"
                     "-Dclojure.spec.check-asserts=true"]}
   :eftest {:dependencies [[eftest "0.6.0"]]
            :plugins [[lein-eftest "0.6.0"]]
            :eftest {:multithread :vars
                     ;; Please don't specify `:thread-count`, so that all cores will be used.
                     :fail-fast? true
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
                                 ((requiring-resolve 'integrant.repl/go)))
                         :host "0.0.0.0"
                         :port 47480}}
   :cljfmt {:plugins [[dev.weavejester/lein-cljfmt "0.12.0"]]
            :cljfmt {:load-config-file? true}}
   :clj-kondo {:plugins [[com.github.clj-kondo/lein-clj-kondo "2024.02.12"]]}
   :eastwood {:plugins [[jonase/eastwood "1.4.2"]]
              :eastwood {:linters [:all]
                         :config-files ["eastwood_cfg.clj"]
                         :ignored-faults {:reflection {gpml.service.file {:line 106}
                                                       gpml.handler.monitoring {:line 81}}}
                         :exclude-linters [:keyword-typos
                                           :boxed-math
                                           :unused-locals
                                           :non-clojure-file
                                           :unused-namespaces
                                           :performance]}}})
