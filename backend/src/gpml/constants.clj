(ns gpml.constants)

(def resource-types ["financing_resource" "technical_resource"])
(def topics
  (-> ["people" "event" "technology" "policy" "project"] (concat resource-types) sort vec))
