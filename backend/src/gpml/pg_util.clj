(ns gpml.pg-util
  (:require [clojure.java.jdbc :as jdbc]
            [jsonista.core :as j])
  (:import org.postgresql.util.PGobject))

(defn- parse-json
  [s]
  (j/read-value s j/keyword-keys-object-mapper))

(defn val->jsonb
  [value]
  (doto (PGobject.)
    (.setType "jsonb")
    (.setValue (j/write-value-as-string value))))

(defn pgobject->val
  [^PGobject obj]
  (let [t (.getType obj)
        v (.getValue obj)]
    (case t
      "json" (parse-json v)
      "jsonb" (parse-json v)
      v)))

(deftype JDBCArray [elements type-name]
  jdbc/ISQLParameter
  (set-parameter [_ stmt ix]
    (let [as-array (into-array Object elements)
          jdbc-array (.createArrayOf (.getConnection stmt) type-name as-array)]
      (.setArray stmt ix jdbc-array))))

(extend-protocol jdbc/IResultSetReadColumn
  PGobject
  (result-set-read-column [value _ _]
    (pgobject->val value)))

(extend-protocol jdbc/ISQLValue
  clojure.lang.IPersistentMap
  (sql-value [value]
    (val->jsonb value))
  clojure.lang.PersistentVector
  (sql-value [value]
    (val->jsonb value)))
