(ns gpml.handler.detail
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [duct.logger :refer [log]]
            [gpml.constants :as constants]
            [gpml.db.action :as db.action]
            [gpml.db.action-detail :as db.action-detail]
            [gpml.db.country]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.detail :as db.detail]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.language :as db.language]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.policy :as db.policy]
            [gpml.db.project :as db.project]
            [gpml.db.resource.connection :as db.resource.connection]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.db.submission :as db.submission]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.image :as handler.image]
            [gpml.handler.initiative :as handler.initiative]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.resource.permission :as handler.res-permission]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.handler.util :as util]
            [gpml.model.topic :as model.topic]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [medley.core :as medley]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

;;========================================START OF DEPRECATED CODE==============================================================
;; FIXME: The code below doesn't seem to be used anyhwere anymore and
;; we discuss it's removal. We need to take into consideration the
;; foundations for it however.

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
  {;; Types of Action (43374939)
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

(defmethod ig/init-key :gpml.handler.detail/topics [_ _]
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
;;========================================END OF DEPRECATED CODE==============================================================

(defn- resolve-resource-type
  [resource-type]
  (cond
    (some #{resource-type} constants/resource-types)
    "resource"

    :else resource-type))

(defn expand-related-content [db resource-id resource-table-name]
  (let [related-contents
        (handler.resource.related-content/get-related-contents db
                                                               resource-id
                                                               resource-table-name)]
    (reduce
     (fn [acc {id :id resource-type :type :as related-content}]
       (let [resource-type (resolve-resource-type resource-type)
             entity-connections
             (db.resource.connection/get-resource-entity-connections db {:resource-id id
                                                                         :resource-type resource-type})
             stakeholder-connections
             (->> (db.resource.connection/get-resource-stakeholder-connections db {:resource-id id
                                                                                   :resource-type resource-type})
                  (map (fn [sc] (dissoc (merge sc (handler.stakeholder.tag/unwrap-tags sc)) :tags))))]
         (conj acc (merge related-content {:entity_connections entity-connections
                                           :stakeholder_connections stakeholder-connections}))))
     []
     related-contents)))

(defn- add-extra-details
  [db {:keys [id affiliation] :as resource} resource-type
   {:keys [tags? entity-connections? stakeholder-connections? related-content? affiliation?]
    :or {tags? true entity-connections? true
         stakeholder-connections? true related-content? true
         affiliation? false}}]
  (cond-> resource
    tags?
    (assoc :tags (db.resource.tag/get-resource-tags db {:table (str (resolve-resource-type resource-type) "_tag")
                                                        :resource-col (resolve-resource-type resource-type)
                                                        :resource-id id}))

    entity-connections?
    (assoc :entity_connections (db.resource.connection/get-resource-entity-connections db {:resource-id id
                                                                                           :resource-type (resolve-resource-type resource-type)}))

    stakeholder-connections?
    (assoc :stakeholder_connections (->> (db.resource.connection/get-resource-stakeholder-connections db {:resource-id id
                                                                                                          :resource-type (resolve-resource-type resource-type)})
                                         (map (fn [sc] (dissoc (merge sc (handler.stakeholder.tag/unwrap-tags sc)) :tags)))))

    related-content?
    (assoc :related_content (expand-related-content db id (resolve-resource-type resource-type)))

    (and affiliation? affiliation)
    (assoc :affiliation (db.organisation/organisation-by-id db {:id affiliation}))

    true
    (assoc :type resource-type)))

(defmulti extra-details (fn [resource-type _ _] resource-type) :default :nothing)

(defmethod extra-details "initiative" [resource-type db initiative]
  (merge
   (add-extra-details db initiative resource-type {})
   {:geo_coverage_type (-> initiative :geo_coverage_type ffirst)}
   (db.initiative/initiative-detail-by-id db initiative)))

(defmethod extra-details "policy" [resource-type db policy]
  (merge
   (add-extra-details db policy resource-type {})
   {:language (db.policy/language-by-policy-id db (select-keys policy [:id]))}
   (when-let [implementing-mea (:implementing_mea policy)]
     {:implementing_mea (:name (db.country-group/country-group-by-id db {:id implementing-mea}))})))

(defmethod extra-details "technology" [resource-type db technology]
  (merge
   (add-extra-details db technology resource-type {})
   (when-let [headquarters-country (:country technology)]
     {:headquarters (gpml.db.country/country-by-id db {:id headquarters-country})})))

(defmethod extra-details "technical_resource" [resource-type db resource]
  (add-extra-details db resource resource-type {}))

(defmethod extra-details "financing_resource" [resource-type db resource]
  (add-extra-details db resource resource-type {}))

(defmethod extra-details "action_plan" [resource-type db resource]
  (add-extra-details db resource resource-type {}))

(defmethod extra-details "event" [resource-type db event]
  (add-extra-details db event resource-type {}))

(defmethod extra-details "organisation" [resource-type db organisation]
  (add-extra-details db organisation resource-type {:tags? true
                                                    :entity-connections? false
                                                    :stakeholder-connections? false
                                                    :related-content? false}))

(defmethod extra-details "stakeholder" [resource-type db stakeholder]
  (let [details (add-extra-details db stakeholder resource-type {:tags? true
                                                                 :entity-connections? false
                                                                 :stakeholder-connections? false
                                                                 :related-content? false
                                                                 :affiliation? true})]
    (merge details (handler.stakeholder.tag/unwrap-tags details))))

(defmethod extra-details :nothing [_ _ _]
  nil)

(def not-nil-name #(vec (filter :name %)))

(defn adapt [data]
  (-> data
      (update :organisation (fn [orgs]
                              (let [clean-orgs (vec (filter :name orgs))]
                                (if (= [] clean-orgs)
                                  (vec (filter :name (:non_member_organisation data)))
                                  clean-orgs))))
      (update :lifecycle_phase not-nil-name)
      (update :sector not-nil-name)
      (update :funding #(when (:name %) %))
      (update :outcome_and_impact not-nil-name)
      (update :focus_area not-nil-name)
      (update :currency_amount_invested not-nil-name)
      (update :currency_in_kind_contribution not-nil-name)
      (update :activity_owner not-nil-name)
      (update :activity_term (fn [x] (when (:name x) x)))
      (update :is_action_being_reported #(when (:reports %) %))))

(defn- common-queries
  [table {:keys [topic-id]} & [geo url tags related-content]]
  (filter some?
          [(when geo [(format "delete from %s_geo_coverage where %s = ?" table table) topic-id])
           (when url [(format "delete from %s_language_url where %s = ?" table table) topic-id])
           (when tags [(format "delete from %s_tag where %s = ?" table table) topic-id])
           (when related-content ["delete from related_content
            where (resource_id = ? and resource_table_name = ?::regclass)
            or (related_resource_id = ? and related_resource_table_name = ?::regclass)"
                                  topic-id table topic-id table])
           (when (= "organisation" table)
             ["delete from resource_organisation where organisation=?" topic-id])
           (when (= "resource" table)
             ["delete from resource_organisation where resource=?" topic-id])
           [(format "delete from %s where id = ?" table) topic-id]]))

(defmethod ig/init-key :gpml.handler.detail/delete [_ {:keys [db logger]}]
  (fn [{{:keys [path]} :parameters approved? :approved? user :user}]
    (try
      (let [conn        (:spec db)
            topic-id    (:topic-id path)
            topic       (resolve-resource-type (:topic-type path))
            authorized? (and (or (model.topic/public? topic) approved?)
                             (some? (handler.res-permission/get-resource-if-allowed conn user topic topic-id {:read? false})))
            sqls (condp = topic
                   "policy" (common-queries topic path true false true true)
                   "event" (common-queries topic path true true true true)
                   "technology" (common-queries topic path true true true true)
                   "organisation" (common-queries topic path true false true false)
                   "stakeholder" [["delete from stakeholder where id = ?" (:topic-id path)]]
                   "initiative" (common-queries topic path true false true true)
                   "resource" (common-queries topic path true true true true))]
        (if authorized?
          (resp/response (do
                           (jdbc/with-db-transaction [tx-conn conn]
                             (doseq [s sqls]
                               (jdbc/execute! tx-conn s)))
                           {:deleted {:topic-id (:topic-id path)
                                      :topic topic}}))
          util/unauthorized))
      (catch Exception e
        (log logger :error ::delete-resource-failed {:exception-message (.getMessage e)
                                                     :context-data path})
        (if (instance? SQLException e)
          {:status 500
           :body {:success? false
                  :reason :could-not-delete-resource
                  :error-details {:error-type (pg-util/get-sql-state e)}}}
          {:status 500
           :body {:success? false
                  :reason :could-not-delete-resource
                  :error-details {:error-message (.getMessage e)}}})))))

(defn- get-detail
  [conn table-name id opts]
  (let [opts (merge opts {:topic-type table-name :topic-id id})
        {:keys [json] :as result}
        (if (some #{table-name} ["organisation" "stakeholder"])
          (db.detail/get-entity-details conn opts)
          (db.detail/get-topic-details conn opts))]
    (-> result
        (dissoc :json)
        (merge json))))

(defmethod ig/init-key :gpml.handler.detail/get
  [_ {:keys [db logger]}]
  (fn [{{:keys [path query]} :parameters approved? :approved? user :user}]
    (try
      (let [conn (:spec db)
            topic (:topic-type path)
            id (:topic-id path)
            authorized? (and (or (model.topic/public? topic) approved?)
                             (some? (handler.res-permission/get-resource-if-allowed conn
                                                                                    user
                                                                                    (resolve-resource-type topic)
                                                                                    id
                                                                                    {:read? true})))]
        (if authorized?
          (if-let [data (get-detail conn topic id query)]
            (resp/response (merge
                            (adapt (merge
                                    (case topic
                                      "technology" (dissoc data :tags :remarks :name)
                                      (dissoc data :tags :abstract :description))
                                    (extra-details topic conn data)))
                            {:owners (:owners data)}))
            util/not-found)
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-get-resource-details {:exception-message (.getMessage e)
                                                             :context-data {:path-params path
                                                                            :user user}})
        (if (instance? SQLException e)
          {:status 500
           :body {:success? true
                  :reason (pg-util/get-sql-state e)}}
          {:status 500
           :body {:success? true
                  :reason :could-not-get-resource-details
                  :error-details {:error (.getMessage e)}}})))))

(def put-params
  ;; FIXME: Add validation
  ;; -- Cannot be empty, for one.
  [:map])

(defn update-resource-tags
  "Updates the resource tags and creating new ones if provided. Note
  that the `tag-category` is `general`."
  [conn logger mailjet-config table id tags]
  (handler.resource.tag/update-resource-tags conn logger mailjet-config {:tags tags
                                                                         :resource-name table
                                                                         :resource-id id
                                                                         :tag-category "general"}))

(defn update-resource-language-urls [conn table id urls]
  ;; Delete any existing lanugage URLs
  (db.detail/delete-resource-related-data
   conn
   {:table (str table "_language_url") :resource_type table :id id})

  ;; Create language URLs for the resource
  (when (seq urls)
    (db.detail/add-resource-related-language-urls
     conn
     {:table (str table "_language_url")
      :resource_type table
      :urls (map #(list id
                        (:id (db.language/language-by-iso-code conn {:iso_code (:lang %)}))
                        (:url %))
                 urls)})))

(defn update-resource-geo-coverage-values [conn table id geo_data]
  ;; Delete any existing geo coverage values
  (db.detail/delete-resource-related-data
   conn
   {:table (str table "_geo_coverage") :resource_type table :id id})

  ;; Create geo coverage values for the resource
  (when (or (seq (:geo_coverage_country_groups geo_data))
            (seq (:geo_coverage_countries geo_data)))
    (db.detail/add-resource-related-geo
     conn
     {:table (str table "_geo_coverage")
      :resource_type table
      :geo (handler.geo/get-geo-vector-v2 id geo_data)})))

(defn update-resource-organisation [conn table id org-id]
  ;; Delete any existing org
  (db.detail/delete-resource-related-data
   conn
   {:table (str table "_organisation") :resource_type table :id id})

  ;; Create organisation mapping for the resource
  (when org-id
    (db.detail/add-resource-related-org
     conn
     {:table (str table "_organisation")
      :resource_type table
      :id id
      :organisation org-id})))

(defn -update-blank-resource-picture [conn image-type resource-id image-key]
  (db.detail/update-resource-table
   conn
   {:table image-type :id resource-id :updates {image-key ""}}))

(defn -update-resource-picture [conn image image-type resource-id image-key]
  (let [url (handler.image/assoc-image conn image image-type)]
    (when-not (and image (= image url))
      (db.detail/update-resource-table
       conn
       {:table image-type :id resource-id :updates {image-key url}}))))

(defn update-resource-image [conn image image-key image-type resource-id]
  (if (empty? image)
    (-update-blank-resource-picture conn image-type resource-id image-key)
    (-update-resource-picture conn image image-type resource-id image-key)))

(defn expand-associations
  [connections stakeholder-type topic topic-id]
  (vec (for [connection connections]
         (let [{:keys [id role]} connection
               stakeholder-type-column (if (= stakeholder-type "organisation")
                                         {:organisation (:entity connection)}
                                         {:stakeholder (:stakeholder connection)})]
           (if (pos-int? id)
             {:id id
              :table (str stakeholder-type "_" topic)
              :topic topic
              :updates (merge stakeholder-type-column {(keyword topic) topic-id
                                                       :association role})}
             (merge stakeholder-type-column {:column_name topic
                                             :topic topic
                                             :topic_id topic-id
                                             :association role
                                             :remarks nil}))))))

(defn get-association-query-params [stakeholder-type topic topic-id]
  {:column_name topic
   :topic_id topic-id
   :table (str stakeholder-type "_" topic)})

(defn update-resource-connections [conn entity_connections individual_connections topic resource-id]
  (let [existing-ecs (db.favorite/get-associations conn (get-association-query-params "organisation" topic resource-id))
        delete-ecs (vec (set/difference
                         (into #{} (map #(:id %) existing-ecs))
                         (into #{} (remove nil? (map #(:id %) entity_connections)))))
        existing-ics (db.favorite/get-associations conn (get-association-query-params "stakeholder" topic resource-id))
        delete-ics (vec (set/difference
                         (into #{} (map #(:id %) existing-ics))
                         (into #{} (remove nil? (map #(:id %) individual_connections)))))]
    (when-not (empty? delete-ecs)
      (db.favorite/delete-associations conn {:table (str "organisation_" topic)
                                             :ids delete-ecs}))
    (when-not (empty? delete-ics)
      (db.favorite/delete-associations conn {:table (str "stakeholder_" topic)
                                             :ids delete-ics}))
    (when (not-empty individual_connections)
      (doseq [association (expand-associations individual_connections "stakeholder" topic resource-id)]
        (if (contains? association :id)
          (db.favorite/update-stakeholder-association conn association)
          (db.favorite/new-stakeholder-association conn association))))
    (when (not-empty entity_connections)
      (doseq [association (expand-associations entity_connections "organisation" topic resource-id)]
        (if (contains? association :id)
          (db.favorite/update-stakeholder-association conn association)
          (db.favorite/new-organisation-association conn association))))))

(defn update-resource [conn logger mailjet-config topic-type id updates]
  (let [table (cond
                (contains? constants/resource-types topic-type) "resource"
                :else topic-type)
        table-columns (-> updates
                          (dissoc
                           :tags :urls :geo_coverage_value :org
                           :image :photo :logo :language :thumbnail
                           :geo_coverage_country_groups
                           :geo_coverage_countries
                           :entity_connections :related_content
                           :individual_connections
                           :resource_type)
                          (merge (when (:topics updates)
                                   {:topics (pg-util/->JDBCArray (:topics updates) "text")}))
                          (set/rename-keys {:geo_coverage_value_subnational_city :subnational_city}))
        tags (remove nil? (:tags updates))
        urls (remove nil? (:urls updates))
        params {:table table
                :id id
                :updates table-columns
                :entity-type topic-type}
        status (db.detail/update-resource-table conn params)
        org (:org updates)
        org-id (and org
                    (or
                     (:id org)
                     (and (= -1 (:id org))
                          (handler.org/create conn logger mailjet-config org))))
        related-contents (:related_content updates)]
    (doseq [[image-key image-data] (select-keys updates [:image :thumbnail :photo :logo])]
      (update-resource-image conn image-data image-key table id))
    (when (seq tags)
      (update-resource-tags conn logger mailjet-config table id tags))
    (when (seq related-contents)
      (handler.resource.related-content/update-related-contents conn logger id table related-contents))
    (when-not (= "policy" topic-type)
      (update-resource-language-urls conn table id urls))
    (update-resource-geo-coverage-values conn table id updates)
    (when (contains? #{"resource"} table)
      (update-resource-organisation conn table id org-id))
    (update-resource-connections conn (:entity_connections updates) (:individual_connections updates) table id)
    status))

(defn update-initiative [conn logger mailjet-config id data]
  (let [params (merge {:id id} data)
        tags (remove nil? (:tags data))
        status (jdbc/with-db-transaction [conn-tx conn]
                 (let [status (db.detail/update-initiative conn-tx (-> params
                                                                       (dissoc :related_content :tags :entity_connections
                                                                               :individual_connections :urls :org :geo_coverage_countries
                                                                               :geo_coverage_country_groups :qimage)))]
                   (handler.initiative/update-geo-initiative conn-tx id (handler.initiative/extract-geo-data params))
                   status))
        related-contents (:related_content data)]
    (doseq [[image-key image-data] (select-keys data [:qimage :thumbnail])]
      (update-resource-image conn image-data image-key "initiative" id))
    (when (seq related-contents)
      (handler.resource.related-content/update-related-contents conn logger id "initiative" related-contents))
    (when (seq tags)
      (update-resource-tags conn logger mailjet-config "initiative" id tags))
    (update-resource-connections conn (:entity_connections data) (:individual_connections data) "initiative" id)
    status))

(defmethod ig/init-key :gpml.handler.detail/put
  [_ {:keys [db logger mailjet-config]}]
  (fn [{{{:keys [topic-type topic-id] :as path} :path body :body} :parameters
        user :user}]
    (try
      (let [submission (handler.res-permission/get-resource-if-allowed (:spec db)
                                                                       user
                                                                       (resolve-resource-type topic-type)
                                                                       topic-id
                                                                       {:read? false})
            review_status (:review_status submission)]
        (if (some? submission)
          (let [conn (:spec db)
                status (if (= topic-type "initiative")
                         (update-initiative conn logger mailjet-config topic-id body)
                         (update-resource conn logger mailjet-config topic-type topic-id body))]
            (when (and (= status 1) (= review_status "REJECTED"))
              (db.submission/update-submission
               conn
               {:table-name (util/get-internal-topic-type topic-type)
                :id topic-id
                :review_status "SUBMITTED"}))
            (resp/response {:success? (= status 1)}))
          util/unauthorized))
      (catch Exception e
        (log logger :error ::failed-to-update-resource-details {:exception-message (.getMessage e)
                                                                :context-data {:path-params path
                                                                               :body-params body}})
        (let [response {:status 500
                        :body {:success? false
                               :reason :failed-to-update-resource-details}}]
          (if (instance? SQLException e)
            response
            (assoc-in response [:body :error-details :error] (.getMessage e))))))))

(defmethod ig/init-key :gpml.handler.detail/put-params [_ _]
  put-params)

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
   deref)

  (do

    (->> all
         (map second)
                                        ;(filter (fn [xxx] (medley/find-first (fn [x] (= "All of the above" (:name x))) (:children xxx))))
                                        ;(filter (fn [xxxx] (= 1 (count (:children xxxx)))))
                                        ;(remove (fn [xxxx] (=  {:id 100, :name "Reporting and Evaluations", :children [{:id 101, :name "Yes"}]} xxxx)))
         (map (juxt
               identity
               (partial nested-all-of-the-above (-> cached-hierarchies deref :working_with_people :format-params))))))

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
       first))))
