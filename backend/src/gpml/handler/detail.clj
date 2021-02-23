(ns gpml.handler.detail
  (:require [gpml.constants :as constants]
            [gpml.db.detail :as db.detail]
            [gpml.db.project :as db.project]
            [integrant.core :as ig]
            [medley.core :as medley]
            [ring.util.response :as resp]
            [gpml.db.action :as db.action]
            [gpml.db.action-detail :as db.action-detail]
            [clojure.string :as string]
            [cheshire.core :as json]))

(defn value-list [action-details]
  (map :value action-details))

(def data-queries
  {
   ;; Types of Action (43374939)
   ;; TODO: also need to add the results of cell "AO" "AP" "AQ"
   :legislation_standards {:action-code 105885205}
   :working_with_people {:action-code 105885383}
   :technology_and_processes {:action-code 105885456}
   :monitoring_and_analysis {:action-code 105885566}

   ;; Action Targets
   :target_action {:action-code 43374904}
   :action_impact_type {:action-code 43374931}
   :types_contaminants {:action-code 43374917}              ;; "all of the above"

   ;; Reporting and measurements
   :is_action_being_reported {:action-code 43374951}
   :outcome_and_impact {:action-code 43374934}

   ;;Funding Type: CE_ CF
   :funding_type {:action-code 43374920}                    ;; action detail in parent node. Should we delete if no action detail even if there is some child?
   ;Funding Name: CG
   ; (def "funding name" 43374844 :action-detail)              ;; this is under Funding type!

   ;Focus Area: Column BK_BL
   :focus_area {:action-code 43374915}

   ;Lifecycle Phase: Column BM_BN
   :lifecycle_phase {:action-code 43374916}

   ;Sector: Column BY_BZ
   :sector {:action-code 43374905}

   ;Activity Owner: Column AR, AS
   :activity_owner {:action-code 43374862}
   ;; all these are children of "activity owner"
   ;Entity Type (only the one selected):
   ;Public Administration: Column AT, AU
   ;Private Sector: Column AV, AW
   ;Third Sector: Column AX, AY

   ;Activity Term: CH_CI
   :activity_term {:action-code 43374943}

   :info_access_data {:action-detail-codes [43374788]}
   :info_monitoring_data {:action-detail-codes [43374796]}
   :info_resource_links {:action-detail-codes [43374810     ;; this is the parent of the rest
                                               43374839
                                               43374835
                                               43374837
                                               43374822
                                               43374823]
                         :format-fn #'value-list}

   ;; Amount invested and contribution are already in the project table.
   ;; They are missing the currency but right now all values are in USD, so we can hardcode it.
   ;; Amount invested
   ;:amount_invested {:amount 43374826
   ;                  :currency 43374846}
   ;; In Kind Contributions: CD – CC
   ;:in_kind_contribution {:amount 43374827
   ;                       :currency 43374836}

   })

(defonce cached-hierarchies (atom {}))

(defmethod ig/init-key ::topics [_ _]
  (apply conj [:enum] constants/topics))

(declare get-action-hierarchy)

(defn get-children [db action]
  (let [children (db.action/action-by-parent db action)]
    (when (seq children)
      (mapv (partial get-action-hierarchy db) children))))

(defn get-action-hierarchy [db action]
  (when-let [action (db.action/action-by-code db action)]
    (medley/assoc-some action
      :action-detail (db.action-detail/action-detail-by-action-id db action)
      :children (get-children db action))))

(defn keep-actions [node actions-to-keep action-details]
  (if-let [children (:children node)]
    (let [new-children (keep #(keep-actions % actions-to-keep action-details) children)
          node-with-updated-children (if (seq new-children)
                                       (assoc node :children new-children)
                                       (when (actions-to-keep (:id node))
                                         (dissoc node :children)))]
      (when node-with-updated-children
        (if-let [action-detail-to-replace (:id (:action-detail node-with-updated-children))] ;; not sure if we want to remove the node if there is no action detail but it has children
          (when-let [action-detail (get action-details action-detail-to-replace)]
            (->
              node-with-updated-children
              (dissoc :action-detail)
              (assoc :value-entered action-detail)))
          node-with-updated-children)))
    (when (actions-to-keep (:id node))
      (if-let [action-detail-to-replace (:id (:action-detail node))]
        (when-let [action-detail (get action-details action-detail-to-replace)]
          (->
            node
            (dissoc :action-detail)
            (assoc :value-entered action-detail)))
        node))))

(defn keep-action-details [action-details-to-return actions-to-keep action-details]
  (->> action-details-to-return
    (keep (fn [action-detail-to-return]
            (when-let [actual-value (get action-details (:id action-detail-to-return))]
              (assoc action-detail-to-return :value actual-value))))
    (map (fn [x] (dissoc x :code :parent :action)))))

(defn remove-extra-keys [tree]
  (-> tree
    (dissoc :code :parent)
    (medley/update-existing :children #(map remove-extra-keys %))))

(defn details-for-project [db project]
  (try
    (let [project-actions (set (map :action (db.project/project-actions-id db project)))
          project-action-details (into {}
                                   (map (juxt :action_detail :value))
                                   (db.project/project-actions-details db project))]
      (into {}
        (map
          (fn [[query-name {:keys [fn-to-retrieve-data format-fn] :or {format-fn identity}}]]
            [query-name (format-fn (fn-to-retrieve-data project-actions project-action-details))])
          @cached-hierarchies)))
    (catch Exception e
      (.printStackTrace e))))

(defn cache-hierarchies! [db]
  (reset! cached-hierarchies
    (into {}
      (map
        (fn [[query-name query]]
          [query-name (if (:action-code query)
                        (let [hierarchy (get-action-hierarchy db {:code (:action-code query)})]
                          (assoc query
                            :params hierarchy
                            :fn-to-retrieve-data (partial (comp remove-extra-keys #'keep-actions) hierarchy)))
                        (let [action-details (db.action-detail/action-detail-by-codes db {:codes (:action-detail-codes query)})]
                          (assoc query
                            :params action-details
                            :fn-to-retrieve-data (partial #'keep-action-details action-details))))]))
      data-queries)))

(defmethod ig/init-key ::get [_ {:keys [db]}]
  (cache-hierarchies! (:spec db))
  (fn [{:keys [path-params]}]
    (if-let [data (db.detail/get-detail (:spec db) (update path-params :topic-id #(Long/parseLong %)))] ;; TODO: investigate why id value is not coerced
      (resp/response (if (= "project" (:topic-type path-params))
                       (merge
                         (:json data)
                         (details-for-project (:spec db) (:json data)))
                       (:json data)))
      (resp/not-found {:message "Not Found"}))))

(comment

  (time (cache-hierarchies! (dev/db-conn)))

  ;;; Code that parses the questionnaire and matches a XLS column to a question
  ;;; example (find-action "W")
  (defn action [code]
    (first (clojure.java.jdbc/query (dev/db-conn) ["select * from action where code = ?" code])))

  (defn action-detail [code]
    (first (clojure.java.jdbc/query (dev/db-conn) ["select * from action_detail where code = ?" code])))

  (def questionnaire (json/parse-string (slurp "https://raw.githubusercontent.com/akvo/akvo-tech-consultancy/sites/unep-dashboard/sites/unep-dashboard/database/transformer/source/questionnaire.json") true))

  (def all-letters (map (comp clojure.string/upper-case str char) (range 97 123)))

  (def columns
    (concat all-letters
      (map str (repeat "A") all-letters)
      (map str (repeat "B") all-letters)
      (map str (repeat "C") all-letters)))

  (defn extract-column-id [question-str]
    (string/replace (first (string/split question-str #" ")) #"\.$" ""))

  (def xls-column-to-questions
    (into {}
      (map
        vector
        columns
        (map extract-column-id (string/split (slurp "dev/resources/questionnarie-columns.csv") #";")))))

  (defn clean-up [node]
    (->
      node
      (dissoc :dependencies :layout :show_hints :displayOptionality :data_question_visibility :label :rows :cols :size :mandatory :displayLegend :has_other :is_other)
      (assoc :xls-column (get (clojure.set/map-invert xls-column-to-questions) (:q_no node)))
      (medley.core/update-existing :options #(map (fn [option] (dissoc option :class :is_not_applicable :is_other :screen_to_message :value)) %))
      (medley.core/update-existing :children (fn [nodes] (map clean-up nodes)))))

  (defn find-action [xls-column]
    (->>
      (tree-seq
        (fn [node] (or (:children node) (:options node)))
        (fn [node] (concat (:children node) (:options node)))
        (:top_container questionnaire))
      (filter (fn [node] (= (xls-column-to-questions xls-column) (:q_no node))))
      (map clean-up)
      (map (fn [node]
             (->
               node
               (assoc :action-detail (action-detail (:id node))
                      :action (action (:id node))))))
      first))

  )
