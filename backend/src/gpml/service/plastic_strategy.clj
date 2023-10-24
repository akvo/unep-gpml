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
  [{:keys [db logger] :as config} ps-payload]
  (let [transactions
        [{:txn-fn
          (fn tx-create-plastic-strategy
            [{:keys [plastic-strategy] :as context}]
            (let [result (db.ps/create-plastic-strategy (:spec db)
                                                        plastic-strategy)]
              (if (:success? result)
                (assoc-in context [:plastic-strategy :id] (:id result))
                (assoc context
                       :success? false
                       :reason :failed-to-create-plastic-strategy
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-create-plastic-strategy
            [{:keys [plastic-strategy] :as context}]
            (let [result (db.ps/delete-plastic-strategy (:spec db) (:id plastic-strategy))]
              (when-not (:success? result)
                (log logger :error ::failed-to-delete-plastic-strategy {:result result})))
            context)}
         {:txn-fn
          (fn tx-get-plastic-strategy
            [{{:keys [country-id]} :plastic-strategy :as context}]
            (let [search-opts {:filters {:countries-ids [country-id]}}
                  result (db.ps/get-plastic-strategy (:spec db) search-opts)]
              (if (:success? result)
                (assoc context :plastic-strategy (:plastic-strategy result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-plastic-strategy
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-create-plastic-strategy-rbac-context
            [{:keys [plastic-strategy] :as context}]
            (let [result (srv.permissions/create-resource-context {:conn (:spec db)
                                                                   :logger logger}
                                                                  {:context-type :plastic-strategy
                                                                   :resource-id (:id plastic-strategy)})]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-create-plastic-strategy-rbac-context
                       :error-details result))))
          :rollback-fn
          (fn rollback-create-plastic-strategy-rbac-context
            [{:keys [plastic-strategy] :as context}]
            (let [result (srv.permissions/delete-resource-context {:conn (:spec db)
                                                                   :logger logger}
                                                                  {:context-type-name :plastic-strategy
                                                                   :resource-id (:id plastic-strategy)})]
              (when-not (:success? result)
                (log logger :error ::failed-to-delete-plastic-strategy-rbac-context {:result result})))
            context)}
         {:txn-fn
          (fn tx-create-plastic-strategy-chat-channel
            [{:keys [chat-channel-name] :as context}]
            (let [channel {:name chat-channel-name
                           :read-only false}
                  result (srv.chat/create-private-channel config channel)]
              (if (:success? result)
                (assoc context :channel (:channel result))
                (assoc context
                       :success? false
                       :reason :failed-to-create-plastic-strategy-channel
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-create-plastic-strategy-chat-channel
            [{:keys [channel] :as context}]
            (let [result (srv.chat/delete-private-channel config (:id channel))]
              (when-not (:success? result)
                (log logger :error ::failed-to-rollback-create-plastic-strategy-chat-channel {:result result})))
            context)}
         {:txn-fn
          (fn tx-set-plastic-strategy-channel-custom-fields
            [{:keys [plastic-strategy channel] :as context}]
            (let [custom-fields {:ps-country-iso-code-a2 (get-in plastic-strategy [:country :iso-code-a2])}
                  result (srv.chat/set-private-channel-custom-fields config
                                                                     (:id channel)
                                                                     custom-fields)]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-set-plastic-strategy-channel-custom-fields
                       :error-details {:result result}))))}
         {:txn-fn
          (fn update-plastic-strategy-with-channel-id
            [{:keys [plastic-strategy channel] :as context}]
            (let [result (db.ps/update-plastic-strategy (:spec db)
                                                        {:id (:id plastic-strategy)
                                                         :updates {:chat-channel-id (:id channel)}})]
              (if (:success? result)
                {:success? true}
                (assoc context
                       :success? false
                       :reason :failed-to-update-plastic-strategy-with-channel-id
                       :error-details {:result result}))))}]
        context {:success? true
                 :plastic-strategy (dissoc ps-payload :chat-channel-name)
                 :chat-channel-name (:chat-channel-name ps-payload)}]
    (tht/thread-transactions logger transactions context)))

(defn create-plastic-strategies
  [config pses-payload]
  (let [results (map (partial create-plastic-strategy config) pses-payload)]
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
          (fn get-plastic-strategy
            [{:keys [ps-team-member] :as context}]
            (let [search-opts {:filters {:ids [(:plastic-strategy-id ps-team-member)]}}
                  result (db.ps/get-plastic-strategy (:spec db)
                                                     search-opts)]
              (if (:success? result)
                (assoc context :plastic-strategy (:plastic-strategy result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-plastic-strategy
                       :error-details {:result result}))))}
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
                (assoc context :chat-account-id (get-in result [:chat-user-account :id]))
                (assoc context
                       :reason :failed-to-create-chat-account
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-create-chat-account
            [{:keys [chat-account-id] :as context}]
            (let [result (srv.chat/delete-user-account config chat-account-id {})]
              (when-not (:success? result)
                (log logger :error :failed-to-rollback-create-chat-account {:result result})))
            context)}
         {:txn-fn
          (fn add-user-to-ps-channel
            [{:keys [plastic-strategy chat-account-id] :as context}]
            (let [result (srv.chat/add-user-to-private-channel config
                                                               chat-account-id
                                                               (:chat-channel-id plastic-strategy))]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-add-user-to-ps-channel
                       :error-details {:result result}))))}]
        context {:success? true
                 :user-id user-id}]
    (tht/thread-transactions logger transactions context)))