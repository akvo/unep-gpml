(ns gpml.handler.enums
  (:require [gpml.domain.policy :as dom.policy]
            [gpml.domain.related-content :as dom.rc]
            [gpml.domain.types :as dom.types]
            [gpml.handler.responses :as r]
            [integrant.core :as ig]))

(def ^:private get-enums-path-params-schema
  [:map
   [:entity-type
    {:swagger {:description "Target entity type to get the enums from."
               :type "string"
               :enum dom.types/get-enums-entity-types}
     :decode/string keyword
     :decode/json keyword}
    (apply conj [:enum] dom.types/get-enums-entity-types)]])

(defmulti ^:private entity-type-available-enums
  "Return available enum values for the given entity type"
  identity)

(defmethod entity-type-available-enums :policy
  [_]
  {:type-of-law dom.policy/types-of-laws
   :status dom.policy/statuses
   :geo-coverage-type dom.types/geo-coverage-types
   :review-status dom.types/review-statuses
   :sub-content-type dom.policy/sub-content-types
   :related-content-resource-type dom.rc/resource-types
   :related-content-relation-type dom.rc/relation-types
   :connections-association-type dom.types/association-types
   :source dom.types/resource-source-types})

(defn get-entity-type-enums
  [{{:keys [path]} :parameters}]
  (let [entity-type (:entity-type path)]
    (entity-type-available-enums entity-type)))

(defmethod ig/init-key :gpml.handler.enums/get
  [_ _]
  (fn [req]
    (r/ok
     {:enums (get-entity-type-enums req)})))

(defmethod ig/init-key :gpml.handler.enums/get-params
  [_ _]
  {:path get-enums-path-params-schema})
