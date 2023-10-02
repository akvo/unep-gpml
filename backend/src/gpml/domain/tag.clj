(ns gpml.domain.tag
  (:require [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [malli.core :as m]))

(def ^:const popular-tags
  "Set of tags that are considered popular. This is a harcoded value and
  is a predefined value for getting tags count per resource."
  #{"plastics"
    "waste management"
    "marine litter"
    "capacity building"
    "product by design"
    "source to sea"})

(def ^:const default-review-status
  "Default review status for a tag."
  "APPROVED")

(def Tag
  "The Tag entity schema."
  (m/schema
   [:map
    [:id pos-int?]
    [:tag_category pos-int?]
    [:tag [string? {:min 1}]]
    [:review_status
     {:default default-review-status
      :swagger {:description "Review status of the Tag"
                :type "string"
                :enum dom.types/review-statuses}}
     (apply conj [:enum] dom.types/review-statuses)]
    [:reviewed_by {:optional true} pos-int?]
    [:reviewed_at {:optional true} inst?]
    [:private {:optional true} boolean?]
    [:definition {:optional true} [string? {:min 1}]]
    [:ontology_ref_link {:optional true}
     [:and
      [string? {:min 1}]
      [:fn util/try-url-str]]]]))
