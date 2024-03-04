(ns gpml.db
  (:require
   [clojure.java.jdbc :as jdbc]
   [honey.sql]
   [integrant.core :as ig]
   [next.jdbc]
   [next.jdbc.result-set])
  (:import
   (org.postgresql.jdbc PgArray)))

(defmethod ig/init-key :gpml.db/spec [_ {:keys [db]}]
  (:spec db))

(extend-protocol jdbc/IResultSetReadColumn
  PgArray
  (result-set-read-column [pgobj _metadata _i]
    (vec (.getArray pgobj))))

;; XXX SQL logging
(defn execute! [hikari honey-data]
  (next.jdbc/execute! (-> hikari :spec :datasource)
                      (honey.sql/format honey-data)
                      {:builder-fn next.jdbc.result-set/as-unqualified-kebab-maps}))

(defn execute-one! [hikari honey-data]
  (next.jdbc/execute-one! (-> hikari :spec :datasource)
                          (honey.sql/format honey-data)
                          {:builder-fn next.jdbc.result-set/as-unqualified-kebab-maps}))
