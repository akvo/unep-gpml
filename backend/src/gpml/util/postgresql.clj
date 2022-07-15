(ns gpml.util.postgresql
  (:require [clojure.java.jdbc :as jdbc]
            [jsonista.core :as j])
  (:import [java.sql PreparedStatement SQLException]
           [org.postgresql.util PGobject]))

(defn get-sql-state
  "Gets the SQL state from a SQLException object and returns the keyword
  representation of the state which are described as error codes in
  PostgreSQL[1].

  [1] - https://www.postgresql.org/docs/12/errcodes-appendix.html"
  [^SQLException sql-exception]
  (if-let [sql-state (.getSQLState sql-exception)]
    (case sql-state
      "23000" :integrity-constraint-violation
      "23502" :not-null-violation
      "23503" :foreign-key-violation
      "23505" :unique-constraint-violation
      :other-sql-error)
    :other-sql-error))

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
          jdbc-array (.createArrayOf (.getConnection ^PreparedStatement stmt) type-name as-array)]
      (.setArray stmt ix jdbc-array))))

(deftype PGEnum [value type-name]
  jdbc/ISQLParameter
  (set-parameter [_ stmt ix]
    (let [pg-object (doto (PGobject.)
                      (.setType type-name)
                      (.setValue (name value)))]
      (.setObject ^PreparedStatement stmt ix pg-object))))

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
