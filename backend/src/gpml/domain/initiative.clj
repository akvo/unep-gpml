(ns gpml.domain.initiative
  (:require
   [clojure.set :as set]
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
    [:id [:int {:min 1}]]
    [:uuid [:string {:min 1}]]
    [:version [:int {:min 1}]]
    [:created_by [:int {:min 1}]]
    [:reviewed_at inst?]
    [:reviewed_by [:int {:min 1}]]
    [:review_status (dom.types/get-type-schema :review-status)]
    ;;============ TODO: this model needs a refactor =================
    [:q1 coll?]
    [:q2 coll?]
    [:q3 coll?]
    [:q4 coll?]
    [:q4_1_1 coll?]
    [:q4_1_2 coll?]
    [:q4_2_1 coll?]
    [:q4_2_2 coll?]
    [:q4_3_1 coll?]
    [:q4_3_2 coll?]
    [:q4_4_1 coll?]
    [:q4_4_2 coll?]
    [:q4_4_3 coll?]
    [:q4_4_4 coll?]
    [:q4_4_5 coll?]
    [:q5 coll?]
    [:q6 coll?]
    [:q7 coll?]
    [:q7_1_0 coll?]
    [:q7_1_1 coll?]
    [:q7_1_2 coll?]
    [:q7_2 coll?]
    [:q7_3 coll?]
    [:q8 coll?]
    [:q9 coll?]
    [:q10 coll?]
    [:q11 coll?]
    [:q12 coll?]
    [:q13 coll?]
    [:q14 coll?]
    [:q15 coll?]
    [:q16 coll?]
    [:q17 coll?]
    [:q18 coll?]
    [:q19 coll?]
    [:q20 coll?]
    [:q21 coll?]
    [:q22 coll?]
    [:q23 coll?]
    [:q24 coll?]
    [:q24_1 coll?]
    [:q24_2 coll?]
    [:q24_3 coll?]
    [:q24_4 coll?]
    [:q24_5 coll?]
    [:q26 coll?]
    [:q27 coll?]
    [:q28 coll?]
    [:q29 coll?]
    [:q30 coll?]
    [:q31 coll?]
    [:q32 coll?]
    [:q33 coll?]
    [:q34 coll?]
    [:q35 coll?]
    [:q36 coll?]
    [:q36_1 coll?]
    [:q37 coll?]
    [:q37_1 coll?]
    [:q38 coll?]
    [:q39 coll?]
    [:q40 coll?]
    [:q41 coll?]
    [:q41_1 coll?]
    [:q1_1 coll?]
    [:q35_1 coll?]
    [:q1_1_1 coll?]
    ;;============ TODO: this model needs a refactor =================
    [:url
     [:and
      [:string {:min 1}]
      [:fn util/try-url-str]]]
    [:info_docs [:string {:min 1}]]
    [:sub_content_type [:string {:min 1}]]
    [:q24_subnational_city [:string {:min 1}]]
    [:document_preview [:boolean]]
    [:featured [:boolean]]
    [:language [:string {:min 2, :max 3}]]
    [:capacity_building [:boolean]]
    [:brs_api_id [:string {:min 1}]]
    [:brs_api_modified inst?]
    [:start_date inst?]
    [:end_date inst?]
    [:status [:string {:min 1}]]
    [:objectives [:string {:min 1}]]
    [:activities [:string {:min 1}]]
    [:source
     {:default dom.types/default-resource-source}
     (dom.types/get-type-schema :resource-source)]
    [:image_id [:uuid]]
    [:thumbnail_id [:uuid]]]))

(defn- question-answer->initiative-prop [question-answer]
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

(def ^:private initiative-rename-key-mapping
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
