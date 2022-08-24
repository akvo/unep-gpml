(ns gpml.domain.project
  (:require [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [malli.core :as m]))

(def project-types
  "Possible values for `project-type`."
  #{"action-plan"})

(def Project
  "The Project entity model."
  (m/schema
   [:map
    [:id
     {:swagger
      {:description "The Project's identifier"
       :type "string"
       :format "uuid"
       :allowEmptyValue false}}
     uuid?]
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
     [:maybe map?]]]))

(defn create-project
  "Creates a new project entity adding the necessary default and unique
  values."
  [data]
  (assoc data :id (util/uuid)))
