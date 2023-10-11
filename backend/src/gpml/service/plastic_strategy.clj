(ns gpml.service.plastic-strategy
  (:require [duct.logger :refer [log]]
            [gpml.db.plastic-strategy :as db.ps]
            [gpml.db.plastic-strategy.team :as db.ps.team]
            [gpml.service.chat :as srv.chat]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util.thread-transactions :as tht]))

(defn get-plastic-strategies
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategies (:spec db) search-opts))

(defn get-plastic-strategy
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategy (:spec db) search-opts))

(defn update-plastic-strategy
  [{:keys [db]} {:keys [id steps]}]
  (db.ps/update-plastic-strategy (:spec db) {:id id
                                             :updates {:steps steps}}))

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

(defn setup-invited-plastic-strategy-user
  [{:keys [db logger] :as config} user-id]
  (let [transactions
        [{:txn-fn
          (fn get-plastic-strategy-team-member
            [{:keys [user-id] :as context}]
            (let [result (db.ps.team/get-ps-team-member (:spec db)
                                                        {:filters {:users-ids [user-id]}})]
              (if (:success? result)
                (assoc context :ps-team-member (:ps-team-member result))
                (if (= (:reason result) :not-found)
                  (assoc context
                         :success? false
                         :reason :ps-team-member-not-found
                         :error-details {:msg "The queried user does not exist in any plastic strategy team."})
                  (assoc context
                         :success? false
                         :reason (:reason result)
                         :error-details (:error-details result))))))}
         {:txn-fn
          (fn assign-plastic-strategy-rbac-role
            [{:keys [ps-team-member] :as context}]
            (let [role-name (keyword (format "plastic-strategy-%s" (name (:role ps-team-member))))
                  role-assignments [{:role-name role-name
                                     :context-type :plastic-strategy
                                     :resource-id (:plastic-strategy-id ps-team-member)
                                     :user-id (:id ps-team-member)}]
                  result (first (srv.permissions/assign-roles-to-users
                                 {:conn (:spec db)
                                  :logger logger}
                                 role-assignments))]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-add-plastic-strategy-user-role
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-assing-plastic-strategy-rbac-role
            [{:keys [ps-team-member] :as context}]
            (let [role-name (keyword (format "plastic-strategy-%s" (name (:role ps-team-member))))
                  role-unassignments [{:role-name role-name
                                       :context-type :plastic-strategy
                                       :resource-id (:plastic-strategy-id ps-team-member)
                                       :user-id (:id ps-team-member)}]
                  result (first (srv.permissions/unassign-roles-from-users
                                 {:conn (:spec db)
                                  :logger logger}
                                 role-unassignments))]
              (when-not (:success? result)
                (log logger :error ::rollback-assign-plastic-strategy-rbac-role {:reason result}))
              context))}
         {:txn-fn
          (fn create-chat-account
            [{:keys [ps-team-member] :as context}]
            (let [result (srv.chat/create-user-account config (:id ps-team-member))]
              (if (:success? result)
                context
                (assoc context
                       :reason :failed-to-create-chat-account
                       :error-details {:result result}))))}]
        context {:success? true
                 :user-id user-id}]
    (tht/thread-transactions logger transactions context)))
