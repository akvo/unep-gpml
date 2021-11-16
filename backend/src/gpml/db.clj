(ns gpml.db
  (:require
   [integrant.core :as ig]
   [clojure.java.jdbc :as jdbc])
  (:import org.postgresql.jdbc.PgArray))

(defmethod ig/init-key :gpml.db/spec [_ {:keys [db]}]
  (:spec db))

(extend-protocol jdbc/IResultSetReadColumn
  PgArray
  (result-set-read-column [pgobj metadata i]
    (vec (.getArray pgobj))))
