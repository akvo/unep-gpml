(ns gpml.pg-util
  (:require [clojure.java.jdbc :as jdbc])
  (:import org.postgresql.jdbc.PgArray))

(defn pgarray->val
  [^PgArray pgarray]
  (into [] (.getArray pgarray)))

(extend-protocol jdbc/IResultSetReadColumn
  PgArray
  (result-set-read-column [pgarray _ _]
    (pgarray->val pgarray)))
