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

(def ^:const default-resource-source :gpml)

(def ^:const resource-source-types
  "Source (platform) of a resource."
  #{:gpml
    :cobsea})
