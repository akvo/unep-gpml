(ns gpml.domain.organisation
  (:require [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [malli.core :as m]))

(def ^:const types
  "Organisation's possible types.

  TODO: this is not an enforced enum in the database model. Please
  update it to be a ENUM type instead of free text."
  #{"Government"
    "Private Sector (for-profit)"
    "Intergovernmental Organizations (IGOs)"
    "Non-Governmental Organization (NGO)"
    "Academia and Research"
    "Civil Society (not-for-profit)"
    "Other"})

(def Organisation
  "The Organisation entity schema."
  (m/schema
   [:map
    [:id
     {:optional false
      :swagger {:description "Organisation's identifier."
                :type "integer"}}
     pos-int?]
    [:country
     {:optional true
      :swagger {:description "Organisation's country identifier."
                :type "integer"}}
     pos-int?]
    [:geo_coverage_type
     {:optional true
      :swagger {:description "Organisation's Geo Coverage Type. That is, the geographical reach of the organisation."
                :type "string"
                :enum dom.types/geo-coverage-types}}
     (apply conj [:enum] dom.types/geo-coverage-types)]
    [:review_status
     {:optional false
      :default "SUBMITTED"
      :swagger {:description "Organisation's review status. Defaults to 'SUBMITTED'."
                :type "string"
                :enum dom.types/review-statuses}}
     (apply conj [:enum] dom.types/review-statuses)]
    [:created_by
     {:optional true
      :swagger {:description "Stakeholder's identifier that creates the organisation."
                :type "integer"}}
     pos-int?]
    [:second_contact
     {:optional true
      :swagger {:description "Stakeholder's identifier for the second contact of the organisation."
                :type "integer"}}
     pos-int?]
    [:is_member
     {:optional false
      :default false
      :swagger {:description "Boolean indicating if the organisation is part of GPML. Defaults to 'true'."
                :type "boolean"}}
     boolean?]
    [:created
     {:optional false
      :swagger {:description "Organisation's creation date."
                :type "string"
                :format "date-time"}}
     inst?]
    [:modified
     {:optional false
      :swagger {:description "Organisation's last modification date."
                :type "string"
                :format "date-time"}}
     inst?]
    [:reviewed_at
     {:optional true
      :swagger {:description "Organisation's review date."
                :type "string"
                :format "date-time"}}
     inst?]
    [:reviewed_by
     {:optional true
      :swagger {:description "Organisation's reviewer identifier."
                :type "integer"}}
     pos-int?]
    [:logo
     {:optional true
      :swagger {:description "Organisation's logo image URL."
                :type "string"
                :format "uri"}}
     [string? {:min 1}]]
    [:subnational_area
     {:optional true
      :swagger {:description "Organisation's subnational area name."
                :type "string"}}
     [string? {:min 1}]]
    [:representative_group_government
     {:optional true}
     [string? {:min 1}]]
    [:name
     {:optional false
      :swagger {:description "Organisation's name. Names are unique and The API will throw an error if the name already exist in the database."
                :type "string"}}
     [string? {:min 1}]]
    [:url
     {:optional true
      :swagger {:description "Organisation's website URL."
                :type "string"
                :format "uri"}}
     [:and
      [string? {:min 1}]
      [:fn util/try-url-str]]]
    [:type
     {:optional true
      :swagger {:description "Organisation's type. Which representative group."
                :type "string"
                :enum types}}
     (apply conj [:enum] types)]
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
    [:representative_group_other {:optional true} [string? {:min 1}]]
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
      pos-int?]]
    [:tags
     {:optional true}
     [:vector
      [:map
       [:id {:optional true} pos-int?]
       [:tag string?]
       [:tag_category string?]]]]]))
