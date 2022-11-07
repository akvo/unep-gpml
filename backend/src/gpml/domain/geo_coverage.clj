(ns gpml.domain.geo-coverage
  (:require [gpml.util :as util]
            [malli.core :as m]))

(def CountryState
  (m/schema
   [:map
    [:id pos-int?]
    [:name [string? {:min 1}]]
    [:code [string? {:min 1}]]
    [:type [:maybe string?]]
    [:country_id pos-int?]]))

(def GeoCoverageCountryCountryGroups
  "Geo Coverage schema for countries and country groups. This is a sub
  entity relation stored in the `<entity-name>_geo_coverage` tables."
  (m/schema
   [:and
    [:map
     [:resource {:optional true} pos-int?]
     [:event {:optional true} pos-int?]
     [:policy {:optional true} pos-int?]
     [:technology {:optional true} pos-int?]
     [:initiative {:optional true} pos-int?]
     [:organisation {:optional true} pos-int?]
     [:country {:optional true} pos-int?]
     [:country_group {:optional true} pos-int?]]
    [:fn (fn [{:keys [resource event policy technology organisation country country_group]}]
           (and (util/xor? country country_group)
                (util/xor? resource event policy technology organisation)))]]))

(def GeoCoverageCountryStates
  "Geo Coverage schema for country states. This is a sub entity relation
  stored in the `<entity-name>_country_state` tables."
  (m/schema
   [:and
    [:map
     [:resource_id {:optional true} pos-int?]
     [:event_id {:optional true} pos-int?]
     [:policy_id {:optional true} pos-int?]
     [:technology_id {:optional true} pos-int?]
     [:initiative_id {:optional true} pos-int?]
     [:organisation_id {:optional true} pos-int?]
     [:country_state_id {:optional true} pos-int?]]
    [:fn (fn [{:keys [resource event policy technology organisation initiative]}]
           (util/xor? resource event policy technology initiative organisation))]]))

(defn geo-countries-country-groups
  [entity-id entity-key countries country-groups]
  (concat (map #(assoc {} entity-key entity-id :country %) countries)
          (map #(assoc {} entity-key entity-id :country_group %) country-groups)))

(defn geo-country-states
  [entity-id entity-key country-states]
  (map #(assoc {} entity-key entity-id :country_state_id %) country-states))
