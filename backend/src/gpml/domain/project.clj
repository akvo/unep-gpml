(ns gpml.domain.project
  (:require [gpml.domain.types :as dom.types]
            [malli.core :as m]))

(def project-types
  "Possible values for `project-type`."
  #{"action-plan"})

(def project-stages
  "Possible values for `project-stage`"
  #{"create" "implement" "report" "update"})

(def ProjectGeoCoverage
  "The Project's geo coverage sub entity."
  (m/schema
   [:map
    [:project_id
     pos-int?]
    [:country_id
     pos-int?]
    [:country_group_id
     pos-int?]]))

(def Project
  "The Project entity model."
  (m/schema
   [:map
    [:id
     {:swagger
      {:description "The Project's identifier"
       :type "integer"
       :allowEmptyValue false}}
     pos-int?]
    [:stakeholder_id
     {:swagger
      {:description "The Project stakeholder's (owner/creator) identifier."
       :type "integer"
       :allowEmptyValue false}}
     pos-int?]
    [:type
     {:swagger
      {:description "The Project's type."
       :type "string"
       :enum project-types
       :allowEmptyValue false}}
     (apply conj [:enum] project-types)]
    [:title
     {:swagger
      {:description "The Project's title."
       :type "string"
       :allowEmptyValue false}}
     [:string {:min 1}]]
    [:geo_coverage_type
     {:swagger
      {:description "The Project's geo_coverage_type."
       :type "string"
       :enum dom.types/geo-coverage-types
       :allowEmptyValue false}}
     (apply conj [:enum] dom.types/geo-coverage-types)]
    [:checklist
     {:optional true
      :swagger {:description "The Project's checklist items."
                :type "object"
                :additionalProperties {}
                :allowEmptyValue false}}
     [:maybe map?]]
    [:answers
     {:optional true
      :swagger {:description "The Project's answers."
                :type "object"
                :additionalProperties {}
                :allowEmptyValue false}}
     [:maybe map?]]
    [:stage
     {:swagger {:description "The Project's stage."
                :type "string"
                :enum project-stages}}
     (apply conj [:enum] project-stages)]
    [:geo_coverage_countries
     {:optional true
      :swagger {:description "The Project's country reach."
                :type "array"
                :items {:type "integer"}}}
     [:sequential
      pos-int?]]
    [:geo_coverage_country_groups
     {:optional true
      :swagger {:description "The Project's country groups reach."
                :type "array"
                :items {:type "integer"}}}
     [:sequential
      pos-int?]]
    [:geo_coverage_country_states
     {:optional true
      :swagger {:description "The Project's country states reach."
                :type "array"
                :items {:type "integer"}}}
     [:sequential
      pos-int?]]
    [:source
     {:default dom.types/default-resource-source
      :encode/json name
      :encode/string name
      :swagger {:description "Source platform of the Project"
                :type "string"
                :enum dom.types/resource-source-types}}
     [:and
      keyword?
      (apply conj [:enum] dom.types/resource-source-types)]]]))
