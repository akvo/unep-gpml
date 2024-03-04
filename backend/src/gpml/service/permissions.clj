(ns gpml.service.permissions
  (:require
   [dev.gethop.rbac :as rbac]
   [duct.logger :refer [log]]
   [gpml.db.rbac-util :as db.rbac-util]))

(def root-app-resource-id 0)
(def root-app-context-type :application)

(def root-app-context-id #uuid"00000000-0000-0000-0000-000000000000")

(def organisation-context-type :organisation)

(defn- create-resource-context* [{:keys [conn logger]} {:keys [context-type resource-id parent-context-type parent-resource-id]}]
  (let [{success? :success?
         parent-context :context
         :as result} (rbac/get-context conn
                                       logger
                                       (or parent-context-type
                                           root-app-context-type)
                                       (or parent-resource-id
                                           root-app-resource-id))]
    (if-not (and success? parent-context)
      (log logger :warn :will-not-create-context result)
      (let [new-context {:context-type-name context-type
                         :resource-id resource-id}]
        (rbac/create-context! conn logger new-context parent-context)))))

(defn assign-roles-to-users [{:keys [conn logger]} role-assignments]
  (let [parsed-role-assignments (mapv (fn [{:keys [role-name context-type resource-id user-id]}]
                                        {:role (:role (rbac/get-role-by-name conn logger role-name))
                                         :context (:context (rbac/get-context conn logger context-type resource-id))
                                         :user {:id user-id}})
                                      role-assignments)]
    (rbac/assign-roles! conn logger parsed-role-assignments)))

(defn unassign-roles-from-users [{:keys [conn logger]} role-unassignments]
  (let [parsed-role-unassignments (mapv (fn [{:keys [role-name context-type resource-id user-id]}]
                                          {:role (:role (rbac/get-role-by-name conn logger role-name))
                                           :context (:context (rbac/get-context conn logger context-type resource-id))
                                           :user {:id user-id}})
                                        role-unassignments)]
    (rbac/unassign-roles! conn logger parsed-role-unassignments)))

(defn unassign-all-roles [{:keys [conn]} user-id]
  (db.rbac-util/unassign-all-roles conn {:user-id user-id}))

(defn create-resource-context [config {:keys [context-type resource-id]}]
  (create-resource-context*
   config
   {:context-type context-type
    :resource-id resource-id
    :parent-resource-id root-app-resource-id
    :parent-context-type root-app-context-type}))

(defn get-resource-context [{:keys [conn logger]} context-type resource-id]
  (rbac/get-context conn logger context-type resource-id))

(defn create-resource-contexts-under-root
  "Create multiple rbac contexts under the same (root) parent

  The contexts are expected to share the same type."
  [{:keys [conn logger]} {:keys [context-type resource-ids]}]
  (let [parent-context {:id root-app-context-id}]
    (doseq [resource-id resource-ids]
      (rbac/create-context!
       conn
       logger
       {:context-type-name context-type
        :resource-id resource-id}
       parent-context))))

(defn delete-resource-context [{:keys [conn logger]} {:keys [resource-id context-type-name]}]
  (let [result (rbac/delete-context!
                conn
                logger
                {:resource-id resource-id
                 :context-type-name context-type-name})]
    (if (:success? result)
      result
      (assoc result :reason :failed-to-delete-context))))

(defn assign-roles-to-users-from-connections [config {:keys [individual-connections context-type resource-id]}]
  (let [individual-connections-for-perms (->> individual-connections
                                              (filter #(contains? #{:owner :resource_editor} (-> % :role keyword)))
                                              distinct)
        roles-assignments (mapv (fn [{:keys [role stakeholder]}]
                                  {:role-name (if (= :owner (keyword role))
                                                :resource-owner
                                                :resource-editor)
                                   :context-type context-type
                                   :resource-id resource-id
                                   :user-id stakeholder})
                                individual-connections-for-perms)]
    (when (seq roles-assignments)
      (assign-roles-to-users config roles-assignments))))

(defn make-user-super-admin
  "Makes the provided user (by id) a super admin in RBAC"
  [{:keys [conn logger]} user-id]
  (rbac/add-super-admin! conn logger user-id))

(defn remove-user-from-super-admins
  "Removes the provided user (by id) from the RBAC registry of super admins"
  [{:keys [conn logger]} user-id]
  (rbac/remove-super-admin! conn logger user-id))
