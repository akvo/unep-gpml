(ns gpml.pg-util
  (:require [clojure.java.jdbc :as jdbc]
            [jsonista.core :as j]
            [clojure.string :as str])
  (:import org.postgresql.jdbc.PgArray
           org.postgresql.util.PGobject))

(defn pgarray->val
  [^PgArray pgarray]
  (into [] (.getArray pgarray)))

(defn val->pgarray
  [value]
  (format "{%s}"
          (str/join ","
                    (map #(str "\"" % "\"")
                         value))))

(defn- parse-json
  [s]
  (j/read-value s j/keyword-keys-object-mapper))

(defn pgobject->val
  [^PGobject obj]
  (let [t (.getType obj)
        v (.getValue obj)]
    (case t
      "json" (parse-json v)
      "jsonb" (parse-json v)
      v)))

(extend-protocol jdbc/IResultSetReadColumn
  PGobject
  (result-set-read-column [value _ _]
    (pgobject->val value))
  PgArray
  (result-set-read-column [value _ _]
    (pgarray->val value)))

(extend-protocol jdbc/ISQLValue
  clojure.lang.PersistentVector
  (sql-value [value]
    (val->pgarray value)))
