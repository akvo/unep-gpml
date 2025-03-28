(ns gpml.domain.types
  "Well-known domain global types definitions. These types are used
  across the domain model by several entities."
  (:require
   [malli.core :as m]))

;; TODO: Refactor enums to be keywords instead of strings.
(def review-statuses
  "Possible `review_status` values. This represent state of a domain
  model entity (Organisation, Stakeholder, Event, Policy, Technology,
  Resource, Initiative)."
  #{"APPROVED" "SUBMITTED" "REJECTED"})

(def reviewer-review-statuses
  "Possible `reviewer_review_status` values. This represent the state of
  each review submitted to the platform."
  #{"ACCEPTED" "PENDING" "REJECTED"})

;; TODO: Refactor enums to be keywords instead of strings.
(def geo-coverage-types
  "Possible `geo_coverage_type` values. This represent the geo coverage
  type of a domain model entity (Organisation, Stakeholder, Event,
  Policy, Technology, Resource, Initiative)."
  #{"global" "national" "transnational" "sub-national"})

;; TODO: Refactor enums to be keywords instead of strings.
(def association-types
  "Possible `<resource>_association` values. This represent
  association type of a domain model resource (Policy, Event,
  Technology, Resource and Initiative)."
  #{"implementor"
    "donor"
    "interested in"
    "owner"
    "resource_editor"
    "partner"})

(def default-resource-source
  "Default source type for all platform resources."
  :gpml)

(def resource-source-types
  "Source (platform) of a resource."
  #{:gpml
    :cobsea})

(def topic-entity-tables
  "The list of tables considered as topics in the current model of the
  GPML platform as of 2022-03-16."
  #{"event"
    "technology"
    "policy"
    "initiative"
    "case_study"
    "project"
    "resource"})

(def topic-types
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
    "technology"
    "data_catalog"
    "project"})

(def resources-types
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
    "action_plan"
    "data_catalog"
    "project"})

(def plastic-strategy-bookmarkable-entity-types
  (set (map keyword (conj topic-entity-tables "organisation"))))

(def badge-assignable-entity-types
  (set (map keyword (conj topic-entity-tables "organisation" "stakeholder" "project"))))

(def file-visibility
  "Informs about a file's accessability privilegies."
  #{:private
    :public})

(def chat-account-statuses
  #{:pending-activation
    :active
    :inactive})

(def plastic-strategy-team-types
  #{:steering-committee
    :project-team})

(def plastic-strategy-team-roles
  #{:viewer
    :editor
    :admin})

(def badge-type
  #{:country-verified
    :verified
    :expert-verified
    :focal-point-verified
    :partner-verified
    :coe-verified})

(def enum-types
  {:review-status review-statuses
   :reviewer-status reviewer-review-statuses
   :geo-coverage-type geo-coverage-types
   :association-type association-types
   :resource-source resource-source-types
   :topic-entity-table topic-entity-tables
   :topic-type topic-types
   :resource-type resources-types
   :file-visibility file-visibility
   :chat-account-status chat-account-statuses
   :plastic-strategy-team-type plastic-strategy-team-types
   :plastic-strategy-team-role plastic-strategy-team-roles
   :plastic-strategy-bookmarkable-entity-type plastic-strategy-bookmarkable-entity-types
   :badge-assignable-entity-type badge-assignable-entity-types
   :badge-type badge-type})

(defn get-type-schema [type-name]
  (m/schema
   [:and
    [:keyword]
    (apply conj [:enum] (get enum-types type-name))]))
