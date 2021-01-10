(defproject gpml "1.0.0"
  :description "UNEP - GPML Digital Platform"
  :url "https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
  :license {:name "AGPL-3.0"
            :url "https://www.gnu.org/licenses/agpl-3.0.en.html"}
  :min-lein-version "2.0.0"
  :dependencies [[org.clojure/clojure "1.10.1"]
                 [duct/core "0.8.0"]
                 [integrant "0.8.0"]
                 [duct/module.logging "0.5.0"]
                 [duct/module.sql "0.6.1" :exclusions [medley]]
                 [duct/module.web "0.7.1":exclusions [medley]]
                 [org.postgresql/postgresql "42.2.5"]
                 [com.google.cloud.sql/postgres-socket-factory "1.2.0"]
                 [metosin/reitit-ring "0.5.11" :exclusions [ring/ring-core]]
                 [metosin/reitit-middleware "0.5.11" :exclusions [ring/ring-core
                                                                  org.clojure/spec.alpha]]
                 [metosin/reitit-malli "0.5.11"]
                 [metosin/reitit-swagger "0.5.11"]
                 [metosin/reitit-swagger-ui "0.5.11" :exclusions [ring/ring-core]]
                 [com.layerware/hugsql "0.5.1"]]
  :plugins [[duct/lein-duct "0.12.1"]]
  :main ^:skip-aot gpml.main
  :resource-paths ["resources" "target/resources"]
  :prep-tasks     ["javac" "compile" ["run" ":duct/compiler"]]
  :middleware     [lein-duct.plugin/middleware]
  :profiles
  {:dev  [:project/dev :profiles/dev]
   :uberjar {:aot [gpml.main]
             :uberjar-name "uberjar.jar"}
   :metajar {:aot :all
             :direct-link true
             :jar-inclusions [#"\.sql$"]
             :jar-name "app.jar"
             :pedantic? :abort
             :plugins [[lein-metajar "0.1.1"]]}
   :profiles/dev {}
   :project/dev  {:source-paths   ["dev/src"]
                  :resource-paths ["dev/resources"]
                  :dependencies   [[integrant/repl "0.3.2"]
                                   [fipp "0.6.21"]
                                   [hawk "0.2.11"]
                                   [eftest "0.5.9"]
                                   [kerodon "0.9.1"]]
                  :plugins [[jonase/eastwood "0.3.12"]]
                  :eastwood {:config-files ["eastwood_cfg.clj"]}
                  :repl-options {:init-ns dev
                                 :init (do
                                         (println "Starting backend ...")
                                         (go))
                                 :host "0.0.0.0"
                                 :port 47480}}})
