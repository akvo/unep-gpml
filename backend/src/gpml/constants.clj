(ns gpml.constants)

(def resource-types #{"financing_resource" "technical_resource" "action_plan"})
(def approved-user-topics #{"stakeholder"})
(def stakeholder-types #{"individual" "entity"})
(def topics
  (vec
   (sort
    (apply conj resource-types ["event" "technology" "policy" "project" "stakeholder" "organisation"]))))

(def reviewer-review-status [:PENDING :ACCEPTED :REJECTED])

(def admin-review-status [:SUBMITTED :APPROVED])

(def user-roles [:USER :REVIEWER :ADMIN])

(def gcs-bucket-name "akvo-unep-gpml")
