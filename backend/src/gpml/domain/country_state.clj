(ns gpml.domain.country-state
  (:require [malli.core :as m]))

(def CountryState
  (m/schema
   [:map
    [:id pos-int?]
    [:name [string? {:min 1}]]
    [:code [string? {:min 1}]]
    [:type [:maybe string?]]
    [:country_id pos-int?]]))
