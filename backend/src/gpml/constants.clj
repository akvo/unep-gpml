(ns gpml.constants)

(def resource-types ["financing_resource" "technical_resource" "action_plan"])
(def topics
  (-> ["people" "event" "technology" "policy" "project" "stakeholder"] (concat resource-types) sort vec))
