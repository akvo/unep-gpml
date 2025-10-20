(ns gpml.domain.translation)

;; Legacy mapping for existing translation handler and BRS importer
;; Uses keyword keys (:policy, :event, etc.)
;; For each entity type here there are registered all the allowed translatable fields.
;; However, right now the support is only given for resources."
(defonce translatable-fields-by-entity
  {:policy #{:title :abstract :info_docs}
   :event #{:title :description :info_docs}
   :resource #{:title :value_remarks :summary :info_docs}
   :technology #{:title :remarks :info_docs}
   :initiative #{:q2 :q3 :title :info_docs :summary :other_leg_stand_rules :other_working_with_people
                 :other_tech_and_proc :other_monitoring :monitoring_protocol :monitored_data_access
                 :other_report_progress :other_reported_entity_progress :other_outcome_impact_eval
                 :kpis :co_benefits :other_lifecycle :other_impact_harm :other_sector
                 :other_funding :other_duration}
   :case_study #{:title :description}})

;; New mapping for bulk translation system (auto-translate feature)
;; Uses string keys to match gpml.domain.types/topic-types
;; Includes all translatable fields for each topic type
(def translatable-fields-by-topic
  "Translatable fields for each topic type (for bulk translation system).
   Uses string keys to match gpml.domain.types/topic-types.

   Key differences from translatable-fields-by-entity:
   - String keys instead of keyword keys ('policy' vs :policy)
   - Includes 'remarks' field for policy, event, resource
   - Includes resource sub-types (financing_resource, technical_resource, action_plan, data_catalog)
   - Includes 'project' type (added in migration 223)
   - Uses 'name' for technology (not 'title') to match database column

   Note: Resource sub-types all use the same fields as 'resource' since they map to the resource table."
  {"policy"               #{:title :abstract :remarks :info_docs}
   "event"                #{:title :description :remarks :info_docs}
   "resource"             #{:title :summary :remarks :value_remarks :info_docs}
   "financing_resource"   #{:title :summary :remarks :value_remarks :info_docs}
   "technical_resource"   #{:title :summary :remarks :value_remarks :info_docs}
   "action_plan"          #{:title :summary :remarks :value_remarks :info_docs}
   "data_catalog"         #{:title :summary :remarks :value_remarks :info_docs}
   "technology"           #{:name :remarks :info_docs}
   "initiative"           #{:q2 :q3 :q4 :q5 :q6 :q7 :q8 :q9 :q10 :q11 :q12 :q13 :q14
                            :q15 :q16 :q17 :q18 :q19 :q20 :q21 :q22 :q23 :q24
                            :title :summary :info_docs}
   "case_study"           #{:title :description}
   "project"              #{:title :description :summary}})

(def topic-type->table
  "Maps topic types to their database table names.
   Resource sub-types (financing_resource, technical_resource, action_plan, data_catalog)
   all map to the 'resource' table."
  {"policy"               "policy"
   "event"                "event"
   "resource"             "resource"
   "financing_resource"   "resource"
   "technical_resource"   "resource"
   "action_plan"          "resource"
   "data_catalog"         "resource"
   "technology"           "technology"
   "initiative"           "initiative"
   "case_study"           "case_study"
   "project"              "project"})
