(ns gpml.service.plastic-strategy.team
  (:require
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.plastic-strategy.team :as db.ps.team]
   [gpml.db.stakeholder :as db.stakeholder]
   [gpml.service.chat :as svc.chat]
   [gpml.service.invitation :as srv.invitation]
   [gpml.service.permissions :as srv.permissions]
   [gpml.service.plastic-strategy :as srv.ps]
   [gpml.util.email :as util.email]
   [gpml.util.thread-transactions :as tht]))

(defn- assign-ps-team-member-role [{:keys [db logger]} ps-team-member]
  (let [role-name (keyword (format "plastic-strategy-%s" (name (:role ps-team-member))))
        role-assignments [{:role-name role-name
                           :context-type :plastic-strategy
                           :resource-id (:plastic-strategy-id ps-team-member)
                           :user-id (:user-id ps-team-member)}]]
    (first (srv.permissions/assign-roles-to-users {:conn (:spec db)
                                                   :logger logger}
                                                  role-assignments))))

(defn add-ps-team-member [{:keys [db logger mailjet-config] :as config} plastic-strategy ps-team-member]
  (let [transactions
        [{:txn-fn
          (fn tx-add-ps-team-member
            [{:keys [ps-team-member] :as context}]
            (let [{:keys [success? reason] :as result}
                  (db.ps.team/add-ps-team-member (:spec db) ps-team-member)]
              (if success?
                context
                (if (= reason :already-exists)
                  (assoc context
                         :success? false
                         :reason :ps-team-member-already-exists
                         :error-details {:result result})
                  (assoc context
                         :success? false
                         :reason :failed-to-add-team-member
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-add-ps-team-member
            [{{:keys [plastic-strategy-id user-id]} :ps-team-member :as context}]
            (db.ps.team/delete-ps-team-member (:spec db) plastic-strategy-id user-id)
            context)}
         {:txn-fn
          (fn tx-get-ps-team-member
            [{{:keys [plastic-strategy-id user-id]} :ps-team-member :as context}]
            (let [search-opts {:filters {:plastic-strategies-ids [plastic-strategy-id]
                                         :users-ids [user-id]}}
                  result (db.ps.team/get-ps-team-member (:spec db)
                                                        search-opts)]
              (if (:success? result)
                (update context :ps-team-member merge (:ps-team-member result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-ps-team-member
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-assign-role-to-user
            [{:keys [ps-team-member] :as context}]
            (let [{:keys [success? reason error-details]}
                  (assign-ps-team-member-role config ps-team-member)]
              (if success?
                context
                (assoc context
                       :success? false
                       :reason reason
                       :error-details error-details))))
          :rollback-fn
          (fn rollback-assign-role-to-user
            [{:keys [ps-team-member] :as context}]
            (let [role-name (keyword (format "plastic-strategy-%s" (name (:role ps-team-member))))
                  role-unassignments [{:role-name role-name
                                       :context-type :plastic-strategy
                                       :resource-id (:plastic-strategy-id ps-team-member)
                                       :user-id (:user-id ps-team-member)}]
                  result
                  (first (srv.permissions/unassign-roles-from-users {:conn (:spec db)
                                                                     :logger logger}
                                                                    role-unassignments))]
              (when-not (:success? result)
                (log logger :error :failed-to-rollback-assign-role-to-user {:result result})))
            context)}
         {:txn-fn
          (fn tx-create-chat-account-if-required ;; XXX adapt if needed
            [{:keys [ps-team-member] :as context}]
            (if (seq (:chat-account-id ps-team-member))
              context
              (let [{:keys [success? chat-user-account] :as result}
                    (svc.chat/create-user-account config (:id ps-team-member))]
                (if success?
                  (-> context
                      (assoc-in [:ps-team-member :chat-account-id] (:id chat-user-account))
                      (assoc :can-rollback-create-chat-account? true))
                  (assoc context
                         :success? false
                         :reason :failed-to-create-ps-team-member-chat-account
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-create-chat-account-if-required
            [{:keys [ps-team-member can-rollback-create-chat-account?] :as context}]
            (if-not can-rollback-create-chat-account?
              context
              (let [result (port.chat/delete-user-account (:chat-adapter config)
                                                          (:chat-account-id ps-team-member)
                                                          {})]
                (if-not (:success? result)
                  (log logger :error :failed-to-rollback-create-chat-account {:result result})
                  (db.stakeholder/update-stakeholder (:spec db) {:id (:id ps-team-member)
                                                                 :chat_account_id nil
                                                                 :chat_account_status nil}))
                context)))}
         {:txn-fn
          (fn tx-add-team-member-to-ps-chat-channel
            [{:keys [ps-team-member plastic-strategy] :as context}]
            (let [result (svc.chat/join-channel config
                                                (:chat-channel-id plastic-strategy)
                                                ps-team-member
                                                false)]
              (if (:success? result)
                {:success? true}
                (assoc context
                       :success? false
                       :reason :failed-to-add-team-member-to-ps-chat-channel
                       :result {:result result}))))}
         {:txn-fn
          (fn tx-notify-user
            [{:keys [ps-team-member plastic-strategy] :as context}]
            (let [result (util.email/notify-user-added-to-plastic-strategy-team
                          mailjet-config
                          ps-team-member
                          plastic-strategy)]
              (when-not (:success? result)
                (log logger :error :failed-to-notify-user-added-to-ps-team {:result result})))
            context)}]
        context {:success? true
                 :ps-team-member ps-team-member
                 :plastic-strategy plastic-strategy}]
    (tht/thread-transactions logger transactions context)))

(defn update-ps-team-member [{:keys [db logger] :as config} ps-team-member]
  (let [transactions
        [{:txn-fn
          (fn tx-get-old-ps-team-member
            [{{:keys [plastic-strategy-id user-id]} :ps-team-member :as context}]
            (let [search-opts {:filters {:plastic-strategies-ids [plastic-strategy-id]
                                         :users-ids [user-id]}}
                  {:keys [success? ps-team-member reason error-details]}
                  (db.ps.team/get-ps-team-member (:spec db) search-opts)]
              (if success?
                (assoc context :old-ps-team-member ps-team-member)
                (assoc context
                       :success? false
                       :reason reason
                       :error-details error-details))))}
         {:txn-fn
          (fn tx-update-ps-team-member
            [{{:keys [plastic-strategy-id user-id] :as ps-team-member} :ps-team-member :as context}]
            (let [update-params {:plastic-strategy-id plastic-strategy-id
                                 :user-id user-id
                                 :updates (dissoc ps-team-member :plastic-strategy-id :user-id)}
                  {:keys [success? reason error-details]}
                  (db.ps.team/update-ps-team-member (:spec db) update-params)]
              (if success?
                context
                (assoc context
                       :success? false
                       :reason reason
                       :error-details error-details))))
          :rollback-fn
          (fn rollback-update-ps-team-member
            [{{:keys [plastic-strategy-id id teams role]} :old-ps-team-member :as context}]
            (db.ps.team/update-ps-team-member (:spec db) {:plastic-strategy-id plastic-strategy-id
                                                          :user-id id
                                                          :updates {:teams teams
                                                                    :role role}})
            (dissoc context :old-ps-team-member))}
         {:txn-fn
          (fn tx-update-user-role-assignment
            [{:keys [ps-team-member old-ps-team-member] :as context}]
            (cond
              (= (:review-status old-ps-team-member) "INVITED")
              context

              (not (contains? ps-team-member :role))
              (dissoc context :old-ps-team-member)

              (= (:role ps-team-member) (:role old-ps-team-member))
              (dissoc context :old-ps-team-member)

              :else
              (let [old-role-name (keyword (format "plastic-strategy-%s" (name (:role old-ps-team-member))))
                    role-unassignments [{:role-name old-role-name
                                         :context-type :plastic-strategy
                                         :resource-id (:plastic-strategy-id old-ps-team-member)
                                         ;; FIXME: this is a bit
                                         ;; confusing as in
                                         ;; `ps-team-member` we use
                                         ;; the `user-id` instead of
                                         ;; `id`. This is because we
                                         ;; want to return more
                                         ;; details from the user
                                         ;; itself which repeats the
                                         ;; `user-id` value and so we
                                         ;; remove it from the result
                                         ;; and keep the `id` field.
                                         :user-id (:id old-ps-team-member)}]
                    {:keys [success?] :as result}
                    (first (srv.permissions/unassign-roles-from-users {:conn (:spec db)
                                                                       :logger logger}
                                                                      role-unassignments))]
                (if-not success?
                  (assoc context
                         :success? false
                         :reason :failed-to-unassign-previous-role
                         :error-details result)
                  (let [{:keys [success? reason error-details]}
                        (assign-ps-team-member-role config ps-team-member)]
                    (if success?
                      (dissoc context :old-ps-team-member)
                      (assoc context
                             :success? false
                             :reason reason
                             :error-details error-details)))))))}]
        context {:success? true
                 :ps-team-member ps-team-member}]
    (tht/thread-transactions logger transactions context)))

(defn get-ps-team-members [{:keys [db] :as config} country-iso-code-a2]
  (let [search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        {:keys [success? plastic-strategy] :as result}
        (srv.ps/get-plastic-strategy config search-opts)]
    (if success?
      (db.ps.team/get-ps-team-members (:spec db)
                                      {:filters {:plastic-strategies-ids [(:id plastic-strategy)]}})
      result)))

(defn invite-user-to-ps-team [{:keys [db logger mailjet-config] :as config} ps-team-invitation]
  (let [transactions
        [{:txn-fn
          (fn tx-invite-user
            [{:keys [ps-team-invitation] :as context}]
            (let [email-notification-fn (fn [user]
                                          (util.email/notify-user-about-plastic-strategy-invitation
                                           mailjet-config
                                           user
                                           (:plastic-strategy ps-team-invitation)))
                  invitation-payload {:user (select-keys ps-team-invitation [:name :email])
                                      :email-notification-fn email-notification-fn
                                      :type :plastic-strategy}
                  result (srv.invitation/invite-user config
                                                     invitation-payload)]
              (if (:success? result)
                (assoc context
                       :user-id (:user-id result)
                       :invitation (:invitation result))
                (if (= (:reason result) :already-exists)
                  (assoc context
                         :success? false
                         :reason (:reason result)
                         :error-details {:result result})
                  (assoc context
                         :success? false
                         :reason :failed-to-invite-user
                         :error-details {:result result})))))}
         {:txn-fn
          (fn tx-add-user-to-ps-team
            [{:keys [ps-team-invitation user-id] :as context}]
            (let [ps-team-member {:plastic-strategy-id (get-in ps-team-invitation [:plastic-strategy :id])
                                  :user-id user-id
                                  :teams (:teams ps-team-invitation)
                                  :role (:role ps-team-invitation)}
                  result (db.ps.team/add-ps-team-member (:spec db) ps-team-member)]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-add-ps-team-member
                       :error-details {:result result}))))}]
        context {:success? true
                 :ps-team-invitation ps-team-invitation}]
    (tht/thread-transactions logger transactions context)))

(defn delete-ps-team-member [{:keys [db logger] :as config} plastic-strategy user-id]
  (let [transactions
        [{:txn-fn
          (fn tx-get-ps-team-member
            [{:keys [plastic-strategy user-id] :as context}]
            (let [result (db.ps.team/get-ps-team-member (:spec db)
                                                        {:filters {:plastic-strategies-ids [(:id plastic-strategy)]
                                                                   :users-ids [user-id]}})]
              (if (:success? result)
                (assoc context :ps-team-member (:ps-team-member result))
                (if (= (:reason result) :not-found)
                  (assoc context
                         :success? false
                         :reason :ps-team-member-not-found
                         :error-details {:result result})
                  (assoc context
                         :success? false
                         :reason :failed-to-get-ps-team-member
                         :error-details {:result result})))))}
         {:txn-fn
          (fn tx-remove-user-from-ps-channel
            [{:keys [plastic-strategy ps-team-member] :as context}]
            (if-not (seq (:chat-account-id ps-team-member))
              context
              (let [result (port.chat/remove-user-from-channel (:chat-adapter config)
                                                               (:chat-account-id ps-team-member)
                                                               (:chat-channel-id plastic-strategy)
                                                               "c")]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-remove-user-from-ps-channel
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-remove-user-from-ps-channel
            [{:keys [plastic-strategy ps-team-member] :as context}]
            (if-not (seq (:chat-account-id ps-team-member))
              context
              (let [result (svc.chat/join-channel config
                                                  (:chat-channel-id plastic-strategy)
                                                  ps-team-member
                                                  false)]
                (if (:success? result)
                  context
                  (do
                    (log logger :error :failed-to-rollback-remove-user-from-ps-channel {:result result})
                    context)))))}
         {:txn-fn
          (fn tx-unassign-ps-team-member-rbac-role
            [{:keys [ps-team-member] :as context}]
            (if (= (:review-status ps-team-member) "INVITED")
              context
              (let [role-name (keyword (format "plastic-strategy-%s" (name (:role ps-team-member))))
                    role-unassignments [{:role-name role-name
                                         :context-type :plastic-strategy
                                         :resource-id (:plastic-strategy-id ps-team-member)
                                         :user-id (:id ps-team-member)}]
                    {:keys [success?] :as result}
                    (first (srv.permissions/unassign-roles-from-users {:conn (:spec db)
                                                                       :logger logger}
                                                                      role-unassignments))]
                (if success?
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-unassign-ps-team-member-rbac-role
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-unassign-ps-team-member-rbac-role
            [{:keys [ps-team-member] :as context}]
            (if (= (:review-status ps-team-member) "INVITED")
              context
              (let [role-name (keyword (format "plastic-strategy-%s" (name (:role ps-team-member))))
                    role-assignments [{:role-name role-name
                                       :context-type :plastic-strategy
                                       :resource-id (:plastic-strategy-id ps-team-member)
                                       :user-id (:id ps-team-member)}]
                    result
                    (first (srv.permissions/assign-roles-to-users {:conn (:spec db)
                                                                   :logger logger}
                                                                  role-assignments))]
                (if (:success? result)
                  context
                  (do
                    (log logger :error :failed-to-rollback-unassign-ps-team-member-rbac-role {:result result})
                    context)))))}
         {:txn-fn
          (fn tx-delete-ps-team-member
            [{:keys [ps-team-member plastic-strategy user-id] :as context}]
            (if (= (:review-status ps-team-member) "INVITED")
              (let [result (db.stakeholder/delete-stakeholder (:spec db) user-id)]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-delete-ps-team-member
                         :error-details {:result result})))
              (let [result (db.ps.team/delete-ps-team-member (:spec db) (:id plastic-strategy) user-id)]
                (if (:success? result)
                  {:success? true}
                  (assoc context
                         :success? false
                         :reason :failed-to-delete-ps-team-member
                         :error-details {:result result})))))}]
        context {:success? true
                 :plastic-strategy plastic-strategy
                 :user-id user-id}]
    (tht/thread-transactions logger transactions context)))
