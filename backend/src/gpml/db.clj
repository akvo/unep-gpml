(ns gpml.db
  (:require
   [clojure.java.jdbc :as jdbc]
   [honey.sql]
   [integrant.core :as ig]
   [next.jdbc]
   [next.jdbc.result-set]
   [taoensso.timbre :as timbre])
  (:import
   (org.postgresql.jdbc PgArray)))

(defmethod ig/init-key :gpml.db/spec [_ {:keys [db]}]
  (:spec db))

(extend-protocol jdbc/IResultSetReadColumn
  PgArray
  (result-set-read-column [pgobj _metadata _i]
    (vec (.getArray pgobj))))

(defn execute! [hikari honey-data]
  (let [formatted (honey.sql/format honey-data)]
    (when *assert*
      (timbre/info formatted))
    (next.jdbc/execute! (-> hikari :spec :datasource)
                        formatted
                        {:builder-fn next.jdbc.result-set/as-unqualified-kebab-maps})))

(defn execute-one! [hikari honey-data]
  (let [formatted (honey.sql/format honey-data)]
    (when *assert*
      (timbre/info formatted))
    (next.jdbc/execute-one! (-> hikari :spec :datasource)
                            formatted
                            {:builder-fn next.jdbc.result-set/as-unqualified-kebab-maps})))
