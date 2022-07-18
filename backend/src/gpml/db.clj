(ns gpml.db
  (:require [clojure.java.jdbc :as jdbc]
            [integrant.core :as ig])
  (:import org.postgresql.jdbc.PgArray))

(defmethod ig/init-key :gpml.db/spec [_ {:keys [db]}]
  (:spec db))

(extend-protocol jdbc/IResultSetReadColumn
  PgArray
  (result-set-read-column [pgobj _metadata _i]
    (vec (.getArray pgobj))))
