(ns gpml.domain.resource
  (:require [gpml.domain.types :as dom.types]
            [malli.core :as m]))

(def ^:const types
  "Possible Resource types.

  FIXME: this currently is not an enum value
  and it should be, instead of plain text."
  #{"technical_resource" "action_plan" "financing_resource"})

(def Resource
  "The Resource entity schema."
  (m/schema
   [:map
    [:attachments {:optional true} map?]
    [:brs_api_id {:optional true} [string? {:min 1}]]
    [:brs_api_modified {:optional true} inst?]
    [:capacity_building {:optional true} boolean?]
    [:country {:optional true} pos-int?]
    [:created {:optional true} inst?]
    [:created_by {:optional true} pos-int?]
    [:document_preview {:optional true} boolean?]
    [:featured {:optional true} boolean?]
    [:first_publication_date {:optional true} [string? {:min 1}]]
    [:geo_coverage_type {:optional true} (apply conj [:enum] dom.types/geo-coverage-types)]
    [:id {:optional false} pos-int?]
    [:image {:optional true} [string? {:min 1}]]
    [:info_docs {:optional true} [string? {:min 1}]]
    [:language {:optional false} [string? {:min 1, :max 3}]]
    [:latest_amendment_date {:optional true} [string? {:min 1}]]
    [:modified {:optional true} inst?]
    [:publish_year {:optional true} pos-int?]
    [:remarks {:optional true} [string? {:min 1}]]
    [:review_status {:optional true} (apply conj [:enum] dom.types/geo-coverage-types)]
    [:reviewed_at {:optional true} inst?]
    [:reviewed_by {:optional true} pos-int?]
    [:sub_content_type {:optional true} [string? {:min 1}]]
    [:subnational_city {:optional true} [string? {:min 1}]]
    [:summary {:optional true} [string? {:min 1}]]
    [:thumbnail {:optional true} [string? {:min 1}]]
    [:title {:optional true} [string? {:min 1}]]
    [:type {:optional true} (apply conj [:enum] types)]
    [:url {:optional true} [string? {:min 1}]]
    [:valid_from {:optional true} [string? {:min 1}]]
    [:valid_to {:optional true} [string? {:min 1}]]
    [:value {:optional true} [string? {:min 1}]]
    [:value_currency {:optional true} [string? {:min 1}]]
    [:value_remarks {:optional true} [string? {:min 1}]]
    [:source {:default dom.types/default-resource-source}
     (apply conj [:enum] dom.types/resource-source-types)]]))
