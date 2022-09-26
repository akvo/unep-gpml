(ns gpml.domain.organisation
  (:require [gpml.domain.types :as dom.types]
            [malli.core :as m]))

(def Organisation
  "The Organisation entity schema.

  TODO: add swagger docs."
  (m/schema
   [:map
    [:reviewed_by {:optional true} pos-int?]
    [:country {:optional true} pos-int?]
    [:geo_coverage_type {:optional true} (apply conj [:enum] dom.types/geo-coverage-types)]
    [:review_status {:optional false} (apply conj [:enum] dom.types/review-statuses)]
    [:created_by {:optional true} pos-int?]
    [:second_contact {:optional true} pos-int?]
    [:is_member {:optional false} boolean?]
    [:created {:optional false} inst?]
    [:modified {:optional false} inst?]
    [:reviewed_at {:optional true} inst?]
    [:id {:optional false} pos-int?]
    [:logo {:optional true} [string? {:min 1}]]
    [:subnational_area {:optional true} [string? {:min 1}]]
    [:representative_group_government
     {:optional true}
     [string? {:min 1}]]
    [:name {:optional false} [string? {:min 1}]]
    [:url {:optional true} [string? {:min 1}]]
    [:type {:optional true} [string? {:min 1}]]
    [:representative_group_private_sector
     {:optional true}
     [string? {:min 1}]]
    [:representative_group_academia_research
     {:optional true}
     [string? {:min 1}]]
    [:program {:optional true} [string? {:min 1}]]
    [:contribution {:optional true} [string? {:min 1}]]
    [:expertise {:optional true} [string? {:min 1}]]
    [:representative_group_civil_society
     {:optional true}
     [string? {:min 1}]]
    [:representative_group_other {:optional true} [string? {:min 1}]]]))
