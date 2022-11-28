(ns gpml.domain.case-study
  (:require [gpml.domain.related-content :as dom.rc]
            [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [java-time :as jt]
            [java-time.temporal]
            [malli.core :as m]))

(def ^:const entity-relation-keys
  #{:geo_coverage_countries :geo_coverage_country_groups :tags
    :individual_connections :entity_connections :related_content})

;; TODO: Move Geo-Coverage part and other things to a shared space.
(def CaseStudy
  "The Case Study's entity model."
  (m/schema
   [:map
    [:id
     {:swagger
      {:description "The Case Study's identifier"
       :type "integer"}}
     pos-int?]
    [:title
     {:swagger
      {:description "The Case Study's title."
       :type "string"
       :allowEmptyValue false}}
     [:string {:min 1}]]
    [:description
     {:optional true
      :swagger
      {:description "The Case Study's description."
       :type "string"
       :allowEmptyValue true}}
     [:string {:min 1}]]
    [:geo_coverage_type
     {:decode/string keyword
      :decode/json keyword
      :swagger
      {:description "The Case Study's geo_coverage_type."
       :type "string"
       :enum dom.types/geo-coverage-types
       :allowEmptyValue false}}
     (apply conj [:enum] (mapv keyword dom.types/geo-coverage-types))]
    [:geo_coverage_countries
     {:optional true
      :swagger {:description "The Case Study's country reach."
                :type "array"
                :items {:type "integer"}}}
     [:sequential
      pos-int?]]
    [:geo_coverage_country_groups
     {:optional true
      :swagger {:description "The Case Study's country groups reach."
                :type "array"
                :items {:type "integer"}}}
     [:sequential
      pos-int?]]
    [:source
     {:default dom.types/default-resource-source
      :decode/string keyword
      :decode/json keyword
      :swagger {:description "Source platform of the Case Study"
                :type "string"
                :enum dom.types/resource-source-types}}
     (apply conj [:enum] dom.types/resource-source-types)]
    [:publish_year
     {:optional true
      :swagger
      {:description "The Case Study's publication year."
       :type "integer"}}
     pos-int?]
    [:created
     {:optional true
      :swagger
      {:description "The Case Study's creation datetime."
       :type "string"
       :format "date-time"}
      :decode/string (fn [s] (jt/instant s))}
     inst?]
    [:last_modified_at
     {:optional true
      :swagger
      {:description "The Case Study's last modification datetime."
       :type "string"
       :format "date-time"}
      :decode/string (fn [s] (jt/instant s))}
     inst?]
    [:reviewed_at
     {:optional true
      :swagger
      {:description "The Case Study's review's datetime."
       :type "string"
       :format "date-time"}
      :decode/string (fn [s] (jt/instant s))}
     inst?]
    [:reviewed_by
     {:optional true
      :swagger
      {:type "integer"
       :description "The Case Study's review's stakeholder reference."}}
     pos-int?]
    [:review_status
     {:swagger
      {:description "Review status of the Case Study"
       :type "string"
       :enum dom.types/review-statuses}}
     (apply conj [:enum] dom.types/review-statuses)]
    [:created_by
     {:swagger
      {:type "integer"
       :description "The Case Study's creator's stakeholder reference."}}
     pos-int?]
    [:image
     {:optional true
      :swagger
      {:description "The Case Study's image. Base64 encoded string."
       :type "string"
       :format "byte"}}
     [:fn (comp util/base64? util/base64-headless)]]
    [:thumbnail
     {:optional true
      :swagger
      {:description "The Case Study's thumbnail image. Base64 encoded string."
       :type "string"
       :format "byte"}}
     [:fn (comp util/base64? util/base64-headless)]]
    [:language
     {:swagger
      {:description "The Case Study's default language (e.g., en)."
       :type "string"}}
     [string? {:min 2 :max 3}]]
    [:featured
     {:optional true
      :swagger
      {:description "Flag indicating if the Case Study is a featured resource."
       :type "boolean"}}
     boolean?]
    [:capacity_building
     {:optional true
      :swagger
      {:description "Flag indicating if the Case Study is a capacity building resource."
       :type "boolean"}}
     boolean?]
    [:url
     {:optional true
      :swagger
      {:description "Case Study's source URL."
       :type "string"
       :format "uri"}}
     [:and
      [string? {:min 1}]
      [:fn
       {:error/message "Not a valid URL. It should have the following shape: [protocol]://[domain]/[paths]"}
       util/try-url-str]]]
    [:tags
     {:optional true}
     [:vector
      [:map
       [:id {:optional true} pos-int?]
       [:tag string?]]]]
    [:individual_connections
     {:optional true
      :swagger
      {:description "The Case Study's individual connections from GPML platform."
       :type "array"
       :items
       {:type "object"
        :properties
        {:stakeholder
         {:description "A stakeholder identifier from the GPML platform."
          :type "integer"}
         :role
         {:description "The role of the stakeholder for this specific case study."
          :type "string"
          :enum dom.types/association-types}}}}}
     [:sequential
      [:map
       [:stakeholder pos-int?]
       [:role (apply conj [:enum] dom.types/association-types)]]]]
    [:entity_connections
     {:optional true
      :swagger
      {:description "The Case Study's entity connections from GPML platform."
       :type "array"
       :items
       {:type "object"
        :properties
        {:entity
         {:description "An organisation identifier from the GPML platform."
          :type "integer"}
         :role
         {:description "The role of the entity for this specific case study."
          :type "string"
          :enum dom.types/association-types}}}}}
     [:sequential {:optional true}
      [:map
       [:entity pos-int?]
       [:role (apply conj [:enum] dom.types/association-types)]]]]
    [:related_content
     {:optional true
      :swagger
      {:description "The Case Study's related content from GPML platform."
       :type "array"
       :items
       {:type "object"
        :properties
        {:id
         {:description "The related resource identifier."
          :type "string"}
         :type
         {:description "The related resource type."
          :type "string"
          :enum dom.rc/resource-types}
         :related_content_relation_type
         {:description "The of relation with the resource."
          :type "string"
          :enum dom.rc/relation-types}}}}}
     [:sequential
      [:map
       [:id pos-int?]
       [:type (apply conj [:enum] dom.rc/resource-types)]
       [:related_content_relation_type {:optional true} (apply conj [:enum] dom.rc/relation-types)]]]]]))
