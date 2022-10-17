(ns gpml.handler.resource.permission
  (:require [gpml.db.resource.association :as db.resource.association]
            [gpml.db.resource.detail :as db.resource.detail]
            [gpml.db.review :as db.review]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]))

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
      ;; If it's a read attempt, the resource is approved and the user
      ;; is logged in then we should allow without checking extra
      ;; permissions.
      (and read?
           (= (:review_status resource) "APPROVED"))
      resource

      ;; If the user is empty it means the caller doesn't have a
      ;; session and is just making a read call on the resource. So no
      ;; need to check extra permissions since platform resources are
      ;; public in a read-only state.
      (and (not (seq user))
           (= (:review_status resource) "APPROVED"))
      resource

      ;; If it's not a read operation the respective PUT, POST and
      ;; DELETE endpoints should check if the user is approved in the
      ;; platform to do the desired action for the specific resource.
      :else
      (when (or (reviewer? conn user resource-type resource-id)
                (owner? conn user resource-type resource-id)
                (creator? user resource)
                (user-org-resource-allowed? conn user resource-type resource-id)
                (admin? user))
        resource))))
