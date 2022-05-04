(ns gpml.fixtures
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.core :as duct]
            [duct.database.sql :as sql]
            [gpml.email-util :as email]
            [integrant.core :as ig])
  (:import [java.util UUID]))

(defonce ^:private lock (Object.))
(defonce ^:private template-test-db-migrated? false)
(def ^:dynamic *system*)

(duct/load-hierarchy)

(defmethod ig/init-key :gpml.test/db [_ spec]
  (sql/->Boundary spec))

(defn- test-system
  []
  (-> (duct/resource "gpml/config.edn")
      (duct/read-config)
      (duct/prep-config [:duct.profile/test])))

(defn- migrate-template-test-db
  []
  (locking lock
    (when-not template-test-db-migrated?
      (println "Migrating template db")
      (-> (test-system)
          (ig/init [:duct/migrator])
          (ig/halt!))
      (alter-var-root #'template-test-db-migrated? not)
      (println "Done migrating template db"))))

(defn- create-test-db
  [db db-name]
  (let [sql (format "CREATE DATABASE %s
               WITH OWNER = unep
                 TEMPLATE = gpml_test
                 ENCODING = 'UTF8'
               LC_COLLATE = 'en_US.UTF-8'
                 LC_CTYPE = 'en_US.UTF-8';" db-name)]
    (jdbc/execute! db [sql] {:transaction? false})))

(defn- adapt-jdbc-url
  [url db-name]
  (str/replace url "gpml_test" db-name))

(defn uuid [] (str/replace (str (UUID/randomUUID)) "-" "_"))
(def mails-sent (atom []))
(defn with-test-system
  [f]
  (when-not template-test-db-migrated?
    (migrate-template-test-db))
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

(comment

  (with-test-system
    (fn []
      (prn *system*))))
