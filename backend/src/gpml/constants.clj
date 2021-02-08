(ns gpml.constants)

(def resource-types ["financing_resource" "technical_resource"])
(def topics
  (-> ["people" "event" "technology" "policy" "project" "stakeholder"] (concat resource-types) sort vec))
