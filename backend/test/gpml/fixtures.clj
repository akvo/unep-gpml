(ns gpml.fixtures
  (:require
   [clojure.java.io :as io]
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as str]
   [duct.core :as duct]
   [duct.database.sql :as sql]
   [duct.logger.timbre]
   [gpml.util.email :as email]
   [integrant.core :as ig]
   [taoensso.timbre :as timbre])
  (:import
   (java.util UUID)))

(defonce ^:private lock (Object.))
(def ^:dynamic *system* nil)

(duct/load-hierarchy)

(defmethod ig/init-key :gpml.test/db [_ spec]
  (sql/->Boundary spec))

(defn read-config [x]
  (duct/read-config x {'gpml/eval eval}))

;; Override the original :duct.logger/timbre so that it keeps appenders already present `in timbre/*config*`.
;; (Will PR)
(defmethod ig/init-key :duct.logger/timbre [_ config]
  (let [timbre-logger (duct.logger.timbre/->TimbreLogger config)
        prev-root timbre/*config*]
    (if (:set-root-config? config)
      (do
        (timbre/merge-config! (assoc config :middleware (->> timbre/*config*
                                                             :middleware
                                                             (remove #{duct.logger.timbre/wrap-legacy-logs})
                                                             (into [duct.logger.timbre/wrap-legacy-logs]))))
        (-> timbre/*config* ;; also log to the cider appender
            duct.logger.timbre/->TimbreLogger
            (assoc :prev-root-config prev-root)))
      timbre-logger)))

(defn- test-system []
  (-> (duct/resource "gpml/config.edn")
      (read-config)
      (duct/prep-config (cond-> [:duct.profile/test]
                          (io/resource "local.edn")
                          (conj :duct.profile/local)))))

(defn- migrate-template-test-db []
  (locking lock
    (when-not (System/getProperty "gpml.template-test-db.migrated")
      (-> (test-system)
          (ig/init [:duct/migrator])
          (ig/halt!))
      (System/setProperty "gpml.template-test-db.migrated" "true"))))

(defn- create-test-db [db db-name]
  (let [sql (format "CREATE DATABASE %s
               WITH OWNER = unep
                 TEMPLATE = gpml_test
                 ENCODING = 'UTF8'
               LC_COLLATE = 'en_US.UTF-8'
                 LC_CTYPE = 'en_US.UTF-8';" db-name)]
    (jdbc/execute! db [sql] {:transaction? false})))

(defn- adapt-jdbc-url [url db-name]
  (str/replace url "gpml_test" db-name))

(defn uuid [] (str/replace (str (UUID/randomUUID)) "-" "_"))
(def mails-sent (atom []))
(defn with-test-system [f]
  (migrate-template-test-db)
  (reset! mails-sent [])
  (let [tmp (test-system)
        new-db-name (format "test_db_%s" (uuid))
        jdbc-url (-> tmp :gpml.test/db :connection-uri)
        dev-db-jdbc-url (adapt-jdbc-url jdbc-url "gpml")
        test-db-url (adapt-jdbc-url jdbc-url new-db-name)
        system (update tmp :duct.database.sql/hikaricp (fn [cfg]
                                                         (assoc cfg :jdbc-url test-db-url)))]
    (create-test-db dev-db-jdbc-url new-db-name)
    (with-redefs [email/send-email (fn [_ sender subject receivers texts htmls]
                                     (swap! mails-sent conj {:sender    sender
                                                             :subject   subject
                                                             :receivers receivers
                                                             :texts     texts
                                                             :htmls     htmls}))]
      (binding [*system* system]
        (f)))))
