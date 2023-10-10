(ns gpml.service.invitation
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.invitation :as db.invitation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util :as util]
            [gpml.util.thread-transactions :as tht]))

(defn invite-user
  [{:keys [db logger]} invitation-payload]
  (let [transactions
        [{:txn-fn
          (fn tx-create-stakeholder
            [{{:keys [user]} :invitation-payload :as context}]
            (let [names (str/split (:name user) #" ")
                  stakeholder {:email (:email user)
                               :first_name (first names)
                               :last_name (str/join "," (rest names))}
                  result (db.stakeholder/create-stakeholder (:spec db) stakeholder)]
              (if (:success? result)
                (assoc-in context [:invitation-payload :user :id] (-> result :stakeholder :id))
                (assoc context
                       :success? false
                       :reason :failed-to-create-invited-user
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-create-stakeholder
            [{{:keys [user]} :invitation-payload :as context}]
            (let [result (db.stakeholder/delete-stakeholder (:spec db) (:id user))]
              (when-not (:success? result)
                (log logger :error ::failed-to-rollback-create-stakeholder {:result result})))
            context)}
         {:txn-fn
          (fn tx-assign-unapproved-rbac-role
            [{{:keys [user]} :invitation-payload :as context}]
            (let [role-assignments [{:role-name :unapproved-user
                                     :context-type :application
                                     :resource-id srv.permissions/root-app-resource-id
                                     :user-id (:id user)}]
                  result (first (srv.permissions/assign-roles-to-users
                                 {:conn (:spec db)
                                  :logger logger}
                                 role-assignments))]
              (if (:success? result)
                context
                (assoc context
                       :success? false
                       :reason :failed-to-assing-unapproved-rbac-role-to-user
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-assign-unapproved-rbac-role
            [{{:keys [user]} :invitation-payload :as context}]
            (let [role-unassignments [{:role-name :unapproved-user
                                       :context-type :application
                                       :resource-id srv.permissions/root-app-resource-id
                                       :user-id (:id user)}]
                  result (first (srv.permissions/unassign-roles-from-users
                                 {:conn (:spec db)
                                  :logger logger}
                                 role-unassignments))]
              (when-not (:success? result)
                (log logger :error :failed-to-rollback-assign-unapproved-rbac-role {:result result})))
            context)}
         {:txn-fn
          (fn tx-create-invitation
            [{:keys [invitation-payload] :as context}]
            (let [{:keys [user type]} invitation-payload
                  invitation {:id (util/uuid)
                              :stakeholder-id (:id user)
                              :email (:email user)
                              :type (:type type)}
                  result (db.invitation/create-invitation (:spec db)
                                                          invitation)]
              (if (:success? result)
                (assoc context :invitation (:invitation result))
                (assoc context
                       :success? false
                       :reason :failed-to-create-invitation
                       :error-details {:result result}))))
          :rollback-fn
          (fn rollback-create-invitation
            [{{:keys [id]} :invitation :as context}]
            (let [result (db.invitation/delete-invitation (:spec db) id)]
              (when-not (:success? result)
                (log logger :error ::failed-to-rollback-create-invitation {:result result})))
            context)}
         {:txn-fn
          (fn tx-notify-user-about-invitation
            [context]
            context)}]
        context {:success? true
                 :invitation-payload invitation-payload}]
    (tht/thread-transactions logger transactions context)))
