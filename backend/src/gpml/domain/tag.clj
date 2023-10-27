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
    [:id
     {:swagger
      {:description "The Tag's identifier"
       :type "integer"}}
     pos-int?]
    [:tag_category
     {:swagger
      {:type "integer"
       :description "The Tag's category reference."}}
     pos-int?]
    [:tag
     {:swagger
      {:type "string"
       :description "The Tag's content."}}
     [string? {:min 1}]]
    [:review_status
     {:default default-review-status
      :swagger {:description "Review status of the Tag. By default `APPROVED` value will be used."
                :type "string"
                :enum dom.types/review-statuses}}
     (apply conj [:enum] dom.types/review-statuses)]
    [:reviewed_by
     {:optional true
      :swagger
      {:type "integer"
       :description "The Tag's review's stakeholder reference."}}
     pos-int?]
    [:reviewed_at
     {:optional true
      :swagger {:description "The Tag's review's datetime."
                :type "string"
                :format "date-time"}}
     inst?]
    [:private
     {:optional true
      :swagger {:description "It indicates if the tag is meant for private usage."
                :type "boolean"}}
     boolean?]
    [:definition
     {:optional true
      :swagger {:description "Not used currently (legacy)."
                :type "string"}}
     [string? {:min 1}]]
    [:ontology_ref_link
     {:optional true
      :swagger {:description "Not used currently (legacy)."
                :type "string"}}
     [:and
      [string? {:min 1}]
      [:fn util/try-url-str]]]]))
