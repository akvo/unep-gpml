(ns gpml.constants)

(def resource-types ["financing_resource" "technical_resource" "action_plan"])
(def topics
  (vec
   (sort
    (apply conj resource-types ["people" "event" "technology" "policy" "project" "stakeholder" "organisation"]))))

(def gcs-bucket-name "akvo-unep-gpml")
