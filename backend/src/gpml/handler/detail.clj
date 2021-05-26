(ns gpml.handler.detail
  (:require [gpml.constants :as constants]
            [gpml.db.detail :as db.detail]
            [gpml.db.project :as db.project]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [medley.core :as medley]
            [ring.util.response :as resp]
            [gpml.db.action :as db.action]
            [gpml.db.action-detail :as db.action-detail]
            gpml.db.country
            [gpml.db.country-group :as db.country-group]
            [clojure.string :as string]))

(defn other-or-name [action]
  (when-let [actual-name (or
                           (:value-entered action)
                           (:name action))]
    {:name actual-name}))

(defn first-child-replacing-other [_ action]
  (let [first-child (-> action :children first)]
    (other-or-name first-child)))

(defn value-list [_ action-details]
  (seq (map (fn [action-detail] {:name (:value action-detail)}) action-details)))

(defn all-of-the-above [all-actions action]
  (let [result (first-child-replacing-other all-actions action)]
    (seq (map other-or-name
           (if (= {:name "All of the above"} result)
             (concat
               (take-while #(not= "All of the above" (:name %)) (-> all-actions :children))
               (next (drop-while #(not= "All of the above" (:name %)) (-> action :children))))
             (:children action))))))

(defn action-reported [_ action]
  (when-let [first-child (-> action :children first)]
    (if (= "Yes" (:name first-child))
      {:reports "Yes"}
      (let [reasons (seq (map other-or-name (:children first-child)))]
        (medley/assoc-some
          {:reports (:name first-child)}
          :reasons (if (= "Not applicable" (-> action :children last other-or-name))
                     (cons {:name "Not applicable"} reasons)
                     reasons))))))

(defn nested-all-of-the-above [all-actions action]
  (let [all-sub-actions-by-id (into {} (map (juxt :id identity) (:children all-actions)))]
    (seq (map
           (fn [sub-action]
             (medley/assoc-some (other-or-name sub-action)
               :options (all-of-the-above
                          (get all-sub-actions-by-id (:id sub-action))
                          sub-action)))
           (:children action)))))

(defn monitoring [_ action]
  (seq (map
         (fn [{:keys [name value-entered]}]
           (if (= "Other" name)
             {:name value-entered}
             (cond-> {:name name}
               value-entered (assoc :options [{:name value-entered}]))))
         (:children action))))

(def data-queries
  {
   ;; Types of Action (43374939)
   ;; TODO: also need to add the results of cell "AO" "AP" "AQ" ;; Deden mentioned AE
   :legislation_standards {:action-code 105885205
                           :format-fn #'nested-all-of-the-above}
   :working_with_people {:action-code 105885383
                         :format-fn #'nested-all-of-the-above}
   :technology_and_processes {:action-code 105885456
                              :format-fn #'nested-all-of-the-above}
   :monitoring_and_analysis {:action-code 105885566
                             :format-fn #'monitoring}

   ;; Action Targets
   :target_action {:action-code 43374904
                   :format-fn #'all-of-the-above}
   :action_impact_type {:action-code 43374931
                        :format-fn #'all-of-the-above}

   :types_contaminants {:action-code 43374917
                        :format-fn #'nested-all-of-the-above}

   ;; Reporting and measurements
   :is_action_being_reported {:action-code 43374951
                              :format-fn #'action-reported}
   :outcome_and_impact {:action-code 43374934
                        :format-fn #'first-child-replacing-other}

   ;;Funding Type: CE_ CF
   :funding {:action-code 43374920
             :format-fn (fn funding [_ action]
                          (when action
                            {:types (map other-or-name (:children action))
                             :name (get action :value-entered)}))}
   ;; action detail in parent node. Should we delete if no action detail even if there is some child?
   ;Funding Name: CG
   ; (def "funding name" 43374844 :action-detail)              ;; this is under Funding type!

   ;Focus Area: Column BK_BL
   :focus_area {:action-code 43374915
                :format-fn #'all-of-the-above}

   ;Lifecycle Phase: Column BM_BN
   :lifecycle_phase {:action-code 43374916
                     :format-fn #'all-of-the-above}

   ;Sector: Column BY_BZ
   :sector {:action-code 43374905
            :format-fn #'all-of-the-above}

   ;Activity Owner: Column AR, AS
   :activity_owner {:action-code 43374862
                    :format-fn #'nested-all-of-the-above}
   ;; all these are children of "activity owner"
   ;Entity Type (only the one selected):
   ;Public Administration: Column AT, AU
   ;Private Sector: Column AV, AW
   ;Third Sector: Column AX, AY

   ;Activity Term: CH_CI
   :activity_term {:action-code 43374943
                   :format-fn #'first-child-replacing-other}
   :currency_amount_invested {:action-detail-codes [43374846]
                              :format-fn #'value-list}
   :currency_in_kind_contribution {:action-detail-codes [43374836]
                                   :format-fn #'value-list}

   :info_access_data {:action-detail-codes [43374788]
                      :format-fn #'value-list}
   :info_monitoring_data {:action-detail-codes [43374796]
                          :format-fn #'value-list}
   :info_resource_links {:action-detail-codes [43374810     ;; this is the parent of the rest
                                               43374839
                                               43374835
                                               43374837
                                               43374822
                                               43374823]
                         :format-fn #'value-list}

   :organisation {:action-detail-codes [43374842]
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

(defn keep-action-details [action-details-to-return _ action-details]
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
  (let [project-actions (set (map :action (db.project/project-actions-id db project)))
        project-action-details (into {}
                                 (map (juxt :action_detail :value))
                                 (db.project/project-actions-details db project))
        triplets (map
                   (fn [[query-name {:keys [fn-to-retrieve-data format-fn format-params]}]]
                     (let [db-value (fn-to-retrieve-data project-actions project-action-details)]
                       [query-name
                        (if format-fn
                          (format-fn format-params db-value)
                          db-value)
                        db-value]))
                   @cached-hierarchies)]
    (into {} (cons
               [:raw (into {} (map (juxt first last) triplets))]
               (map (juxt first second) triplets)))))

(defn cache-hierarchies! [db]
  (reset! cached-hierarchies
    (into {}
      (map
        (fn [[query-name query]]
          [query-name (if (:action-code query)
                        (let [hierarchy (get-action-hierarchy db {:code (:action-code query)})]
                          (assoc query
                            :format-params hierarchy
                            :fn-to-retrieve-data (partial (comp remove-extra-keys #'keep-actions) hierarchy)))
                        (let [action-details (db.action-detail/action-detail-by-codes db {:codes (:action-detail-codes query)})]
                          (assoc query
                            :format-params action-details
                            :fn-to-retrieve-data (partial #'keep-action-details action-details))))]))
      data-queries)))

(defmulti extra-details (fn [topic-type _ _] topic-type) :default :nothing)

(defmethod extra-details "project" [_ db project]
  (if (> (:id project) 10000)
    (db.initiative/initiative-detail-by-id db project)
    (details-for-project db project)))

(defmethod extra-details "policy" [_ db policy]
  (when-let [implementing-mea (:implementing_mea policy)]
    {:implementing_mea (:name (db.country-group/country-group-by-id db {:id implementing-mea}))}))

(defmethod extra-details "technology" [_ db technology]
  (when-let [headquarters-country (:country technology)]
    {:headquarters (gpml.db.country/country-by-id db {:id headquarters-country})}))

(defmethod extra-details "stakeholder" [_ db stakeholder]
    (:data (db.detail/get-stakeholder-tags db stakeholder)))

(defmethod extra-details :nothing [_ _ _]
  nil)

(defmethod ig/init-key ::get [_ {:keys [db]}]
  (cache-hierarchies! (:spec db))
  (fn [{{:keys [path]} :parameters jwt-claims :jwt-claims}]
    (let [conn (:spec db)
          topic (:topic-type path)
          public-topic? (not (contains? constants/approved-user-topics topic))
          authorized? (or public-topic?
                          (and (:email jwt-claims)
                               (= "APPROVED"
                                  (:review_status
                                   (db.stakeholder/stakeholder-by-email conn jwt-claims)))))]
      (if-let [data (and authorized? (db.detail/get-detail conn path))]
        (resp/response (merge
                        (:json data)
                        (extra-details topic conn  (:json data))))
        (resp/not-found {:message "Not Found"})))))

#_:clj-kondo/ignore
(comment


  ;;; Code that parses the questionnaire and matches a XLS column to a question
  ;;; example (find-action "W")
  (require 'clojure.java.jdbc)
  (require 'dev)
  (require 'clojure.set)
  (time (cache-hierarchies! (dev/db-conn)))

  (->>
   (range 1 276)
   (pmap
    #(json/parse-string (slurp (str "http://localhost:3000/api/detail/policy/" %)) true))
                                        ;(map (juxt :id :funding))
                                        ;(filter second)
                                        ;(pmap :children)
                                        ;(map first)
                                        ;(clojure.pprint/print-table )
   (def all)
   deref
   )


  (do

    (->> all
         (map second)
                                        ;(filter (fn [xxx] (medley/find-first (fn [x] (= "All of the above" (:name x))) (:children xxx))))
                                        ;(filter (fn [xxxx] (= 1 (count (:children xxxx)))))
                                        ;(remove (fn [xxxx] (=  {:id 100, :name "Reporting and Evaluations", :children [{:id 101, :name "Yes"}]} xxxx)))
         (map (juxt
               identity
               (partial nested-all-of-the-above (-> cached-hierarchies deref :working_with_people :format-params))))
         ))



  (get-action-hierarchy (dev/db-conn) {:code 43374905})

  (do
    (require '[cheshire.core :as json])
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
       first)))

  )
