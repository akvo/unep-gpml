(ns gpml.handler.resource.permission
  (:require [gpml.db.resource.association :as db.resource.association]
            [gpml.db.review :as db.review]
            [gpml.db.submission :as db.submission]
            [gpml.db.topic-stakeholder-auth :as db.ts-auth]
            [gpml.handler.util :as util]))

(defn get-resource-if-allowed
  [conn path user read?]
  (let [{:keys [topic-type topic-id] :as params} (update path :topic-type util/get-internal-topic-type)
        submission (->> {:table-name topic-type :id topic-id}
                        (db.submission/detail conn))]
    ;; The following checks are mostly to avoid doing a lot of work
    ;; when checking the user permissions on a specific resource.
    (cond
      ;; If the user is empty it means the caller doesn't have a
      ;; session and is just making a read call on the resource. So no
      ;; need to check extra permissions since platform resources are
      ;; public in a read-only state.
      (and (not (seq user))
           (= (:review_status submission) "APPROVED"))
      submission

      ;; If it's a read attempt, the resource is approved and the user
      ;; is logged in then we should allow without checking extra
      ;; permissions.
      (and read?
           (= (:review_status submission) "APPROVED"))
      submission

      ;; If it's not a read operation the respective PUT, POST and
      ;; DELETE endpoints should check if the user is approved in the
      ;; platform to do the desired action for the specific resource.
      :else
      (let [review (first (db.review/reviews-filter conn params))
            resource-org-associations
            (when-not (get #{"organisation" "stakeholder"} topic-type)
              (db.resource.association/get-resource-associations conn {:table (str "organisation_" topic-type)
                                                                       :entity-col "organisation"
                                                                       :resource-col topic-type
                                                                       :resource-assoc-type (str topic-type "_association")
                                                                       :filters {:resource-id topic-id
                                                                                 :associations ["owner"]}}))
            user-org-auth-roles
            (when (and (:id user)
                       (not (get #{"organisation" "stakeholder"} topic-type)))
              (->> (db.ts-auth/get-topic-stakeholder-auths conn {:filters {:topics-ids (map :organisation resource-org-associations)
                                                                           :topic-types ["organisation"]
                                                                           :stakeholders-ids [(:id user)]}})
                   first
                   :roles
                   (set)))

            user-auth-roles
            (->> (db.ts-auth/get-topic-stakeholder-auths conn {:filters {:topics-ids [topic-id]
                                                                         :topic-types [topic-type]
                                                                         :stakeholders-ids [(:id user)]}})
                 first
                 :roles
                 (set))
            access-allowed?
            (or (and (= (:role user) "REVIEWER") (= (:id user) (:reviewer review)))
                (contains? user-auth-roles "owner")
                (and (not (nil? (:id user)))
                     (= (:created_by submission) (:id user)))
                (some #(get user-org-auth-roles %) ["owner" "focal-point"])
                (= (:role user) "ADMIN"))]
        (when access-allowed?
          submission)))))
