(ns gpml.db.plastic-strategy
  {:ns-tracker/resource-deps ["plastic_strategy.sql"]}
  (:require [gpml.db.jdbc-util :as jdbc-util]
            [hugsql.core :as hugsql]))

(declare get-plastic-strategies*
         update-plastic-strategy*
         create-plastic-strategies*
         create-plastic-strategy*
         delete-plastic-strategy*)

(hugsql/def-db-fns "gpml/db/plastic_strategy.sql")

(defn get-plastic-strategies
  [conn opts]
  (try
    {:success? true
     :plastic-strategies (get-plastic-strategies* conn opts)}
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn get-plastic-strategy
  [conn opts]
  (try
    (let [{:keys [success? plastic-strategies] :as result}
          (get-plastic-strategies conn opts)]
      (if-not success?
        result
        (if (= (count plastic-strategies) 1)
          {:success? true
           :plastic-strategy (first plastic-strategies)}
          {:success? false
           :reason :not-found})))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn update-plastic-strategy
  [conn update-opts]
  (try
    (let [affected (update-plastic-strategy* conn update-opts)]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-plastic-strategies
  [conn plastic-strategies]
  (try
    (let [affected (create-plastic-strategies* conn {:plastic-strategy plastic-strategies})]
      (if (= affected (count plastic-strategies))
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows (count plastic-strategies)
                         :actual-affected-rows affected}}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))

(defn create-plastic-strategy
  [conn plastic-strategy]
  (jdbc-util/with-constraint-violation-check
    [{:type :unique
      :name "plastic_strategy_country_id_key"
      :error-reason :already-exists}]
    {:success? true
     :id (:id (create-plastic-strategy* conn plastic-strategy))}))

(defn delete-plastic-strategy
  [conn plastic-strategy-id]
  (try
    (let [affected (delete-plastic-strategy* conn {:id plastic-strategy-id})]
      (if (= affected 1)
        {:success? true}
        {:success? false
         :reason :unexpected-number-of-affected-rows
         :error-details {:expected-affected-rows 1
                         :actual-affected-rows affected}}))
    (catch Throwable t
      {:success? false
       :reason :exception
       :error-details {:msg (ex-message t)}})))
