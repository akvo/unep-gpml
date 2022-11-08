(ns gpml.domain.initiative
  (:require [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [malli.core :as m]))

(def Initiative
  "The Initiative entity schema. Not all fields for initiative are
  described here as they are subject to be removed and replaced by non
  JSONB fields (fields starting with `q` which means they are a
  question from the FE quiz)."
  (m/schema
   [:map
    [:id pos-int?]
    [:q2 [string? {:min 1}]]
    [:q3 [string? {:min 1}]]
    [:q36 double?]
    [:q24 map?]
    [:url
     [:and
      [string? {:min 1}]
      [:fn util/try-url-str]]]
    [:geo_coverage_type (apply conj [:enum] dom.types/geo-coverage-types)]
    [:status [string? {:min 1}]]
    [:objectives [string? {:min 1}]]
    [:activities [string? {:min 1}]]
    [:qimage [string? {:min 1}]]
    [:brs_api_id [string? {:min 1}]]
    [:brs_api_modified inst?]
    [:source {:default dom.types/default-resource-source}
     (apply conj [:enum] dom.types/resource-source-types)]]))
