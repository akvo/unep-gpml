(ns gpml.domain.policy
  (:require [gpml.domain.related-content :as dom.rc]
            [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [gpml.util.regular-expressions :as util.regex]
            [java-time :as jt]
            [java-time.temporal]
            [malli.core :as m]))

(def sub-content-types
  "Possible `sub_content_type` values for Policy. These content types
  are shared with LEAP API importer and are the available sub content
  types provided by the external API."
  #{"Bans and Restrictions"
    "Combined Actions"
    "Economic Instruments"
    "Extended Producer Responsability (EPR) Schemes"
    "Other Actions"
    "Product standards Certification and Labeling requirements"
    "Waste Management Legislation"})

(def types-of-laws
  "Possible `type_of_law` values for Policy. These values are shared
  with LEAP API importer and are the available types of laws provided
  by the external API."
  #{"Legislation"
    "Regulation"
    "Miscellaneous"
    "Constitution"})

(def statuses
  "Possible `status` values for Policy. These values are shared with
  LEAP API importer and are the available statuses provided by the
  external API."
  #{"In force"
    "Repealed"
    "Not yet in force"})

(def Policy
  "Policy's entity schema."
  (m/schema
   [:map
    [:id
     {:swagger
      {:description "The Policy's identifier"
       :type "integer"}}
     pos-int?]
    [:title
     {:optional true
      :swagger
      {:description "The Policy's title."
       :type "string"}}
     [string? {:min 1}]]
    [:original_title
     {:optional true
      :swagger
      {:description "The Policy's original title."
       :type "string"}}
     [string? {:min 1}]]
    [:data_source
     {:optional true
      :swagger
      {:description "The Policy's data source."
       :type "string"}}
     [string? {:min 1}]]
    [:country
     {:optional true
      :swagger
      {:description "The Policy's country identifier. Should be a GPML registered country identifier"
       :type "integer"}}
     pos-int?]
    [:abstract
     {:optional true
      :swagger
      {:description "The Policy's abstract"
       :type "string"}}
     [string? {:min 1}]]
    [:type_of_law
     {:swagger
      {:description "The Policy's type of law."
       :type "string"
       :enum types-of-laws}}
     (apply conj [:enum] types-of-laws)]
    [:record_number
     {:optional true
      :swagger
      {:description "The Policy's record number."
       :type "string"}}
     [string? {:min 1}]]
    [:status
     {:swagger
      {:description "The Policy's status."
       :type "string"
       :enum statuses}}
     (apply conj [:enum] statuses)]
    [:geo_coverage_type
     {:swagger
      {:description "The Policy's geo coverage type."
       :type "string"
       :enum statuses}}
     (apply conj [:enum] dom.types/geo-coverage-types)]
    [:attachments
     {:optional true
      :swagger
      {:description "The Policy's attachments. An JSON array of file URLs."
       :type "array"
       :items {:type "string"
               :format "uri"}}}
     [:sequential
      [:and
       [string? {:min 1}]
       [:fn util/try-url-str]]]]
    [:remarks
     {:optional true
      :swagger
      {:description "The Policy's remarks."
       :type "array"
       :items {:type "string"}}}
     [string? {:min 1}]]
    [:created
     {:swagger
      {:description "The Policy's creation date."
       :type "string"
       :format "date-time"}}
     inst?]
    [:modified
     {:swagger
      {:description "The Policy's last modification date."
       :type "string"
       :format "date-time"}
      :decode/string (fn [s] (jt/instant s))}
     inst?]
    [:implementing_mea
     {:optional true
      :swagger
      {:description "The Policy's country group identifier that implements mea."
       :type "integer"}}
     pos-int?]
    [:review_status
     {:optional true
      :swagger
      {:description "The Policy's review status."
       :type "string"
       :enum dom.types/review-statuses}}
     (apply conj [:enum] dom.types/review-statuses)]
    [:url
     {:optional true
      :swagger
      {:description "The Policy's host URL."
       :type "string"
       :format "uri"}}
     [:and
      [string? {:min 1}]
      [:fn util/try-url-str]]]
    [:image
     {:optional true
      :swagger
      {:description "The Policy's image. Base64 encoded string."
       :type "string"
       :format "byte"}}
     [:fn (comp util/base64? util/base64-headless)]]
    [:created_by
     {:optional true
      :swagger
      {:description "The Policy's creator identifier."
       :type "integer"}}
     pos-int?]
    [:repeals
     {:optional true
      :swagger
      {:description "The Policy's repeals."
       :type "string"}}
     [string? {:min 1}]]
    [:info_docs
     {:optional true
      :swagger
      {:description "The Policy's info docs."
       :type "string"}}
     [string? {:min 1}]]
    [:sub_content_type
     {:optional true
      :swagger
      {:description "The Policy's sub content type."
       :type "string"
       :enum sub-content-types}}
     (apply conj [:enum] sub-content-types)]
    [:topics
     {:optional true
      :swagger
      {:description "The Policy's topics."
       :type "array"
       :items {:type "string"}}}
     [:sequential
      [string? {:min 1}]]]
    [:language
     {:swagger
      {:description "The Policy's default language (e.g., en)."
       :type "string"}}
     [string? {:min 2 :max 3}]]
    [:document_preview
     {:optional true
      :swagger
      {:description "Boolean value if Policy have a preview document."
       :type "boolean"}}
     boolean?]
    [:thumbnail
     {:optional true
      :swagger
      {:description "The Policy's thumbnail. Base64 encoded string."
       :type "string"
       :format "byte"}}
     [:fn (comp util/base64? util/base64-headless)]]
    [:leap_api_id
     {:optional true
      :swagger
      {:description "The Policy's LEAP API identifier. This value shouldn't be provided by external callers."
       :type "string"
       :format "uuid"}}
     uuid?]
    [:leap_api_modified
     {:optional true
      :swagger
      {:description "The Policy's LEAP API last modification. This value shouldn't be provided by external callers."
       :type "string"
       :format "date-time"}
      :decode/string (fn [s] (jt/instant s))}
     inst?]
    ;; FIXME: Change these to be dates instead of strings
    [:first_publication_date
     {:optional true
      :swagger
      {:description "The Policy's first publication date. Date format following ISO 8601."
       :type "string"
       :format "date"}}
     [:and
      string?
      [:re util.regex/date-iso-8601-re]]]
    [:latest_amendment_date
     {:optional true
      :swagger
      {:description "The Policy's first publication date. Date format following ISO 8601."
       :type "string"
       :format "date"}}
     [:and
      string?
      [:re util.regex/date-iso-8601-re]]]
    [:featured
     {:optional true
      :swagger
      {:description "Flag indicating if the policy is a featured resource."
       :type "boolean"}}
     boolean?]
    [:capacity_building
     {:optional true
      :swagger
      {:description "Flag indicating if the policy is a capacity building resource."
       :type "boolean"}}
     boolean?]
    [:subnational_city
     {:optional true
      :swagger
      {:description "If the geo coverage type is sub-national then optional indicate the subnational city."
       :type "string"}}
     [string? {:min 1}]]
    ;; From here and below, Policy related entities.
    [:related_content
     {:optional true
      :swagger
      {:description "The Policy's related content from GPML platform."
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
       [:related_content_relation_type {:optional true} (apply conj [:enum] dom.rc/relation-types)]]]]
    [:entity_connections
     {:optional true
      :swagger
      {:description "The Policy's entity connections from GPML platform."
       :type "array"
       :items
       {:type "object"
        :properties
        {:entity
         {:description "An organisation identifier from the GPML platform."
          :type "integer"}
         :role
         {:description "The role of the entity for this specific policy."
          :type "string"
          :enum dom.types/association-types}}}}}
     [:sequential {:optional true}
      [:map
       [:entity pos-int?]
       [:role (apply conj [:enum] dom.types/association-types)]]]]
    [:individual_connections
     {:optional true
      :swagger
      {:description "The Policy's entity connections from GPML platform."
       :type "array"
       :items
       {:type "object"
        :properties
        {:stakeholder
         {:description "A stakeholder identifier from the GPML platform."
          :type "integer"}
         :role
         {:description "The role of the stakeholder for this specific policy."
          :type "string"
          :enum dom.types/association-types}}}}}
     [:sequential
      [:map
       [:stakeholder pos-int?]
       [:role (apply conj [:enum] dom.types/association-types)]]]]
    [:owners
     {:optional true
      :swagger
      {:description "The Policy owners. An array of owner identifiers."
       :type "array"
       :items {:type "integer"}}}
     [:sequential
      pos-int?]]
    [:geo_coverage_countries
     {:optional true
      :swagger
      {:description "List of countries identifiers for the Policy."
       :type "array"
       :items {:type "integer"}}}
     [:sequential
      {:min 1
       :error/message "Need at least one geo coverage value"}
      pos-int?]]
    [:geo_coverage_country_groups
     {:optional true
      :swagger
      {:description "List of country groups identifiers for the Policy."
       :type "array"
       :items {:type "integer"}}}
     [:sequential
      {:min 1
       :error/message "Need at least one geo coverage value"}
      pos-int?]]]))
