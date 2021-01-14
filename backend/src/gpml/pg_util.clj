(ns gpml.pg-util
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str])
  (:import org.postgresql.jdbc.PgArray))

(defn pgarray->val
  [^PgArray pgarray]
  (into [] (.getArray pgarray)))

(defn val->pgarray
  [value]
  (format "{%s}"
          (str/join ","
                    (map #(str "\"" % "\"")
                         value))))

(extend-protocol jdbc/IResultSetReadColumn
  PgArray
  (result-set-read-column [value _ _]
    (pgarray->val value)))

(extend-protocol jdbc/ISQLValue
  clojure.lang.PersistentVector
  (sql-value [value]
    (val->pgarray value)))
