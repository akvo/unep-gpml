(ns gpml.domain.event
  (:require [gpml.domain.types :as dom.types]
            [malli.core :as m]))

(def sub-content-types
  "Possible value for Event `sub_content_type`"
  #{"Awareness Raising"
    "Challenges & Contests"
    "Courses & Trainings"
    "Workshops"
    "Webinars & Seminars"
    "Conferences"})

(def Event
  "The Event entity schema."
  (m/schema
   [:map
    [:brs_api_id {:optional true} [string? {:min 1}]]
    [:brs_api_modified {:optional true} inst?]
    [:capacity_building {:optional true} boolean?]
    [:city {:optional true} [string? {:min 1}]]
    [:country {:optional true} pos-int?]
    [:created {:optional true} inst?]
    [:created_by {:optional true} pos-int?]
    [:description {:optional false} [string? {:min 1}]]
    [:document_preview {:optional true} boolean?]
    [:end_date {:optional false} inst?]
    [:event_type {:optional true} [string? {:min 1}]]
    [:featured {:optional true} boolean?]
    [:geo_coverage_type {:optional true} (apply conj [:enum] dom.types/geo-coverage-types)]
    [:id {:optional false} pos-int?]
    [:image {:optional true} [string? {:min 1}]]
    [:info_docs {:optional true} [string? {:min 1}]]
    [:language {:optional false} [string? {:min 1, :max 3}]]
    [:modified {:optional true} inst?]
    [:recording {:optional true} [string? {:min 1}]]
    [:remarks {:optional true} [string? {:min 1}]]
    [:review_status {:optional true} (apply conj [:enum] dom.types/review-statuses)]
    [:reviewed_at {:optional true} inst?]
    [:reviewed_by {:optional true} pos-int?]
    [:start_date {:optional false} inst?]
    [:sub_content_type {:optional true} (apply conj [:enum] sub-content-types)]
    [:subnational_city {:optional true} [string? {:min 1}]]
    [:thumbnail {:optional true} [string? {:min 1}]]
    [:title {:optional false} [string? {:min 1}]]
    [:url {:optional true} [string? {:min 1}]]]))
