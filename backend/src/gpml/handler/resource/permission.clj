(ns gpml.handler.resource.permission
  (:require [dev.gethop.rbac :as rbac]
            [gpml.db.resource.association :as db.resource.association]
            [gpml.db.resource.detail :as db.resource.detail]
            [gpml.db.review :as db.review]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]))

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
  (let [individual_connections-for-perms (->> individual-connections
                                              (filter #(contains? #{:owner :resource_editor} (-> % :role keyword)))
                                              distinct)
        roles-assignments (mapv (fn [{:keys [role stakeholder]}]
                                  {:role-name (if (= :owner (keyword role))
                                                :resource-owner
                                                :resource-editor)
                                   :context-type context-type
                                   :resource-id resource-id
                                   :user-id stakeholder})
                                individual_connections-for-perms)]
    (when (seq roles-assignments)
      (assign-roles-to-users* conn logger roles-assignments))))

(defn- reviewer?
  [conn user resource-type resource-id]
  (let [review (first (db.review/reviews-filter conn {:topic-type resource-type
                                                      :topic-id resource-id}))]
    (and (= (:role user) "REVIEWER")
         (= (:id user) (:reviewer review)))))

(defn- owner?
  [conn user resource-type resource-id]
  (let [user-auth-roles
        (->> (db.ts-auth/get-topic-stakeholder-auths conn
                                                     {:filters {:topics-ids [resource-id]
                                                                :topic-types [resource-type]
                                                                :stakeholders-ids [(:id user)]}})
             first
             :roles
             (set))]
    (contains? user-auth-roles "owner")))

(defn- creator?
  [user resource]
  (and (not (nil? (:id user)))
       (= (:created_by resource) (:id user))))

(defn- user-org-resource-allowed?
  [conn user resource-type resource-id]
  (let [resource-org-associations
        (when-not (get #{"organisation" "stakeholder"} resource-type)
          (db.resource.association/get-resource-associations conn
                                                             {:table (str "organisation_" resource-type)
                                                              :entity-col "organisation"
                                                              :resource-col resource-type
                                                              :resource-assoc-type (str resource-type "_association")
                                                              :filters {:resource-id resource-id
                                                                        :associations ["owner"]}}))
        user-org-auth-roles
        (when (and (:id user)
                   (not (get #{"organisation" "stakeholder"} resource-type)))
          (->> (db.ts-auth/get-topic-stakeholder-auths conn {:filters {:topics-ids (map :organisation resource-org-associations)
                                                                       :topic-types ["organisation"]
                                                                       :stakeholders-ids [(:id user)]}})
               first
               :roles
               (set)))]
    (some #(get user-org-auth-roles %) ["owner" "focal-point"])))

(defn- admin?
  [user]
  (= (:role user) "ADMIN"))

(defn get-resource-if-allowed
  "Checks user permissions for a specific resource and if allowed returns
  the resource details."
  [conn user resource-type resource-id {:keys [read?] :as _opts}]
  (let [resource (db.resource.detail/get-resource conn
                                                  {:table-name resource-type
                                                   :id resource-id})]
    ;; The following checks are mostly to avoid doing a lot of work
    ;; when checking the user permissions on a specific resource.
    (cond
      ;; If the resource is the caller stakeholder details or the
      ;; caller is an approved user of the platform than we should
      ;; allow it to see it's data. Otherwise, stakeholder data is not
      ;; public.
      (and read?
           (= resource-type "stakeholder")
           (or (= (:id user) (:id resource))
               (= (:review_status user) "APPROVED")))
      resource

      ;; Platform resources are public with the exception of
      ;; stakeholders. They can only be visible for platform approved
      ;; users.
      (and read?
           (= (:review_status resource) "APPROVED")
           (not= resource-type "stakeholder"))
      resource

      ;; If it's not a read operation the respective PUT, POST and
      ;; DELETE endpoints should check if the user is approved in the
      ;; platform to do the desired action for the specific resource.
      (or (reviewer? conn user resource-type resource-id)
          (owner? conn user resource-type resource-id)
          (creator? user resource)
          (user-org-resource-allowed? conn user resource-type resource-id)
          (admin? user))
      resource

      ;; If none of the above fulfills then we return `nil` signaling
      ;; the user doesn't have permissions to access the resource.
      :else nil)))
