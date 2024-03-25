(ns gpml.handler.detail
  (:require
   [clojure.java.io :as io]
   [clojure.java.jdbc :as jdbc]
   [clojure.set :as set]
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.boundary.port.chat :as port.chat]
   [gpml.db.action :as db.action]
   [gpml.db.action-detail :as db.action-detail]
   [gpml.db.country]
   [gpml.db.country-group :as db.country-group]
   [gpml.db.detail :as db.detail]
   [gpml.db.initiative :as db.initiative]
   [gpml.db.language :as db.language]
   [gpml.db.organisation :as db.organisation]
   [gpml.db.policy :as db.policy]
   [gpml.db.project :as db.project]
   [gpml.db.rbac-util :as db.rbac-util]
   [gpml.db.resource.connection :as db.resource.connection]
   [gpml.db.resource.detail :as db.resource.detail]
   [gpml.db.resource.tag :as db.resource.tag]
   [gpml.domain.file :as dom.file]
   [gpml.domain.initiative :as dom.initiative]
   [gpml.domain.resource :as dom.resource]
   [gpml.domain.types :as dom.types]
   [gpml.handler.initiative :as handler.initiative]
   [gpml.handler.organisation :as handler.org]
   [gpml.handler.resource.geo-coverage :as handler.geo]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.resource.related-content :as handler.resource.related-content]
   [gpml.handler.resource.tag :as handler.resource.tag]
   [gpml.handler.responses :as r]
   [gpml.handler.stakeholder.tag :as handler.stakeholder.tag]
   [gpml.service.association :as srv.association]
   [gpml.service.chat :as svc.chat]
   [gpml.service.file :as srv.file]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util :as util]
   [gpml.util.malli :as util.malli]
   [gpml.util.postgresql :as pg-util]
   [gpml.util.thread-transactions :as tht]
   [integrant.core :as ig]
   [medley.core :as medley]
   [taoensso.timbre :as timbre])
  (:import
   (java.sql SQLException)))

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

   ;; Funding Type: CE_ CF
   :funding {:action-code 43374920
             :format-fn (fn funding [_ action]
                          (when action
                            {:types (map other-or-name (:children action))
                             :name (get action :value-entered)}))}
   ;; action detail in parent node. Should we delete if no action detail even if there is some child?
   ;; Funding Name: CG
   ;; (def "funding name" 43374844 :action-detail)              ;; this is under Funding type!

   ;; Focus Area: Column BK_BL
   :focus_area {:action-code 43374915
                :format-fn #'all-of-the-above}

   ;; Lifecycle Phase: Column BM_BN
   :lifecycle_phase {:action-code 43374916
                     :format-fn #'all-of-the-above}

   ;; Sector: Column BY_BZ
   :sector {:action-code 43374905
            :format-fn #'all-of-the-above}

   ;; Activity Owner: Column AR, AS
   :activity_owner {:action-code 43374862
                    :format-fn #'nested-all-of-the-above}
   ;; all these are children of "activity owner"
   ;; Entity Type (only the one selected):
   ;; Public Administration: Column AT, AU
   ;; Private Sector: Column AV, AW
   ;; Third Sector: Column AX, AY

   ;; Activity Term: CH_CI
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
   :info_resource_links {:action-detail-codes [43374810 ;; this is the parent of the rest
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
   ;;                  :currency 43374846}
   ;; In Kind Contributions: CD – CC
                                        ;:in_kind_contribution {:amount 43374827
   ;;                       :currency 43374836}
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

(defn- resolve-resource-type [resource-type]
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

(defn- add-stakeholder-connections [db resource-type resource]
  (let [search-opts {:resource-id (:id resource)
                     :resource-type resource-type}
        sth-conns (->> (db.resource.connection/get-resource-stakeholder-connections db search-opts)
                       (map (fn [sth-conn]
                              (dissoc
                               (->> sth-conn
                                    (handler.stakeholder.tag/unwrap-tags)
                                    (merge sth-conn))
                               :tags))))]
    (assoc resource :stakeholder_connections sth-conns)))

(defn- add-files-urls [config resource]
  (let [{:keys [files image_id thumbnail_id picture_id logo_id]} resource
        resource-type (:type resource)
        files-w-urls (->> files
                          (map dom.file/decode-file)
                          (srv.file/add-files-urls config)
                          (medley/index-by (comp str :id)))]
    (cond
      (= "stakeholder" resource-type)
      (assoc resource :picture (get-in files-w-urls [picture_id :url]))

      (= "organisation" resource-type)
      (assoc resource :logo (get-in files-w-urls [logo_id :url]))

      :else
      (assoc resource
             :image (get-in files-w-urls [image_id :url])
             :thumbnail (get-in files-w-urls [thumbnail_id :url])))))

(defn- add-extra-details [{:keys [db] :as config} {:keys [id affiliation] :as resource} resource-type
                          {:keys [files-urls? owners? tags? entity-connections?
                                  stakeholder-connections? related-content? affiliation?]
                           :or {files-urls? true owners? true tags? true entity-connections? true
                                stakeholder-connections? true related-content? true
                                affiliation? false}}]
  (let [conn (:spec db)
        api-resource-type (if-not (= "resource" resource-type)
                            resource-type
                            (-> (:type resource)
                                str/lower-case
                                (str/replace #" " "_")))]
    (cond-> (assoc resource :type api-resource-type)
      tags?
      (assoc :tags (db.resource.tag/get-resource-tags conn {:table (str resource-type "_tag")
                                                            :resource-col resource-type
                                                            :resource-id id
                                                            :review_status "APPROVED"}))

      entity-connections?
      (assoc :entity_connections (db.resource.connection/get-resource-entity-connections conn {:resource-id id
                                                                                               :resource-type resource-type}))

      stakeholder-connections?
      (->> (add-stakeholder-connections conn resource-type))

      related-content?
      (assoc :related_content (expand-related-content conn id resource-type))

      (and affiliation? affiliation)
      (assoc :affiliation (db.organisation/organisation-by-id conn {:id affiliation}))

      owners?
      (assoc :owners (->> (db.rbac-util/get-users-with-granted-permission-on-resource conn {:resource-id id
                                                                                            :context-type-name resource-type
                                                                                            :permission-name (str resource-type "/" "update")})
                          (mapv :user_id)))

      files-urls?
      (->> (add-files-urls config)))))

(defmulti extra-details (fn [_ resource-type _] resource-type) :default :nothing)

(defmethod extra-details "initiative" [{:keys [db] :as config} resource-type initiative]
  (merge
   (add-extra-details config initiative resource-type {})
   (dom.initiative/parse-initiative-details (db.initiative/initiative-by-id (:spec db) initiative))))

(defmethod extra-details "policy" [{:keys [db] :as config} resource-type policy]
  (merge
   (add-extra-details config policy resource-type {})
   {:language (db.policy/language-by-policy-id (:spec db) (select-keys policy [:id]))}
   (when-let [implementing-mea (:implementing_mea policy)]
     {:implementing_mea (:name (db.country-group/country-group-by-id (:spec db) {:id implementing-mea}))})))

(defmethod extra-details "technology" [{:keys [db] :as config} resource-type technology]
  (merge
   (add-extra-details config technology resource-type {})
   (when-let [headquarters-country (:country technology)]
     {:headquarters (first (gpml.db.country/get-countries (:spec db) {:filters {:ids [headquarters-country]}}))})))

(defmethod extra-details "case_study" [config resource-type resource]
  (add-extra-details config resource resource-type {}))

(defmethod extra-details "resource" [config resource-type resource]
  (add-extra-details config resource resource-type {}))

(defmethod extra-details "event" [config resource-type event]
  (add-extra-details config event resource-type {}))

(defmethod extra-details "organisation" [config resource-type organisation]
  (add-extra-details config organisation resource-type {:tags? true
                                                        :entity-connections? false
                                                        :stakeholder-connections? false
                                                        :related-content? false}))

(defmethod extra-details "stakeholder" [config resource-type stakeholder]
  (let [details (add-extra-details config stakeholder resource-type {:tags? true
                                                                     :entity-connections? false
                                                                     :stakeholder-connections? false
                                                                     :related-content? false
                                                                     :affiliation? true})]
    (merge details (handler.stakeholder.tag/unwrap-tags details))))

(defmethod extra-details :nothing [_ _ _]
  nil)

(defn- delete-resource [{:keys [db logger] :as config} resource-id resource-type rbac-context-type]
  (let [transactions
        [{:txn-fn
          (fn tx-get-resource
            [{:keys [resource-id resource-type] :as context}]
            (let [result (try
                           {:success? true
                            :resource (db.resource.detail/get-resource (:spec db)
                                                                       {:table-name resource-type
                                                                        :id resource-id})}
                           (catch Exception t
                             {:successs? false
                              :reason :exception
                              :error-details {:msg (ex-message t)}}))]
              (if (:success? result)
                (assoc context :resource (:resource result))
                (assoc context
                       :success? false
                       :reason :failed-to-get-resource
                       :error-details {:result result}))))}
         {:txn-fn
          (fn tx-delete-chat-account
            [{:keys [resource resource-type] :as context}]
            (if-not (and (= resource-type "stakeholder")
                         (seq (:chat_account_id resource)))
              context
              (let [result (if-not (:user (port.chat/get-user-info (:chat-adapter config)
                                                                   (:chat_account_id resource)
                                                                   {}))
                             {:success? true}
                             (port.chat/delete-user-account (:chat-adapter config)
                                                            (:chat_account_id resource)
                                                            {}))]
                (if (:success? result)
                  context
                  (assoc context
                         :success? false
                         :reason :failed-to-delete-user-chat-account
                         :error-details {:result result})))))
          :rollback-fn
          (fn rollback-delete-chat-account
            [{:keys [resource resource-type] :as context}]
            (if-not (and (= resource-type "stakeholder")
                         (seq (:chat_account_id resource)))
              context
              (let [result (if (:user (port.chat/get-user-info (:chat-adapter config)
                                                               (:chat_account_id resource)
                                                               {}))
                             {:success? true}
                             (svc.chat/create-user-account config (:id resource)))]
                (if (:success? result)
                  context
                  (do
                    (log logger :error :failed-to-rollback-delete-chat-account {:result result})
                    context)))))}
         {:txn-fn
          (fn tx-delete-resource
            [{:keys [rbac-context-type resource-id resource-type] :as context}]
            (let [result (db.resource.detail/delete-resource (:spec db) logger {:id resource-id
                                                                                :type resource-type
                                                                                :rbac-context-type rbac-context-type})]
              (if (:success? result)
                {:success? true}
                (assoc context
                       :success? false
                       :reason :failed-to-delete-resource
                       :error-details {:result result}))))}]
        context {:success? true
                 :resource-id resource-id
                 :resource-type resource-type
                 :rbac-context-type rbac-context-type}]
    (tht/thread-transactions logger transactions context)))

(defmethod ig/init-key :gpml.handler.detail/delete
  [_ {:keys [logger] :as config}]
  (fn [{{:keys [path]} :parameters user :user}]
    (try
      (let [topic-id (:topic-id path)
            topic-type (resolve-resource-type (:topic-type path))
            rbac-context-type (h.r.permission/entity-type->context-type topic-type)
            authorized? (h.r.permission/operation-allowed?
                         config
                         {:user-id (:id user)
                          :entity-type rbac-context-type
                          :entity-id topic-id
                          :operation-type :delete
                          :root-context? false})]
        (if-not authorized?
          (r/forbidden {:message "Unauthorized"})
          (let [result (delete-resource config topic-id topic-type rbac-context-type)]
            (if (:success? result)
              (r/ok {})
              (do
                (log logger :error :failed-to-delete-resource {:id topic-id
                                                               :type topic-type
                                                               :result result})
                (r/server-error (dissoc result :success?)))))))
      (catch Exception e
        (timbre/with-context+ path)
        (log logger :error :delete-resource-failed e)
        (if (instance? SQLException e)
          (r/server-error {:success? false
                           :reason :could-not-delete-resource
                           :error-details {:error-type (pg-util/get-sql-state e)}})
          (r/server-error {:success? false
                           :reason :could-not-delete-resource
                           :error-details {:error-message (.getMessage e)}}))))))

(defn- get-detail* [conn table-name id opts]
  (let [opts (merge opts {:topic-type table-name :id id :badges true})
        {:keys [json] :as result}
        (if (get #{"organisation" "stakeholder"} table-name)
          (db.detail/get-entity-details conn opts)
          (db.detail/get-topic-details conn opts))]
    (-> result
        (dissoc :json)
        (merge json))))

(defn- get-detail [{:keys [db] :as config} topic-id topic-type query]
  (let [conn (:spec db)
        resource-details (-> (get-detail* conn topic-type topic-id query)
                             (dissoc :tags :remarks :abstract :description))
        resource-details (if-not (= "organisation" topic-type)
                           (dissoc resource-details :name)
                           resource-details)]
    (if (seq resource-details)
      {:success? true
       :resource-details (extra-details config topic-type resource-details)}
      {:success? false
       :reason :not-found})))

(def ^:private get-detail-path-params-schema
  [:map
   [:topic-type
    {:swagger {:description "The topic type (or entity type) to get details from."
               :type "string"
               :enum dom.types/topic-types}}
    ;; TODO: refactor to use dom.types/get-type-schema.
    (apply conj [:enum] dom.types/topic-types)]
   [:topic-id
    {:swagger {:description "The topic ID (or entity ID)."
               :type "integer"}}
    [:int {:min 1}]]])

(defmethod ig/init-key :gpml.handler.detail/get-params
  [_ _]
  {:path get-detail-path-params-schema})

(defmethod ig/init-key :gpml.handler.detail/get
  [_ {:keys [db logger] :as config}]
  (fn [{{:keys [path query]} :parameters user :user}]
    (try
      (let [topic-type (resolve-resource-type (:topic-type path))
            topic-id (:topic-id path)
            rbac-entity-type (h.r.permission/entity-type->context-type topic-type)
            resource (db.resource.detail/get-resource (:spec db)
                                                      {:table-name topic-type
                                                       :id topic-id})
            draft? (not= "APPROVED" (:review_status resource))
            authorized? (if-not (or (= topic-type "stakeholder")
                                    (= topic-type "organisation"))
                          (if draft?
                            (h.r.permission/operation-allowed?
                             config
                             {:user-id (:id user)
                              :entity-type rbac-entity-type
                              :entity-id topic-id
                              :operation-type :read-draft})
                            true)
                          ;; Platform resources (topics) are public (approved ones)
                          ;; except for stakeholders and organisations. To view
                          ;; any of those entity's data, users needs to
                          ;; have the
                          ;; `stakeholder/read` or `organisation/read` permission.
                          (h.r.permission/operation-allowed?
                           config
                           {:user-id (:id user)
                            :entity-type rbac-entity-type
                            :entity-id srv.permissions/root-app-resource-id
                            :operation-type :read
                            :custom-context-type srv.permissions/root-app-context-type}))]
        (if-not authorized?
          (r/forbidden {:message "Unauthorized"})
          (let [result (get-detail config topic-id topic-type query)]
            (if-not (:success? result)
              (if (= (:reason result) :not-found)
                (r/not-found result)
                (r/server-error result))
              (r/ok (:resource-details result))))))
      (catch Exception t
        (timbre/with-context+ {:path-params path
                               :user user}
          (log logger :error :failed-to-get-resource-details t))
        (if (instance? SQLException t)
          (r/server-error {:success? true
                           :reason (pg-util/get-sql-state t)})
          (r/server-error {:success? true
                           :reason :could-not-get-resource-details
                           :error-details {:error (.getMessage t)}}))))))

(def put-params
  ;; FIXME: Add validation
  ;; -- Cannot be empty, for one.
  [:map
   {:closed false}])

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

(defn update-blank-resource-image [config conn resource-type resource-id file-id-key old-file-id]
  (if old-file-id
    (let [result (srv.file/delete-file config conn {:id old-file-id})]
      (if (:success? result)
        (db.detail/update-resource-table
         conn
         {:table resource-type
          :id resource-id
          :updates {file-id-key nil}})
        (throw (ex-info "Failed to delete old resource image file" {:result result}))))
    (db.detail/update-resource-table
     conn
     {:table resource-type
      :id resource-id
      :updates {file-id-key nil}})))

(defn- update-resource-image** [config conn resource-type resource-id file-id-key image-payload]
  (let [new-file (dom.file/base64->file image-payload
                                        (keyword resource-type)
                                        :images
                                        :public)
        result (srv.file/create-file config conn new-file)]
    (if-not (:success? result)
      (throw (ex-info "Failed to update resource image file" {:result result}))
      (db.detail/update-resource-table
       conn
       {:table resource-type
        :id resource-id
        :updates {file-id-key (get-in result [:file :id])}}))))

(defn- update-resource-image* [config conn resource-type resource-id file-id-key old-file-id image-payload]
  (if-not old-file-id
    (update-resource-image** config
                             conn
                             resource-type
                             resource-id
                             file-id-key
                             image-payload)
    (let [result (srv.file/delete-file config conn {:id old-file-id})]
      (if (:success? result)
        (update-resource-image** config
                                 conn
                                 resource-type
                                 resource-id
                                 file-id-key
                                 image-payload)
        (throw (ex-info "Failed to delete old resource image file" {:result result}))))))

(defn update-resource-image [config conn resource-type resource-id image-key image-payload]
  (let [resource (get-detail* conn resource-type resource-id {})
        file-id-key (keyword (str (name image-key) "_id"))
        old-file-id (util/uuid (get resource file-id-key))]
    (if-not (seq image-payload)
      (update-blank-resource-image config
                                   conn
                                   resource-type
                                   resource-id
                                   file-id-key
                                   old-file-id)
      (update-resource-image* config
                              conn
                              resource-type
                              resource-id
                              file-id-key
                              old-file-id
                              image-payload))))

(defn- update-resource [{:keys [logger mailjet-config] :as config}
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
                          (handler.org/create config conn org))))
        related-contents (:related_content updates)
        org-associations (map (fn [acs] (set/rename-keys acs {:entity :organisation})) (:entity_connections updates))
        sth-associations (:individual_connections updates)]
    (doseq [[image-key image-data] (select-keys updates [:image :thumbnail])]
      (update-resource-image config conn table id image-key image-data))
    (when (contains? (set (keys updates)) :tags)
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
    (srv.association/save-associations {:conn conn
                                        :logger logger}
                                       {:org-associations org-associations
                                        :sth-associations sth-associations
                                        :resource-type table
                                        :resource-id id})
    status))

(defn- update-initiative [{:keys [logger mailjet-config] :as config}
                          conn
                          id
                          initiative]
  (let [dom-keys (util.malli/keys dom.initiative/Initiative)
        api-initiative (assoc initiative :id id)
        tags (remove nil? (:tags api-initiative))
        geo-coverage-type (keyword (first (keys (:q24 api-initiative))))
        {:keys [geo_coverage_countries
                geo_coverage_country_groups
                geo_coverage_country_states]}
        (handler.initiative/extract-geo-data api-initiative)
        status (db.detail/update-initiative
                conn
                (select-keys api-initiative dom-keys))
        related-contents (:related_content api-initiative)
        org-associations (map (fn [acs] (set/rename-keys acs {:entity :organisation})) (:entity_connections api-initiative))
        sth-associations (:individual_connections api-initiative)]
    (doseq [[image-key image-data] (select-keys api-initiative [:qimage :thumbnail])
            :let [image-key (if (= image-key :qimage) :image image-key)]]
      (update-resource-image config conn "initiative" id image-key image-data))
    (when (seq related-contents)
      (handler.resource.related-content/update-related-contents conn logger id "initiative" related-contents))
    (when (contains? (set (keys api-initiative)) :tags)
      (update-resource-tags conn logger mailjet-config "initiative" id tags))
    (handler.geo/update-resource-geo-coverage conn
                                              :initiative
                                              id
                                              geo-coverage-type
                                              {:countries geo_coverage_countries
                                               :country-groups geo_coverage_country_groups
                                               :country-states geo_coverage_country_states})
    (srv.association/save-associations {:conn conn
                                        :logger logger}
                                       {:org-associations org-associations
                                        :sth-associations sth-associations
                                        :resource-type "initiative"
                                        :resource-id id})
    status))

(defmethod ig/init-key :gpml.handler.detail/put
  [_ {:keys [db logger] :as config}]
  (fn [{{{:keys [topic-type topic-id] :as path} :path body :body} :parameters
        user :user}]
    (let [initiative? (= topic-type "initiative")
          resource-type (cond
                          (contains? dom.resource/types topic-type) "resource"
                          :else topic-type)]
      (try
        (let [authorized? (h.r.permission/operation-allowed?
                           config
                           {:user-id (:id user)
                            :entity-type (h.r.permission/entity-type->context-type topic-type)
                            :entity-id topic-id
                            :operation-type :update
                            :root-context? false})]
          (if-not authorized?
            (r/forbidden {:message "Unauthorized"})
            (let [conn (:spec db)
                  status (jdbc/with-db-transaction [tx conn]
                           (if initiative?
                             (update-initiative config tx topic-id body)
                             (update-resource config tx topic-type topic-id body)))]
              (if (= status 1)
                (r/ok {:success? true})
                (r/server-error {:success? false
                                 :reason :failed-to-update-resource-details})))))

        (catch Exception e
          (timbre/with-context+ {:path-params path
                                 :body-params body}
            (log logger :error :failed-to-update-resource-details e))
          ;; TODO: Improve this: we are re-doing some things that we do in the successful path.
          ;; Besides, we should try to wrap this code as well inside another try-catch block.
          (doseq [[image-key _] (select-keys body [(if initiative? :qimage :image) :thumbnail])
                  :let [conn (:spec db)
                        resource (get-detail* conn resource-type topic-id {})
                        resolved-img-key (if (and initiative?
                                                  (= :qimage image-key))
                                           :image
                                           image-key)
                        file-id-key (keyword (str (name resolved-img-key) "_id"))
                        old-file-id (util/uuid (get resource file-id-key))]]
            (when old-file-id
              (srv.file/delete-file config conn {:id old-file-id} :skip-obj-storage? true)))
          (let [response {:success? false
                          :reason :failed-to-update-resource-details}]
            (if (instance? SQLException e)
              (r/server-error response)
              (r/server-error (assoc-in response [:error-details :error] (.getMessage e))))))))))

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
             (map extract-column-id (string/split (slurp (io/resource "questionnarie-columns.csv")) #";")))))

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
