(ns gpml.domain.initiative
  (:require [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [malli.core :as m]))

(def Initiative
  "FIXME"
  (m/schema
   [:map
    [:id pos-int?]
    [:q2 [string? {:min 1}]]
    [:q3 [string? {:min 1}]]
    [:q36 double?]
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
    [:brs_api_modified inst?]]))
