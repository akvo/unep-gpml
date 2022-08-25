(ns gpml.domain.stakeholder
  (:require [gpml.domain.types :as dom.types]
            [malli.core :as m]))

(def ^:const role-types
  "Stakeholder role types in the platform"
  #{"ADMIN" "USER" "REVIEWER"})

(def Stakeholder
  "Stakeholder's entity model. This is a 1:1 mapping from the database
  model. It does not include the possible extra keys from the possible
  relationships with other entities."
  (m/schema
   [:map
    [:id [:int {:min 0}]]
    [:picture {:optional true} [:string {:min 1}]]
    [:title {:optional true} [:string {:min 1}]]
    [:first_name [:string {:min 1}]]
    [:last_name [:string {:min 1}]]
    [:affiliation {:optional true} [:int {:min 0}]]
    [:email [:string {:min 1}]]
    [:linked_in {:optional true} [:string {:min 1}]]
    [:twitter {:optional true} [:string {:min 1}]]
    [:url {:optional true} [:string {:min 1}]]
    [:country {:optional true} [:int {:min 0}]]
    [:about {:optional true} [:string {:min 1}]]
    [:geo_coverage_type (apply conj [:enum] dom.types/geo-coverage-types)]
    [:created {:optional true} inst?]
    [:modified {:optional true} inst?]
    [:reviewed_at {:optional true} inst?]
    [:role (apply conj [:enum] role-types)]
    [:review_status (apply conj [:enum] dom.types/review-statuses)]
    [:public_email boolean?]
    [:public_database boolean?]
    [:idp_usernames {:optional true} [:sequential string?]]
    [:job_title {:optional true} [:string {:min 1}]]]))
