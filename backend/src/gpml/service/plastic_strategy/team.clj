(ns gpml.service.plastic-strategy.team
  (:require [gpml.db.plastic-strategy.team :as db.ps.team]
            [gpml.service.permissions :as srv.permissions]
            [gpml.service.plastic-strategy :as srv.ps]
            [gpml.util.thread-transactions :as tht]))

(defn- assign-ps-team-member-role
  [{:keys [db logger]} ps-team-member]
  (let [role-name (keyword (format "plastic-strategy-%s" (name (:role ps-team-member))))
        role-assignments [{:role-name role-name
                           :context-type :plastic-strategy
                           :resource-id (:plastic-strategy-id ps-team-member)
                           :user-id (:user-id ps-team-member)}]]
    (first (srv.permissions/assign-roles-to-users {:conn (:spec db)
                                                   :logger logger}
                                                  role-assignments))))

(defn add-ps-team-member
  [{:keys [db logger] :as config} country-iso-code-a2 ps-team-member]
  (let [transactions
        [{:txn-fn
          (fn tx-get-plastic-strategy
            [{:keys [country-iso-code-a2] :as context}]
            (let [search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
                  {:keys [success? plastic-strategy reason error-details]}
                  (srv.ps/get-plastic-strategy config search-opts)]
              (if success?
                (assoc-in context [:ps-team-member :plastic-strategy-id] (:id plastic-strategy))
                (if (= reason :not-found)
                  (assoc context
                         :success? false
                         :reason :plastic-strategy-not-found)
                  (assoc context
                         :success? false
                         :reason reason
                         :error-details error-details)))))}
         {:txn-fn
          (fn tx-add-ps-team-member
            [{:keys [ps-team-member] :as context}]
            (let [{:keys [success? reason error-details]}
                  (db.ps.team/add-ps-team-member (:spec db) ps-team-member)]
              (if success?
                context
                (assoc context
                       :success? false
                       :reason reason
                       :error-details error-details))))
          :rollback-fn
          (fn rollback-add-ps-team-member
            [{{:keys [plastic-strategy-id user-id]} :ps-team-member :as context}]
            (db.ps.team/delete-ps-team-member (:spec db) plastic-strategy-id user-id)
            context)}
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
                       :error-details error-details))))}]
        context {:success? true
                 :country-iso-code-a2 country-iso-code-a2
                 :ps-team-member ps-team-member}]
    (tht/thread-transactions logger transactions context)))

(defn update-ps-team-member
  [{:keys [db logger] :as config} country-iso-code-a2 ps-team-member]
  (let [transactions
        [{:txn-fn
          (fn tx-get-plastic-strategy
            [{:keys [country-iso-code-a2] :as context}]
            (let [search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
                  {:keys [success? plastic-strategy reason error-details]}
                  (srv.ps/get-plastic-strategy config search-opts)]
              (if success?
                (assoc-in context [:ps-team-member :plastic-strategy-id] (:id plastic-strategy))
                (if (= reason :not-found)
                  (assoc context
                         :success? false
                         :reason :plastic-strategy-not-found)
                  (assoc context
                         :success? false
                         :reason reason
                         :error-details error-details)))))}
         {:txn-fn
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
            (if (= (:role ps-team-member) (:role old-ps-team-member))
              (dissoc context :old-ps-team-member)
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
                 :country-iso-code-a2 country-iso-code-a2
                 :ps-team-member ps-team-member}]
    (tht/thread-transactions logger transactions context)))

(defn get-ps-team-members
  [{:keys [db] :as config} country-iso-code-a2]
  (let [search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        {:keys [success? plastic-strategy] :as result}
        (srv.ps/get-plastic-strategy config search-opts)]
    (if success?
      (db.ps.team/get-ps-team-members (:spec db)
                                      {:filters {:plastic-strategies-ids [(:id plastic-strategy)]}})
      result)))
