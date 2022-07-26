(ns gpml.domain.topic-stakeholder-auth
  (:require [malli.core :as m]))

(def ^:const role-types
  "Topic Stakeholder Auth possible role types"
  #{"owner" "focal-point"})

(def ^:const resource-types
  "Topic Stakeholder Auth possible resource types with applicable
  roles/permissions. This does not refer to the `resource` entity but
  to the platform's resources in general."
  #{"stakeholder" "organisation" "resource" "initiative" "event"
    "technology" "policy" "tag"})

(def TopicStakeholderAuth
  "Topic Stakeholder Auth entity model."
  (m/schema
   [:map
    [:id [:int {:min 0}]]
    [:stakeholder [:int {:min 0}]]
    [:topic_id [:int {:min 0}]]
    [:topic_type (apply conj [:enum] resource-types)]
    [:roles [:sequential (apply conj [:enum] role-types)]]
    [:created inst?]
    [:modified inst?]]))
