(ns gpml.service.permissions
  (:require [dev.gethop.rbac :as rbac]))

(def ^:const root-app-resource-id 0)
(def ^:const root-app-context-type :application)
(def ^:const organisation-context-type :organisation)

(defn- create-resource-context*
  "FIXME: Add docstring"
  [{:keys [conn logger context-type resource-id parent-context-type parent-resource-id]}]
  (let [{success? :success? parent-context :context} (rbac/get-context conn
                                                                       logger
                                                                       (or parent-context-type
                                                                           root-app-context-type)
                                                                       (or parent-resource-id
                                                                           root-app-resource-id))]
    (when (and success? parent-context)
      (let [new-context {:context-type-name context-type
                         :resource-id resource-id}]
        (rbac/create-context! conn logger new-context parent-context)))))

(defn- assign-roles-to-users*
  "FIXME: Add docstring"
  [conn logger role-assignments]
  (let [parsed-role-assignments (mapv (fn [{:keys [role-name context-type resource-id user-id]}]
                                        {:role (:role (rbac/get-role-by-name conn logger role-name))
                                         :context (:context (rbac/get-context conn logger context-type resource-id))
                                         :user {:id user-id}})
                                      role-assignments)]
    (rbac/assign-roles! conn logger parsed-role-assignments)))

(defn create-resource-context
  "FIXME: Add docstring"
  [{:keys [conn logger entity-connections context-type resource-id]}]
  (let [entity-owner-connection (->> entity-connections
                                     (filter #(= :owner (-> % :role keyword)))
                                     first)
        owner-entity-id (:entity entity-owner-connection)]
    (create-resource-context*
     {:conn conn
      :logger logger
      :context-type context-type
      :resource-id resource-id
      :parent-resource-id owner-entity-id
      :parent-context-type (when owner-entity-id
                             organisation-context-type)})))

(defn assign-roles-to-users
  "FIXME: Add docstring"
  [{:keys [conn logger individual-connections context-type resource-id]}]
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
      (assign-roles-to-users* conn logger roles-assignments))))