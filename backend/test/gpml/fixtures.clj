(ns gpml.fixtures
  (:require
   [clojure.java.io :as io]
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as str]
   [duct.core :as duct]
   [duct.database.sql :as sql]
   [gpml.util.email :as email]
   [integrant.core :as ig])
  (:import
   (java.util UUID)))

(defonce ^:private lock (Object.))
(def ^:dynamic *system* nil)

(duct/load-hierarchy)

(defmethod ig/init-key :gpml.test/db [_ spec]
  (sql/->Boundary spec))

(defn read-config [x main-profile]
  (duct/read-config x {'gpml/eval eval
                       'gpml/profile (fn [_]
                                       main-profile)}))

(defn- test-system []
  (when (System/getenv "CI")
    ;; We have test-ci.edn for some CI-specific tweaks.
    ;; Since Duct doesn't easily allow creating custom profiles,
    ;; we'll use the :duct.profile/local profile.
    (io/copy (io/reader (io/resource "gpml/test-ci.edn"))
             (io/file "test-resources" "local.edn")))

  (-> (duct/resource "gpml/duct.edn")
      (read-config :test)

      ;; support an ad-hoc profile for simple tweaks.
      ;; Note that duct doesn't make it easy to create custom profiles
      (cond-> (io/resource "localtest.edn") (merge (read-config (duct/resource "localtest.edn")
                                                                :test)))

      (duct/prep-config (cond-> [:duct.profile/test]
                          (System/getenv "CI")
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
