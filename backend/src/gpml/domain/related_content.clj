(ns gpml.domain.related-content)

(def ^:const resource-types
  "Allowed resource types for related content. Note that `resource`
  entity is treated differently and it's subtypes are used instead of
  the table name to define domain level resource types. This is not
  true at persistence level where we MUST convert the names to the
  correct table names."
  #{"policy"
    "event"
    "initiative"
    "technology"
    "financing_resource"
    "technical_resource"
    "action_plan"
    "case_study"})

(def ^:const relation-types
  "Possible resource relation types.

  NOTE: Currently the types refer to a relationship between two
  policies."
  #{"implements"
    "amends"
    "repeals"})

(def RelatedContent
  "The Related Content entity."
  [:map
   [:resource_id pos-int?]
   [:resource_table_name (apply conj [:enum] resource-types)]
   [:related_resource_id pos-int?]
   [:related_resource_table_name (apply conj [:enum] resource-types)]
   [:related_content_relation_type]])
