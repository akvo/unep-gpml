(ns dev
  (:refer-clojure :exclude [test])
  (:require
   [clojure.java.io :as io]
   [clojure.java.jdbc :as jdbc]
   [clojure.java.shell :refer [sh]]
   [clojure.pprint]
   [clojure.repl :refer :all]
   [clojure.tools.namespace.repl :refer [refresh]]
   [duct.core :as duct]
   [duct.core.repl :as duct-repl]
   [eftest.runner :as eftest]
   [gpml.db.stakeholder]
   [gpml.fixtures]
   [gpml.seeder.dummy :refer [get-or-create-profile]]
   [gpml.seeder.main :as seeder]
   [gpml.util.json :as json]
   [honey.sql]
   [integrant.core :as ig]
   [integrant.repl :refer [clear go halt init prep reset]]
   [integrant.repl.state :refer [config system]]
   [next.jdbc]
   [next.jdbc.connection :as connection]
   [ns-tracker.core :refer [ns-tracker]]
   [taoensso.timbre :as timbre]))

(require 'gpml.main) ;; Load core multimethods, transitively
(require 'malli.provider)

(duct/load-hierarchy)

(defn read-config []
  (-> "gpml/duct.edn" io/resource gpml.fixtures/read-config))

(defn test
  ([v]
   (eftest/run-tests [v] {:fail-fast? true}))

  ([]
   (eftest/run-tests (eftest/find-tests "test")
                     {:fail-fast? true})))

(def profiles
  [:duct.profile/dev :duct.profile/local])

(clojure.tools.namespace.repl/set-refresh-dirs "dev/src" "src" "test" "seeder")

(when (io/resource "local.clj")
  (load "local"))

(defn db-conn []
  (-> system :duct.database.sql/hikaricp :spec))

(defn conn []
  (db-conn))

(defn component [c]
  (get system c))

(defn hikari []
  (component :duct.database.sql/hikaricp))

(defn config-component []
  (get system [:duct/const :gpml.config/common]))

(defn logger []
  (component :duct.logger/timbre))

(defn db-q
  ([q] (db-q q false))
  ([q pp?] (let [result (jdbc/query (db-conn) q)]
             (if pp?
               (clojure.pprint/print-table result)
               result))))

(defn q [query]
  (with-open [pool (connection/->pool com.zaxxer.hikari.HikariDataSource
                                      {:jdbcUrl (System/getenv "DATABASE_URL")
                                       :pool-size 1})]
    (next.jdbc/execute! pool (honey.sql/format query))))

(def modified-namespaces
  (ns-tracker ["src/gpml/db"]))

(defn refresh-all []
  (doseq [ns-sym (modified-namespaces)]
    (require ns-sym :reload))
  (refresh))

(defn make-user! [& [email]]
  (get-or-create-profile (logger)
                         (db-conn)
                         (or email (format "a%s@akvo.org" (random-uuid)))
                         (format "Random%s User%s" (random-uuid) (random-uuid))
                         "USER"
                         "APPROVED"))

(comment

  (prep)

  (reset)
  #_:clj-kondo/ignore
  (test #'gpml.handler.profile-test/handler-put-test)

  config

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

(when (= "vemv" (System/getenv "USER"))
  ;; Disable the default Timbre logger, given I prefer the CIDER logger
  ;; (https://docs.cider.mx/cider/debugging/logging.html )
  (timbre/set-config! (update timbre/*config* :appenders dissoc :println)))

(defmethod ig/init-key :dev/bypass-auth [_ _]
  (fn [handler]
    (fn [request]
      (let [user (or (gpml.db.stakeholder/stakeholder-by-email (conn) {:email "abc@abc.net"})
                     (make-user! "abc@abc.net"))]
        (handler (assoc request :user user))))))

(integrant.repl/set-prep! #(duct/prep-config (read-config) profiles))

(comment
  ;; Grabs the test/prod gcloud logs between two timestamps.
  ;; This data is good to feed into your favorite interactive tool (rebl, cider inspector, etc).
  @(def gcloud-logs
     (mapv :jsonPayload
           (-> "glog.sh"
               io/file
               .getAbsolutePath
               (sh "test"
                   "2024-03-22T04:00:00Z"
                   "2024-03-22T12:11:00Z")
               :out
               json/<-json)))

  (filterv (comp #{"/api/chat/user/channel"}
                 :gpml.handler.main/request-url))

  (filterv (comp #{"post"}
                 :gpml.handler.main/request-method)
           gcloud-logs))
