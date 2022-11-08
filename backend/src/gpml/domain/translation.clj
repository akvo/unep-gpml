(ns gpml.domain.translation)

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
