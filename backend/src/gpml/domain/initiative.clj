(ns gpml.domain.initiative
  (:require [clojure.set :as set]
            [gpml.domain.types :as dom.types]
            [gpml.util :as util]
            [malli.core :as m]))

(def Initiative
  "The Initiative entity schema. Not all fields for initiative are
  described here as they are subject to be removed and replaced by non
  JSONB fields (fields starting with `q` which means they are a
  question from the FE quiz)."
  (m/schema
   [:map
    [:id pos-int?]
    [:q2 [string? {:min 1}]]
    [:q3 [string? {:min 1}]]
    [:q36 double?]
    [:url
     [:and
      [string? {:min 1}]
      [:fn util/try-url-str]]]
    [:geo_coverage_type (apply conj [:enum] dom.types/geo-coverage-types)]
    [:status [string? {:min 1}]]
    [:objectives [string? {:min 1}]]
    [:activities [string? {:min 1}]]
    [:qimage [string? {:min 1}]]
    [:brs_api_id [string? {:min 1}]]
    [:brs_api_modified inst?]
    [:source {:default dom.types/default-resource-source}
     (apply conj [:enum] dom.types/resource-source-types)]]))

(defn- question-answer->initiative-prop
  [question-answer]
  (->> (if (map? question-answer)
         [question-answer]
         question-answer)
       (map (fn [v]
              {:name (cond
                       (map? v) (first (vals v))
                       (vector? v) (first v)
                       :else
                       v)}))
       distinct))

(def ^:const ^:private initiative-rename-key-mapping
  {:q40 :info_resource_links
   :q4 :main_focus
   :q16 :main_activity_owner
   :q1_1 :organisation
   :q36_1 :currency_amount_invested
   :q37_1 :currency_in_kind_contribution
   :q38 :activity_term
   :q5 :is_action_being_reported
   :q26 :lifecycle_phase
   :q11 :outcome_and_impacts
   :q28 :focus_area
   :q30 :sector})

(defn parse-initiative-details
  "Parses initiative details, form questions' answers into initiative
  properties."
  [initiative-details]
  (-> initiative-details
      (util/update-if-not-nil :q16 question-answer->initiative-prop)
      (util/update-if-not-nil :q4 question-answer->initiative-prop)
      (util/update-if-not-nil :q1_1 question-answer->initiative-prop)
      (util/update-if-not-nil :q40 question-answer->initiative-prop)
      (util/update-if-not-nil :q30 question-answer->initiative-prop)
      (util/update-if-not-nil :q26 question-answer->initiative-prop)
      (util/update-if-not-nil :q36_1 question-answer->initiative-prop)
      (util/update-if-not-nil :q37_1 question-answer->initiative-prop)
      (util/update-if-not-nil :q28 question-answer->initiative-prop)
      (util/update-if-not-nil :q11 question-answer->initiative-prop)
      (util/update-if-not-nil :q38 question-answer->initiative-prop)
      (util/update-if-not-nil :q5 question-answer->initiative-prop)
      (util/update-if-not-nil :q20 question-answer->initiative-prop)
      (util/update-if-not-nil :q35 question-answer->initiative-prop)
      (set/rename-keys initiative-rename-key-mapping)))
