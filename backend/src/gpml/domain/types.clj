(ns gpml.domain.types
  "Well-known domain global types definitions. These types are used
  across the domain model by several entities.")

;; TODO: Refactor enums to be keywords instead of strings.
(def ^:const review-statuses
  "Possible `review_status` values. This represent state of a domain
  model entity (Organisation, Stakeholder, Event, Policy, Technology,
  Resource, Initiative)."
  #{"APPROVED" "SUBMITTED" "REJECTED"})

;; TODO: Refactor enums to be keywords instead of strings.
(def ^:const geo-coverage-types
  "Possible `geo_coverage_type` values. This represent the geo coverage
  type of a domain model entity (Organisation, Stakeholder, Event,
  Policy, Technology, Resource, Initiative)."
  #{"global" "national" "transnational" "sub-national"})

;; TODO: Refactor enums to be keywords instead of strings.
(def ^:const association-types
  "Possible `<resource>_association` values. This represent
  association type of a domain model resource (Policy, Event,
  Technology, Resource and Initiative)."
  #{"implementor"
    "donor"
    "interested in"
    "owner"
    "resource_editor"
    "partner"})

(def ^:const default-resource-source
  "Default source type for all platform resources."
  :gpml)

(def ^:const resource-source-types
  "Source (platform) of a resource."
  #{:gpml
    :cobsea})

(def ^:const topic-entity-tables
  "The list of tables considered as topics in the current model of the
  GPML platform as of 2022-03-16."
  #{"event"
    "technology"
    "policy"
    "initiative"
    "case_study"
    "resource"})

(def ^:const topic-types
  #{"action_plan"
    "case_study"
    "event"
    "financing_resource"
    "initiative"
    "non_member_organisation"
    "organisation"
    "policy"
    "stakeholder"
    "technical_resource"
    "technology"})

(def ^:const resources-types
  "Resources types currently on the platform. Note that `resources` is
  in plural which means the set of all resources in the platform. It
  does not refer to the `resource` entity table."
  #{"event"
    "technology"
    "policy"
    "initiative"
    "case_study"
    "financing_resource"
    "technical_resource"
    "action_plan"})
