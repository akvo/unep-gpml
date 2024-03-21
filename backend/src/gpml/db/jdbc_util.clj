(ns gpml.db.jdbc-util
  (:require
   [camel-snake-kebab.core :refer [->kebab-case ->snake_case]]
   [camel-snake-kebab.extras :as cske]
   [clojure.string :as str]
   [gpml.util.result :refer [failure]]
   [medley.core :as medley]
   [taoensso.timbre :as timbre])
  (:import
   (java.sql SQLException)))

(def integrity-constraint-violation-state-codes
  {:integrity-constraint "23000"
   :restrict "23001"
   :not-null "23502"
   :foreign-key "23503"
   :unique "23505"
   :check "23514"
   :exclusion "23P01"})

(defn- is-constraint-violation?
  [^SQLException exception constraint]
  (let [message (ex-message exception)]
    (and
     (= (get integrity-constraint-violation-state-codes (:type constraint))
        (.getSQLState exception))
     (seq message)
     (str/includes? message (:name constraint)))))

(defn with-constraint-violation-check-fn [constraints body-fn]
  (try
    (body-fn)
    (catch SQLException e
      (timbre/error e)
      (if-let [reason (:error-reason (medley/find-first
                                      (partial is-constraint-violation? e)
                                      constraints))]
        (failure {:reason reason
                  :error-details {:msg (ex-message e)}})
        (failure {:reason :unknown-sql-error
                  :error-details {:msg (ex-message e)}})))
    (catch Exception e
      (timbre/error e)
      (failure
       {:reason :exception
        :error-details {:msg (ex-message e)}}))))

(defmacro with-constraint-violation-check
  {:style/indent 1}
  [constraints & body]
  `(with-constraint-violation-check-fn
     ~constraints
     (fn [] ~@body)))

(defn db-params-kebab-kw->db-params-snake-kw [db-params]
  (cske/transform-keys ->snake_case db-params))

(defn db-result-snake-kw->db-result-kebab-kw
  ([db-result] (cske/transform-keys ->kebab-case db-result))
  ([db-result separator] (cske/transform-keys #(->kebab-case % :separator separator) db-result)))
