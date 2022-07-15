(ns dev
  (:refer-clojure :exclude [test])
  (:require [clojure.java.io :as io]
            [clojure.java.jdbc :as jdbc]
            clojure.pprint
            [clojure.repl :refer :all]
            [clojure.tools.namespace.repl :refer [refresh]]
            [duct.core :as duct]
            [duct.core.repl :as duct-repl]
            [eftest.runner :as eftest]
            [gpml.seeder.main :as seeder]
            [integrant.core :as ig]
            [integrant.repl :refer [clear go halt init prep reset]]
            [integrant.repl.state :refer [config system]]
            [ns-tracker.core :refer [ns-tracker]]
            [portal.api :as portal]))

(duct/load-hierarchy)

(defn read-config []
  (duct/read-config (io/resource "gpml/config.edn")))

(defn test
  ([v]
   (eftest/run-tests [v] {:fail-fast? true}))
  ([]
   (eftest/run-tests (eftest/find-tests "test")
                     {:fail-fast? true})))

(def profiles
  [:duct.profile/dev :duct.profile/local])

(clojure.tools.namespace.repl/set-refresh-dirs "dev/src" "src" "test")

(when (io/resource "local.clj")
  (load "local"))

(integrant.repl/set-prep! #(duct/prep-config (read-config) profiles))

(defn db-conn
  []
  (-> system :duct.database.sql/hikaricp :spec))

(defn db-q
  ([q] (db-q q false))
  ([q pp?] (let [result (jdbc/query (db-conn) q)]
             (if pp?
               (clojure.pprint/print-table result)
               result))))

(defn launch-portal
  []
  (portal/start {:portal.launcher/port 47481
                 :portal.launcher/host "0.0.0.0"})
  (portal/tap)
  (portal/open {:portal.colors/theme
                :portal.colors/solarized-light}))

(def modified-namespaces
  (ns-tracker ["src/gpml/db"]))

(defn refresh-all
  []
  (doseq [ns-sym (modified-namespaces)]
    (require ns-sym :reload))
  (refresh))

(comment

  (prep)

  (reset)
  #_:clj-kondo/ignore
  (test #'gpml.handler.profile-test/handler-put-test)

  config

  (launch-portal)

  ;; run all tests
  (test)

  ;; run just one test - we assume that the test is already loaded
  #_:clj-kondo/ignore
  (test #'gpml.handler.landing-test/handler-test))

(comment

  (System/getenv "GOOGLE_APPLICATION_CREDENTIALS")
  ;; => "/credentials/cloud-database-service-account.json"

  (.exists (io/file "/credentials/cloud-database-service-account.json"))
  ;; => true

  (require '[clojure.java.jdbc :as jdbc])
  (require '[hikari-cp.core :as hikari])

  (def opts {:jdbc-url (slurp "/credentials/database-url")
             :register-mbeans false})

  (defonce ds (hikari/make-datasource opts))

  (jdbc/query {:datasource ds}  ["SELECT 1"])
  ;; => ({:?column? 1})

  (seeder/seed {:datasource ds}
               {:country? true
                :currency? true
                :organisation? true
                :language? true
                :tag? true
                :policy? true
                :resource? true
                :technology? true
                :project? true}))
