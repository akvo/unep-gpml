(ns gpml.handler.detail
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [clojure.string :as str]
            [duct.logger :refer [log]]
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
            [gpml.db.rbac-util :as db.rbac-util]
            [gpml.db.resource.association :as db.res.acs]
            [gpml.db.resource.connection :as db.resource.connection]
            [gpml.db.resource.tag :as db.resource.tag]
            [gpml.domain.initiative :as dom.initiative]
            [gpml.domain.resource :as dom.resource]
            [gpml.domain.types :as dom.types]
            [gpml.handler.image :as handler.image]
            [gpml.handler.initiative :as handler.initiative]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.resource.geo-coverage :as handler.geo]
            [gpml.handler.resource.permission :as handler.res-permission]
            [gpml.handler.resource.related-content :as handler.resource.related-content]
            [gpml.handler.resource.tag :as handler.resource.tag]
            [gpml.handler.responses :as r]
            [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig]
            [medley.core :as medley])
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
  (apply conj [:enum] dom.types/topic-types))

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
    (some #{resource-type} dom.resource/types)
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

(defn- add-stakeholder-connections
  [db resource]
  (let [search-opts {:resource-id (:id resource)
                     :resource-type (resolve-resource-type (:type resource))}
        sth-conns (->> (db.resource.connection/get-resource-stakeholder-connections db search-opts)
                       (map (fn [sth-conn]
                              (dissoc
                               (->> sth-conn
                                    (handler.stakeholder.tag/unwrap-tags)
                                    (merge sth-conn))
                               :tags))))]
    (assoc resource :stakeholder_connections sth-conns)))

(defn- add-extra-details
  [db {:keys [id affiliation] :as resource} resource-type
   {:keys [owners? tags? entity-connections?
           stakeholder-connections? related-content? affiliation?]
    :or {owners? true tags? true entity-connections? true
         stakeholder-connections? true related-content? true
         affiliation? false}}]
  (let [resolved-resource-type (resolve-resource-type resource-type)]
    (cond-> (assoc resource :type resource-type)
      tags?
      (assoc :tags (db.resource.tag/get-resource-tags db {:table (str (resolve-resource-type resource-type) "_tag")
                                                          :resource-col (resolve-resource-type resource-type)
                                                          :resource-id id}))

      entity-connections?
      (assoc :entity_connections (db.resource.connection/get-resource-entity-connections db {:resource-id id
                                                                                             :resource-type resolved-resource-type}))

      stakeholder-connections?
      (->> (add-stakeholder-connections db))

      related-content?
      (assoc :related_content (expand-related-content db id (resolve-resource-type resource-type)))

      (and affiliation? affiliation)
      (assoc :affiliation (db.organisation/organisation-by-id db {:id affiliation}))

      owners?
      (assoc :owners (->> (db.rbac-util/get-users-with-granted-permission-on-resource db {:resource-id id
                                                                                          :context-type-name resolved-resource-type
                                                                                          :permission-name (str resolved-resource-type "/" "update")})
                          (mapv :user_id))))))

(defmulti extra-details (fn [_ resource-type _] resource-type) :default :nothing)

(defmethod extra-details "initiative" [db resource-type initiative]
  (merge
   (add-extra-details db initiative resource-type {})
   (dom.initiative/parse-initiative-details (db.initiative/initiative-by-id db initiative))))

(defmethod extra-details "policy" [db resource-type policy]
  (merge
   (add-extra-details db policy resource-type {})
   {:language (db.policy/language-by-policy-id db (select-keys policy [:id]))}
   (when-let [implementing-mea (:implementing_mea policy)]
     {:implementing_mea (:name (db.country-group/country-group-by-id db {:id implementing-mea}))})))

(defmethod extra-details "technology" [db resource-type technology]
  (merge
   (add-extra-details db technology resource-type {})
   (when-let [headquarters-country (:country technology)]
     {:headquarters (first (gpml.db.country/get-countries db {:filters {:ids [headquarters-country]}}))})))

(defmethod extra-details "technical_resource" [db resource-type resource]
  (add-extra-details db resource resource-type {}))

(defmethod extra-details "financing_resource" [db resource-type resource]
  (add-extra-details db resource resource-type {}))

(defmethod extra-details "case_study" [db resource-type resource]
  (add-extra-details db resource resource-type {}))

(defmethod extra-details "action_plan" [db resource-type resource]
  (add-extra-details db resource resource-type {}))

(defmethod extra-details "event" [db resource-type event]
  (add-extra-details db event resource-type {}))

(defmethod extra-details "organisation" [db resource-type organisation]
  (add-extra-details db organisation resource-type {:tags? true
                                                    :entity-connections? false
                                                    :stakeholder-connections? false
                                                    :related-content? false}))

(defmethod extra-details "stakeholder" [db resource-type stakeholder]
  (let [details (add-extra-details db stakeholder resource-type {:tags? true
                                                                 :entity-connections? false
                                                                 :stakeholder-connections? false
                                                                 :related-content? false
                                                                 :affiliation? true})]
    (merge details (handler.stakeholder.tag/unwrap-tags details))))

(defmethod extra-details :nothing [_ _ _]
  nil)

;; TODO: refactor this. With the exception of the related_content
;; table the other tables should have a ON DELETE CASCADE constraint
;; so the database does the deletion work for us. And the
;; related_content records deletion should be handled by a HugSQL
;; function and not explicitly written here.
(defn- common-queries
  [topic-type topic-id {:keys [url? related-content?]}]
  (filter some?
          [(when url? [(format "delete from %s_language_url where %s = ?" topic-type topic-type) topic-id])
           (when related-content? ["delete from related_content
            where (resource_id = ? and resource_table_name = ?::regclass)
            or (related_resource_id = ? and related_resource_table_name = ?::regclass)"
                                   topic-id topic-type topic-id topic-type])
           (when (= "organisation" topic-type)
             ["delete from resource_organisation where organisation=?" topic-id])
           (when (= "resource" topic-type)
             ["delete from resource_organisation where resource=?" topic-id])
           ["delete from rbac_context where resource_id = ? and context_type_name = ?" topic-id topic-type]
           [(format "delete from %s where id = ?" topic-type) topic-id]]))

;; TODO: We need to delete related resource context as well.
(defmethod ig/init-key :gpml.handler.detail/delete
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path]} :parameters user :user}]
    (try
      (let [topic-id (:topic-id path)
            topic-type (resolve-resource-type (:topic-type path))]
        (if (= topic-type "stakeholder")
          (r/forbidden {:message "Unauthorized"})
          (let [authorized? (handler.res-permission/operation-allowed?
                             config
                             {:user-id (:id user)
                              :entity-type topic-type
                              :entity-id topic-id
                              :operation-type :delete
                              :root-context? false})]
            (if-not authorized?
              (r/forbidden {:message "Unauthorized"})
              (let [sts (condp = topic-type
                          "policy" (common-queries topic-type topic-id {:url? false :related-content? true})
                          "event" (common-queries topic-type topic-id {:url? true :related-content? true})
                          "technology" (common-queries topic-type topic-id {:url? true :related-content? true})
                          "organisation" (common-queries topic-type topic-id {:url? false :related-content? false})
                          "initiative" (common-queries topic-type topic-id {:url? false :related-content? true})
                          "resource" (common-queries topic-type topic-id {:url? true :related-content? true})
                          "case_study" (common-queries topic-type topic-id {:url? true :related-content? true}))]
                (jdbc/with-db-transaction [tx (:spec db)]
                  (doseq [st sts]
                    (jdbc/execute! tx st)))
                (r/ok {:success? true
                       :deleted {:topic-id topic-id
                                 :topic-type topic-type}}))))))
      (catch Exception e
        (log logger :error ::delete-resource-failed {:exception-message (.getMessage e)
                                                     :context-data path})
        (if (instance? SQLException e)
          (r/server-error {:success? false
                           :reason :could-not-delete-resource
                           :error-details {:error-type (pg-util/get-sql-state e)}})
          (r/server-error {:success? false
                           :reason :could-not-delete-resource
                           :error-details {:error-message (.getMessage e)}}))))))

(defn- get-detail*
  [conn table-name id opts]
  (let [opts (merge opts {:topic-type table-name :id id})
        {:keys [json] :as result}
        (if (get #{"organisation" "stakeholder"} table-name)
          (db.detail/get-entity-details conn opts)
          (db.detail/get-topic-details conn opts))]
    (-> result
        (dissoc :json)
        (merge json))))

(defn- get-detail
  [{:keys [db]} topic-id topic-type query]
  (let [conn (:spec db)
        resource-details (-> (get-detail* conn topic-type topic-id query)
                             (dissoc :tags :remarks :name :abstract :description))]
    (if (seq resource-details)
      {:success? true
       :resource-details (extra-details conn topic-type resource-details)}
      {:success? false
       :reason :not-found})))

(defmethod ig/init-key :gpml.handler.detail/get
  [_ {:keys [logger] :as config}]
  (fn [{{:keys [path query]} :parameters user :user}]
    (try
      (let [topic-type (:topic-type path)
            topic-id (:topic-id path)
            authorized? (if-not (or (= topic-type "stakeholder")
                                    (= topic-type "organisation"))
                          true
                          ;; Platform resources (topics) are public
                          ;; except for stakeholders. To view
                          ;; stakeholder's data calling users needs to
                          ;; be approved and have the
                          ;; `stakeholder/read` permission.
                          (handler.res-permission/operation-allowed?
                           config
                           {:user-id (:id user)
                            :entity-type topic-type
                            :operation-type :read
                            :root-context? false}))]
        (if-not authorized?
          (r/forbidden {:message "Unauthorized"})
          (let [result (get-detail config topic-id topic-type query)]
            (if-not (:success? result)
              (if (= (:reason result) :not-found)
                (r/not-found result)
                (r/server-error result))
              (r/ok (:resource-details result))))))
      (catch Exception e
        (log logger :error ::failed-to-get-resource-details {:exception-message (.getMessage e)
                                                             :context-data {:path-params path
                                                                            :user user}})
        (if (instance? SQLException e)
          (r/server-error {:success? true
                           :reason (pg-util/get-sql-state e)})
          (r/server-error {:success? true
                           :reason :could-not-get-resource-details
                           :error-details {:error (.getMessage e)}}))))))

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

(defn -update-blank-resource-picture
  [conn image-type resource-id image-key]
  (db.detail/update-resource-table
   conn
   {:table image-type :id resource-id :updates {image-key ""}}))

(defn -update-resource-picture
  [config conn image image-type resource-id image-key]
  (let [url (handler.image/assoc-image config conn image image-type)]
    (when-not (and image (= image url))
      (db.detail/update-resource-table
       conn
       {:table image-type :id resource-id :updates {image-key url}}))))

(defn update-resource-image
  [config conn image image-key image-type resource-id]
  (if (empty? image)
    (-update-blank-resource-picture conn image-type resource-id image-key)
    (-update-resource-picture config conn image image-type resource-id image-key)))

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

(defn- get-associations-diff
  [updated-acs existing-acs]
  (reduce
   (fn [acs-diff {:keys [id] :as acs}]
     (let [in-existing (some #(when (= id (:id %)) %) existing-acs)
           in-updated (some #(when (= id (:id %)) %) updated-acs)
           to-create? (not id)]
       (cond
         to-create?
         (update acs-diff :to-create conj acs)

         (and in-existing (not in-updated))
         (update acs-diff :to-delete conj in-existing)

         (and in-updated in-existing (not= (:role in-updated) (:role in-existing)))
         (update acs-diff :to-update conj (assoc in-updated :old-role (:role in-existing)))

         :else
         acs-diff)))
   {:to-create []
    :to-delete []
    :to-update []}
   (medley/distinct-by
    (fn [x] (or (:id x) x))
    (concat updated-acs existing-acs))))

(defn- get-role-unassignments
  [associations resource-type resource-id]
  (keep (fn [{:keys [stakeholder role]}]
          (when (get #{"owner" "resource_editor"} role)
            {:user-id stakeholder
             :role-name (keyword (str/replace role \_ \-))
             :context-type resource-type
             :resource-id resource-id}))
        associations))

(defn update-resource-connections
  [{:keys [logger]} conn entity-connections individual-connections resource-type resource-id]
  (let [existing-ecs (db.res.acs/get-resource-associations conn
                                                           {:table (str "organisation_" resource-type)
                                                            :resource-col resource-type
                                                            :filters {:resource-id resource-id}})
        {_to-create-ecs :to-create to-delete-ecs :to-delete _to-update-ecs :to-update}
        (get-associations-diff entity-connections existing-ecs)
        existing-ics (db.res.acs/get-resource-associations conn
                                                           {:table (str "stakeholder_" resource-type)
                                                            :resource-col resource-type
                                                            :filters {:resource-id resource-id}})
        {to-create-ics :to-create to-delete-ics :to-delete to-update-ics :to-update}
        (get-associations-diff individual-connections existing-ics)
        role-unassignments (get-role-unassignments to-delete-ics
                                                   resource-type
                                                   resource-id)]
    (when (seq to-delete-ecs)
      (db.favorite/delete-associations conn {:table (str "organisation_" resource-type)
                                             :ids (map :id to-delete-ecs)}))
    (when (seq to-delete-ics)
      (db.favorite/delete-associations conn {:table (str "stakeholder_" resource-type)
                                             :ids (map :id to-delete-ics)}))
    (when (seq individual-connections)
      (doseq [association (expand-associations individual-connections "stakeholder" resource-type resource-id)]
        (if (contains? association :id)
          (db.favorite/update-stakeholder-association conn association)
          (db.favorite/new-stakeholder-association conn association))))
    (when (seq entity-connections)
      (doseq [association (expand-associations entity-connections "organisation" resource-type resource-id)]
        (if (contains? association :id)
          (db.favorite/update-stakeholder-association conn association)
          (db.favorite/new-organisation-association conn association))))
    (when (seq role-unassignments)
      (srv.permissions/unassign-roles-from-users {:conn conn
                                                  :logger logger}
                                                 role-unassignments))
    (when (or (seq to-create-ics) (seq to-update-ics))
      (srv.permissions/assign-roles-to-users-from-connections {:conn conn
                                                               :logger logger}
                                                              {:context-type (keyword resource-type)
                                                               :resource-id resource-id
                                                               :individual-connections (concat to-create-ics to-update-ics)}))))

(defn- update-resource
  [{:keys [logger mailjet-config] :as config}
   conn
   topic-type
   id
   {:keys [geo_coverage_countries
           geo_coverage_country_groups
           geo_coverage_country_states
           geo_coverage_type] :as updates}]
  (let [updates (assoc updates :id id)
        table (cond
                (contains? dom.resource/types topic-type) "resource"
                :else topic-type)
        geo-coverage-type (keyword geo_coverage_type)
        table-columns (-> updates
                          (dissoc
                           :tags :urls :geo_coverage_value :org
                           :image :photo :logo :language :thumbnail
                           :geo_coverage_country_groups
                           :geo_coverage_countries
                           :geo_coverage_country_states
                           :geo_coverage_value_subnational
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
      (update-resource-image config conn image-data image-key table id))
    (when (seq tags)
      (update-resource-tags conn logger mailjet-config table id tags))
    (when (seq related-contents)
      (handler.resource.related-content/update-related-contents conn logger id table related-contents))
    (when-not (or (= "policy" topic-type)
                  (= "case_study" topic-type))
      (update-resource-language-urls conn table id urls))
    (handler.geo/update-resource-geo-coverage conn
                                              (keyword table)
                                              id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (when (contains? #{"resource"} table)
      (update-resource-organisation conn table id org-id))
    (update-resource-connections
     config
     conn
     (:entity_connections updates)
     (:individual_connections updates)
     table
     id)
    status))

(defn- update-initiative
  [{:keys [logger mailjet-config] :as config}
   conn
   id
   initiative]
  (let [initiative (assoc initiative :id id)
        tags (remove nil? (:tags initiative))
        geo-coverage-type (keyword (first (keys (:q24 initiative))))
        {:keys [geo_coverage_countries
                geo_coverage_country_groups
                geo_coverage_country_states]}
        (handler.initiative/extract-geo-data initiative)
        status (db.detail/update-initiative
                conn
                (dissoc initiative
                        :related_content :tags :entity_connections
                        :individual_connections :urls :org
                        :geo_coverage_countries
                        :geo_coverage_country_states
                        :geo_coverage_country_groups
                        :geo_coverage_value_subnational
                        :qimage))
        related-contents (:related_content initiative)]
    (doseq [[image-key image-data] (select-keys initiative [:qimage :thumbnail])]
      (update-resource-image config conn image-data image-key "initiative" id))
    (when (seq related-contents)
      (handler.resource.related-content/update-related-contents conn logger id "initiative" related-contents))
    (when (seq tags)
      (update-resource-tags conn logger mailjet-config "initiative" id tags))
    (handler.geo/update-resource-geo-coverage conn
                                              :initiative
                                              id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (update-resource-connections
     config
     conn
     (:entity_connections initiative)
     (:individual_connections initiative)
     "initiative"
     id)
    status))

(defmethod ig/init-key :gpml.handler.detail/put
  [_ {:keys [db logger] :as config}]
  (fn [{{{:keys [topic-type topic-id] :as path} :path body :body} :parameters
        user :user}]
    (try
      (let [authorized? (handler.res-permission/operation-allowed?
                         config
                         {:user-id (:id user)
                          :entity-type topic-type
                          :entity-id topic-id
                          :operation-type :update
                          :root-context? false})]
        (if-not authorized?
          (r/forbidden {:message "Unauthorized"})
          (let [conn (:spec db)
                status (jdbc/with-db-transaction [tx conn]
                         (if (= topic-type "initiative")
                           (update-initiative config tx topic-id body)
                           (update-resource config tx topic-type topic-id body)))]
            (if (= status 1)
              (r/ok {:success? true})
              (r/server-error {:success? false
                               :reason :failed-to-update-resource-details}))))
        ;; FIXME: review if this logic still makes sense in this endpoint.
        ;; (jdbc/with-db-transaction [tx (:spec db)]
        ;;   (let [status (if (= topic-type "initiative")
        ;;                  (update-initiative config tx topic-id body)
        ;;                  (update-resource config tx topic-type topic-id body))]
        ;;     (when (and (= status 1) (= review_status "REJECTED"))
        ;;       (db.submission/update-submission
        ;;        tx
        ;;        {:table-name (util/get-internal-topic-type topic-type)
        ;;         :id topic-id
        ;;         :review_status "SUBMITTED"}))))
        )

      (catch Exception e
        (log logger :error ::failed-to-update-resource-details {:exception-message (.getMessage e)
                                                                :context-data {:path-params path
                                                                               :body-params body}})
        (let [response {:success? false
                        :reason :failed-to-update-resource-details}]
          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:error-details :error] (.getMessage e)))))))))

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
