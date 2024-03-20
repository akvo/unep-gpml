(ns gpml.service.plastic-strategy
  (:require
   [clojure.string :as string]
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.plastic-strategy :as db.ps]
   [gpml.db.plastic-strategy.team :as db.ps.team]
   [gpml.service.chat :as svc.chat]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util.malli :refer [check! failure-with success-with]]
   [gpml.util.thread-transactions :as tht :refer [saga]]
   [taoensso.timbre :as timbre]))

(defn get-plastic-strategies
  "Returned in kebab-case."
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategies (:spec db) search-opts))

(defn get-plastic-strategy
  "Returned in kebab-case."
  [{:keys [db]} search-opts]
  (db.ps/get-plastic-strategy (:spec db) search-opts))

(defn update-plastic-strategy [{:keys [db]} {:keys [id steps]}]
  (db.ps/update-plastic-strategy (:spec db) {:id id
                                             :updates {:steps steps}}))

(defn chat-channel-creation-tx [config logger]
  {:txn-fn
   (fn tx-create-plastic-strategy-chat-channel
     [{:keys [chat-channel-name] :as context}]
     {:pre [chat-channel-name]}
     (let [result (port.chat/create-public-channel (:chat-adapter config) {:name chat-channel-name})]
       (if (:success? result)
         (do
           (log logger :info :created-chat-channel (:channel result))
           (assoc context :channel (:channel result)))
         (assoc context
                :success? false
                :reason :failed-to-create-plastic-strategy-channel
                :error-details {:result result}))))
   :rollback-fn
   (fn rollback-create-plastic-strategy-chat-channel
     [{:keys [channel] :as context}]
     (let [result (port.chat/delete-public-channel (:chat-adapter config)
                                                   (:id channel))]
       (when-not (:success? result)
         (timbre/with-context+ {::context context}
           (log logger :error :failed-to-rollback-create-plastic-strategy-chat-channel {:result result}))))
     context)})

(defn tx-set-plastic-strategy-channel-custom-fields [config
                                                     {:keys [plastic-strategy]
                                                      channel :channel
                                                      :as context}]
  {:pre [plastic-strategy channel]}
  (let [custom-fields {:ps-country-iso-code-a2 (get-in plastic-strategy [:country :iso-code-a2])}
        result
        (port.chat/set-public-channel-custom-fields (:chat-adapter config)
                                                    (:id channel)
                                                    {:metadata custom-fields})]
    (if (:success? result)
      context
      (assoc context
             :success? false
             :reason :failed-to-set-plastic-strategy-channel-custom-fields
             :error-details {:result result}))))

(defn update-plastic-strategy-with-channel-id [db
                                               {:keys [plastic-strategy channel] :as context}]
  {:pre [plastic-strategy channel]}
  (let [result (db.ps/update-plastic-strategy (:spec db)
                                              {:id (:id plastic-strategy)
                                               :updates {:chat-channel-id (:id channel)}})]
    (if (:success? result)
      {:success? true
       :channel channel}
      (assoc context
             :success? false
             :reason :failed-to-update-plastic-strategy-with-channel-id
             :error-details {:result result}))))

(defn create-plastic-strategy [{:keys [db hikari logger] :as config} ps-payload]
  {:pre [db hikari logger]}
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
                (timbre/with-context+ {::context context}
                  (log logger :error :failed-to-delete-plastic-strategy {:result result}))))
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
                (timbre/with-context+ {::context context}
                  (log logger :error :failed-to-delete-plastic-strategy-rbac-context {:result result}))))
            context)}

         (chat-channel-creation-tx config logger)

         (partial tx-set-plastic-strategy-channel-custom-fields config)

         (partial update-plastic-strategy-with-channel-id db)]
        context {:success? true
                 :plastic-strategy (dissoc ps-payload :chat-channel-name)
                 :chat-channel-name (:chat-channel-name ps-payload)}]
    (tht/thread-transactions logger transactions context)))

(defn create-plastic-strategies [{:keys [logger] :as config} pses-payload]
  (let [results (mapv (partial create-plastic-strategy config) pses-payload)]
    (if (every? :success? results)
      (do
        (log logger :info :successfully-created-plastic-strategies)
        {:success? true
         :channels (mapv :channel results)})
      (do
        (log logger :wrn :could-not-create-plastic-strategies)
        {:success? false
         :reason :failed-to-create-all-plastic-strategies
         :error-details {:msg "Partial failure"
                         :failed-results (into []
                                               (remove :success?)
                                               results)}}))))

(defn setup-invited-plastic-strategy-user [{:keys [db logger] :as config} user-id]
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
                (timbre/with-context+ {::context context}
                  (log logger :error :rollback-assign-plastic-strategy-rbac-role {:reason result})))
              context))}
         {:txn-fn
          (fn add-user-to-ps-channel [{:keys [plastic-strategy ps-team-member] :as context}]
            {:pre [ps-team-member]}
            (let [result (svc.chat/join-channel config
                                                (:chat-channel-id plastic-strategy)
                                                ps-team-member)]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-add-user-to-ps-channel
                       :error-details {:result result}))))
          :rollback-fn
          (fn remove-user-from-ps-channel [{:keys [plastic-strategy ps-team-member] :as context}]
            {:pre [ps-team-member]}
            (let [result (svc.chat/leave-channel config
                                                 (:chat-channel-id plastic-strategy)
                                                 ps-team-member)]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-remove-user-from-ps-channel
                       :error-details {:result result}))))}]
        context {:success? true
                 :user-id user-id}]
    (tht/thread-transactions logger transactions context)))

(defn ensure-chat-channel-id [{:keys [db logger chat-adapter] :as config}
                              {:keys [chat-channel-id] :as plastic-strategy}]
  {:post [(check! [:or
                   (success-with :channel-id :string)
                   (failure-with :reason any?)]
                  %)]}
  (let [{:keys [success?]} (and chat-channel-id
                                (not (string/blank? chat-channel-id))
                                (port.chat/get-channel chat-adapter chat-channel-id))]
    (if success?
      {:success? true
       :channel-id chat-channel-id}
      (saga logger {:success? true
                    :plastic-strategy plastic-strategy
                    :chat-channel-name "Forum"}
        (chat-channel-creation-tx config logger)
        (partial tx-set-plastic-strategy-channel-custom-fields config)
        (partial update-plastic-strategy-with-channel-id db)
        (fn [{{:keys [id]} :channel :as context}]
          {:pre [id]}
          (assoc context :channel-id id))))))
