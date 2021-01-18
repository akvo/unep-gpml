(ns dev
  (:refer-clojure :exclude [test])
  (:require [clojure.repl :refer :all]
            [clojure.tools.namespace.repl :refer [refresh]]
            [clojure.java.io :as io]
            [duct.core :as duct]
            [duct.core.repl :as duct-repl]
            [eftest.runner :as eftest]
            [integrant.core :as ig]
            [integrant.repl :refer [clear halt go init prep reset]]
            [integrant.repl.state :refer [config system]]
            [gpml.seeder.main :as seeder]
            [portal.api :as portal]))

(duct/load-hierarchy)

(defn read-config []
  (duct/read-config (io/resource "gpml/config.edn")))

(defn test []
  (eftest/run-tests (eftest/find-tests "test")
                    {:fail-fast? true}))

(def profiles
  [:duct.profile/dev :duct.profile/local])

(clojure.tools.namespace.repl/set-refresh-dirs "dev/src" "src" "test")

(when (io/resource "local.clj")
  (load "local"))

(integrant.repl/set-prep! #(duct/prep-config (read-config) profiles))

(comment

  (prep)

  (reset)

  config

  (test)

  (portal/start {:portal.launcher/port 47481
                 :portal.launcher/host "0.0.0.0"})
  (portal/tap)

  (str "http://localhost:47481?" (:session-id (portal/open {:portal.colors/theme
                                                            :portal.colors/solarized-light} )))

  ,)
