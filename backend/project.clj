(defproject gpml "1.0.0"
  :description "UNEP - GPML Digital Platform"
  :url "https://www.gpmarinelitter.org/what-we-do/gpml-digital-platform"
  :license {:name "AGPL-3.0"
            :url "https://www.gnu.org/licenses/agpl-3.0.en.html"}
  :min-lein-version "2.0.0"
  :dependencies [[org.clojure/clojure "1.10.1"]
                 [duct/core "0.7.0"]
                 [duct/module.logging "0.4.0"]
                 [duct/module.sql "0.5.0"]
                 [duct/module.web "0.7.0"]
                 [org.postgresql/postgresql "42.2.5"]
                 [metosin/reitit-ring "0.5.11"]
                 [metosin/reitit-middleware "0.5.11"]]
  :plugins [[duct/lein-duct "0.12.1"]]
  :main ^:skip-aot gpml.main
  :resource-paths ["resources" "target/resources"]
  :prep-tasks     ["javac" "compile" ["run" ":duct/compiler"]]
  :middleware     [lein-duct.plugin/middleware]
  :profiles
  {:dev  [:project/dev :profiles/dev]
   :uberjar {:aot :all}
   :profiles/dev {}
   :project/dev  {:source-paths   ["dev/src"]
                  :resource-paths ["dev/resources"]
                  :dependencies   [[integrant/repl "0.3.1"]
                                   [eftest "0.5.7"]
                                   [kerodon "0.9.0"]]
                  :plugins [[jonase/eastwood "0.3.12"]]
                  :eastwood {:config-files ["eastwood_cfg.clj"]}
                  :repl-options {:init-ns dev
                                 :init (do
                                         (println "Starting backend ...")
                                         (go))
                                 :host "0.0.0.0"
                                 :port 47480}}})
