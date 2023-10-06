(ns gpml.service.plastic-strategy
  (:require [gpml.db.plastic-strategy :as db.ps]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util.thread-transactions :as tht]))

(defn get-plastic-strategies
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategies (:spec db) search-opts))

(defn get-plastic-strategy
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategy (:spec db) search-opts))

(defn update-plastic-strategy
  [{:keys [db] :as config} country-iso-code-a2 {:keys [steps]}]
  (let [search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        result (get-plastic-strategy config search-opts)]
    (if-not (:success? result)
      result
      (db.ps/update-plastic-strategy (:spec db) {:id (-> result :plastic-strategy :id)
                                                 :updates {:steps steps}}))))

(defn create-plastic-strategy
  [{:keys [db logger]} plastic-strategy]
  (let [transactions
        [{:txn-fn
          (fn tx-create-plastic-strategy
            [{:keys [plastic-strategy]}]
            (db.ps/create-plastic-strategy (:spec db) plastic-strategy))
          :rollback-fn
          (fn rollback-create-plastic-strategy
            [{:keys [id] :as context}]
            (db.ps/delete-plastic-strategy (:spec db) {:id id})
            context)}
         {:txn-fn
          (fn tx-create-plastic-strategy-rbac-context
            [{:keys [id] :as context}]
            (let [result (srv.permissions/create-resource-context {:conn (:spec db)
                                                                   :logger logger}
                                                                  {:context-type :plastic-strategy
                                                                   :resource-id id})]
              (if (:success? result)
                {:success? true}
                (assoc context
                       :success? false
                       :reason :failed-to-create-plastic-strategy-rbac-context
                       :error-details result))))}]
        context {:success? true
                 :plastic-strategy plastic-strategy}]
    (tht/thread-transactions logger transactions context)))

(defn create-plastic-strategies
  [config plastic-strategies]
  (let [results (map (partial create-plastic-strategy config) plastic-strategies)]
    (if (every? :success? results)
      {:success? true}
      {:success? false
       :reason :failed-to-create-all-plastic-strategies
       :error-details {:msg "Partial failure"
                       :failed-results (filter (comp not :success?) results)}})))
