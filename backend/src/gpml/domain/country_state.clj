(ns gpml.domain.country-state
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

(def EntityCountryState
  "CountryState schema for MxN relation tables
  `<entity-name>_country_state`. It does an XOR between the entity
  columns as only one of them is allowed in each map."
  (m/schema
   [:and
    [:map
     [:initiative_id pos-int?]
     [:policy_id pos-int?]
     [:event_id pos-int?]
     [:technology_id pos-int?]
     [:resource_id pos-int?]
     [:country_state_id pos-int?]]
    [:fn (fn [{:keys [initiative_id policy_id event_id technology_id resource_id]}]
           (util/xor? initiative_id policy_id event_id technology_id resource_id))]]))
