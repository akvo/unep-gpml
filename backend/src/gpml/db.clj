(ns gpml.db
  (:require
   [clojure.java.jdbc :as jdbc]
   [gpml.util.malli :refer [check! failure-with success-with]]
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

(def Result
  [:or
   (success-with :result any?)
   (failure-with :error-details [:map [:ex-class :string]])])

(defn sql-statement? [x]
  (and (vector? x)
       (-> x first string?)))

;; XXX logger arg
(defn execute!
  "`input` is either a next.jdbc prepared statement (vector, first member string, rest are parameters),
  or a honysql data structure (hashmap)."
  [hikari input]
  {:post [(check! Result %)]}
  (try
    (let [formatted (cond-> input
                      (not (sql-statement? input)) honey.sql/format)
          v (next.jdbc/execute! (-> hikari :spec :datasource)
                                formatted
                                {:builder-fn next.jdbc.result-set/as-unqualified-kebab-maps})]
      (timbre/with-context+ {:sql-result v}
        (when *assert*
          (timbre/info formatted)))
      {:success? true
       :result v})
    (catch Exception e
      (timbre/error e)
      {:success? false
       :reason :exception
       :error-details {:ex-class (-> e class str)}})))

(defn execute-one!
  "`input` is either a next.jdbc prepared statement (vector, first member string, rest are parameters),
  or a honysql data structure (hashmap)."
  [hikari input]
  {:post [(check! Result %)]}
  (try
    (let [formatted (cond-> input
                      (not (sql-statement? input)) honey.sql/format)
          v (next.jdbc/execute-one! (-> hikari :spec :datasource)
                                    formatted
                                    {:builder-fn next.jdbc.result-set/as-unqualified-kebab-maps})]
      (when *assert*
        (timbre/with-context+ {:sql-result v}
          (timbre/info formatted)))
      {:success? true
       :result v})
    (catch Exception e
      (timbre/error e)
      {:success? false
       :reason :sql-exception
       :error-details {:ex-class (-> e class str)}})))
