(ns gpml.constants)

(def ^:const topic-tables
  "The list of tables considered as topics in the current model of the
  GPML platform as of 2022-03-16."
  ["event" "technology" "policy" "initiative" "case_study" "resource"])

(def ^:const geo-coverage-entity-tables
  "The list of tables with geo coverage relations."
  (apply conj topic-tables ["organisation" "stakeholder" "non_member_organisation"]))

(def resource-types #{"financing_resource" "technical_resource" "action_plan"})
(def ^:const resources (concat resource-types (butlast topic-tables)))
(def approved-user-topics #{"stakeholder"})
(def stakeholder-types #{"individual" "entity"})
(def topics
  (vec
   (sort
    (apply conj resource-types ["event" "technology" "policy" "initiative" "stakeholder" "organisation" "non_member_organisation" "case_study"]))))

(def reviewer-review-status [:PENDING :ACCEPTED :REJECTED])

(def admin-review-status [:SUBMITTED :APPROVED])

(def user-roles [:USER :REVIEWER :ADMIN])

(def popular-tags '("plastics" "waste management" "marine litter" "capacity building" "product by design" "source to sea"))
