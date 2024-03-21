(ns gpml.db.plastic-strategy
  #:ns-tracker{:resource-deps ["plastic_strategy.sql"]}
  (:require
   [duct.logger :refer [log]]
   [gpml.db.jdbc-util :as jdbc-util]
   [gpml.util.result :refer [failure]]
   [hugsql.core :as hugsql]
   [taoensso.timbre :as timbre]))

(declare get-plastic-strategies*
         update-plastic-strategy*
         create-plastic-strategies*
         create-plastic-strategy*
         delete-plastic-strategy*)

(hugsql/def-db-fns "gpml/db/plastic_strategy.sql")

(defn get-plastic-strategies
  "Returned in kebab-case."
  [logger conn opts]
  (try
    {:success? true
     :plastic-strategies (jdbc-util/db-result-snake-kw->db-result-kebab-kw (get-plastic-strategies* conn opts)
                                                                           \_)}
    (catch Exception t
      (timbre/with-context+ {::opts opts}
        (log logger :error :could-not-get-plastic-strategies t))
      (failure {:reason :exception
                :error-details {:msg (ex-message t)}}))))

(defn get-plastic-strategy
  "Returned in kebab-case."
  [logger conn opts]
  (try
    (let [{:keys [success? plastic-strategies] :as result}
          (get-plastic-strategies logger conn opts)]
      (if-not success?
        result
        (if (= (count plastic-strategies) 1)
          {:success? true
           :plastic-strategy (first plastic-strategies)}
          (failure {:reason :not-found}))))
    (catch Exception t
      (timbre/with-context+ {::opts opts}
        (log logger :error :could-not-get-plastic-strategy t))
      (failure {:reason :exception
                :error-details {:msg (ex-message t)}}))))

(defn update-plastic-strategy [logger conn update-opts]
  (try
    (let [affected (update-plastic-strategy* conn update-opts)]
      (if (= affected 1)
        {:success? true}
        (failure {:reason :unexpected-number-of-affected-rows
                  :error-details {:expected-affected-rows 1
                                  :actual-affected-rows affected}})))
    (catch Exception t
      (timbre/with-context+ {::update-opts update-opts}
        (log logger :error :could-not-update-plastic-strategy t))
      (failure {:reason :exception
                :error-details {:msg (ex-message t)}}))))

(defn create-plastic-strategies [logger conn plastic-strategies]
  (try
    (let [affected (create-plastic-strategies* conn {:plastic-strategy plastic-strategies})]
      (if (= affected (count plastic-strategies))
        {:success? true}
        (failure {:reason :unexpected-number-of-affected-rows
                  :error-details {:expected-affected-rows (count plastic-strategies)
                                  :actual-affected-rows affected}})))
    (catch Exception t
      (timbre/with-context+ {::plastic-strategies plastic-strategies}
        (log logger :error :could-not-create-plastic-strategies t))
      (failure {:reason :exception
                :error-details {:msg (ex-message t)}}))))

(defn create-plastic-strategy [conn plastic-strategy]
  (jdbc-util/with-constraint-violation-check [{:type :unique
                                               :name "plastic_strategy_country_id_key"
                                               :error-reason :already-exists}]
    {:success? true
     :id (:id (create-plastic-strategy* conn plastic-strategy))}))

(defn delete-plastic-strategy [logger conn plastic-strategy-id]
  (try
    (let [affected (delete-plastic-strategy* conn {:id plastic-strategy-id})]
      (if (= affected 1)
        {:success? true}
        (failure {:reason :unexpected-number-of-affected-rows
                  :error-details {:expected-affected-rows 1
                                  :actual-affected-rows affected}})))
    (catch Exception t
      (timbre/with-context+ {::plastic-strategy-id plastic-strategy-id}
        (log logger :error :could-not-delete-plastic-strategy t))
      (failure {:reason :exception
                :error-details {:msg (ex-message t)}}))))
