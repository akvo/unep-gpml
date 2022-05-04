(ns gpml.handler.detail
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.set :as set]
            [clojure.string :as string]
            [gpml.constants :as constants]
            [gpml.db.action :as db.action]
            [gpml.db.action-detail :as db.action-detail]
            gpml.db.country
            [gpml.db.country-group :as db.country-group]
            [gpml.db.detail :as db.detail]
            [gpml.db.event :as db.event]
            [gpml.db.favorite :as db.favorite]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.language :as db.language]
            [gpml.db.policy :as db.policy]
            [gpml.db.project :as db.project]
            [gpml.db.resource :as db.resource]
            [gpml.db.submission :as db.submission]
            [gpml.db.tag :as db.tag]
            [gpml.db.technology :as db.technology]
            [gpml.db.topic-stakeholder-auth :as db.topic-stakeholder-auth]
            [gpml.email-util :as email]
            [gpml.handler.image :as handler.image]
            [gpml.handler.initiative :as handler.initiative]
            [gpml.handler.geo :as handler.geo]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.util :as util]
            [gpml.model.topic :as model.topic]
            [gpml.pg-util :as pg-util]
            [integrant.core :as ig]
            [medley.core :as medley]
            [ring.util.response :as resp]))

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

(defn expand-related-project-content [db project]
  (let [related_content (db.initiative/related-content-by-id db (select-keys project [:id]))]
    (for [item related_content]
      (merge item
             {:entity_connections (db.initiative/entity-connections-by-id db (select-keys item [:id]))
              :stakeholder_connections (db.initiative/stakeholder-connections-by-id db (select-keys item [:id]))}))))

(defmethod extra-details "project" [_ db {:keys [related_content] :as project}]
  (merge
   {:entity_connections (db.initiative/entity-connections-by-id db (select-keys project [:id]))
    :stakeholder_connections (db.initiative/stakeholder-connections-by-id db (select-keys project [:id]))
    :related_content (if (seq related_content)
                       (expand-related-project-content db project)
                       [])
    :tags (db.initiative/tags-by-id db (select-keys project [:id]))
    :type "Initiative"}
   (if (> (:id project) 10000)
     (db.initiative/initiative-detail-by-id db project)
     (details-for-project db project))))

(defn expand-related-policy-content [db policy]
  (let [related_content (db.policy/related-content-by-id db (select-keys policy [:id]))]
    (for [item related_content]
      (merge item
             {:entity_connections (db.policy/entity-connections-by-id db (select-keys item [:id]))
              :stakeholder_connections (db.policy/stakeholder-connections-by-id db (select-keys item [:id]))}))))

(defmethod extra-details "policy" [_ db {:keys [related_content] :as policy}]
  (merge
   {:entity_connections (db.policy/entity-connections-by-id db (select-keys policy [:id]))
    :stakeholder_connections (db.policy/stakeholder-connections-by-id db (select-keys policy [:id]))
    :related_content (if (seq related_content)
                       (expand-related-policy-content db policy)
                       [])
    :tags (db.policy/tags-by-id db (select-keys policy [:id]))
    :language (db.policy/language-by-policy-id db (select-keys policy [:id]))
    :type "Policy"}
   (when-let [implementing-mea (:implementing_mea policy)]
     {:implementing_mea (:name (db.country-group/country-group-by-id db {:id implementing-mea}))})))

(defn expand-related-technology-content [db technology]
  (let [related_content (db.technology/related-content-by-id db (select-keys technology [:id]))]
    (for [item related_content]
      (merge item
             {:entity_connections (db.technology/entity-connections-by-id db (select-keys item [:id]))
              :stakeholder_connections (db.technology/stakeholder-connections-by-id db (select-keys item [:id]))}))))

(defmethod extra-details "technology" [_ db {:keys [related_content] :as technology}]
  (merge
   {:entity_connections (db.technology/entity-connections-by-id db (select-keys technology [:id]))
    :stakeholder_connections (db.technology/stakeholder-connections-by-id db (select-keys technology [:id]))
    :related_content (if (seq related_content)
                       (expand-related-technology-content db technology)
                       [])
    :tags (db.technology/tags-by-id db (select-keys technology [:id]))
    :type "Technology"}
   (when-let [headquarters-country (:country technology)]
     {:headquarters (gpml.db.country/country-by-id db {:id headquarters-country})})))

(defmethod extra-details "stakeholder" [_ db stakeholder]
  (:data (db.detail/get-stakeholder-tags db stakeholder)))

(defn expand-related-resource-content [db resource]
  (let [related_content (db.resource/related-content-by-id db (select-keys resource [:id]))]
    (for [item related_content]
      (merge item
             {:entity_connections (db.resource/entity-connections-by-id db (select-keys item [:id]))
              :stakeholder_connections (db.resource/stakeholder-connections-by-id db (select-keys item [:id]))}))))

(defmethod extra-details "technical_resource" [_ db {:keys [related_content] :as resource}]
  {:entity_connections (db.resource/entity-connections-by-id db (select-keys resource [:id]))
   :stakeholder_connections (db.resource/stakeholder-connections-by-id db (select-keys resource [:id]))
   :related_content (if (seq related_content)
                      (expand-related-resource-content db resource)
                      [])
   :tags (db.resource/tags-by-id db (select-keys resource [:id]))})

(defmethod extra-details "financing_resource" [_ db {:keys [related_content] :as resource}]
  {:entity_connections (db.resource/entity-connections-by-id db (select-keys resource [:id]))
   :stakeholder_connections (db.resource/stakeholder-connections-by-id db (select-keys resource [:id]))
   :related_content (if (seq related_content)
                      (expand-related-resource-content db resource)
                      [])
   :tags (db.resource/tags-by-id db (select-keys resource [:id]))})

(defmethod extra-details "action_plan" [_ db {:keys [related_content] :as resource}]
  {:entity_connections (db.resource/entity-connections-by-id db (select-keys resource [:id]))
   :stakeholder_connections (db.resource/stakeholder-connections-by-id db (select-keys resource [:id]))
   :related_content (if (seq related_content)
                      (expand-related-resource-content db resource)
                      [])
   :tags (db.resource/tags-by-id db (select-keys resource [:id]))})

(defn expand-related-entity-content [db event]
  (let [related_content (db.event/related-content-by-id db (select-keys event [:id]))]
    (for [item related_content]
      (merge item
             {:entity_connections (db.event/entity-connections-by-id db (select-keys item [:id]))
              :stakeholder_connections (db.event/stakeholder-connections-by-id db (select-keys item [:id]))}))))

(defmethod extra-details "event" [_ db {:keys [related_content] :as event}]
  {:entity_connections (db.event/entity-connections-by-id db (select-keys event [:id]))
   :stakeholder_connections (db.event/stakeholder-connections-by-id db (select-keys event [:id]))
   :related_content (if (seq related_content)
                      (expand-related-entity-content db event)
                      [])
   :tags (db.event/tags-by-id db (select-keys event [:id]))
   :type "Event"})

(defmethod extra-details :nothing [_ _ _]
  nil)

(defn- get-resource-if-allowed [conn path user]
  (let [topic (:topic-type path)
        submission (->> {:table-name (util/get-internal-topic-type topic) :id (:topic-id path)}
                        (db.submission/detail conn))
        user-auth-roles (:roles (db.topic-stakeholder-auth/get-auth-by-topic-and-stakeholder conn {:topic-id (:topic-id path)
                                                                                                   :topic-type (util/get-internal-topic-type topic)
                                                                                                   :stakeholder (:id user)}))
        access-allowed? (or (= (:review_status submission) "APPROVED")
                            (contains? (set user-auth-roles) "owner")
                            (= (:role user) "ADMIN")
                            (and (not (nil? (:id user)))
                                 (= (:created_by submission) (:id user))))]
    (when access-allowed?
      submission)))

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

(defn- common-queries [table path & [geo url tags]]
  (filter some?
          [(when geo [(format "delete from %s_geo_coverage where %s = ?" table table) (:topic-id path)])
           (when url [(format "delete from %s_language_url where %s = ?" table table) (:topic-id path)])
           (when tags [(format "delete from %s_tag where %s = ?" table table) (:topic-id path)])
           (when (= "organisation" table)
             ["delete from resource_organisation where organisation=?" (:topic-id path)])
           (when (= "resource" table)
             ["delete from resource_organisation where resource=?" (:topic-id path)])
           [(format "delete from %s where id = ?" table) (:topic-id path)]]))

(defmethod ig/init-key ::delete [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters approved? :approved? user :user}]
    (let [conn        (:spec db)
          topic       (:topic-type path)
          authorized? (and (or (model.topic/public? topic) approved?)
                           (some? (get-resource-if-allowed conn path user)))
          sqls (condp = topic
                 "policy" (common-queries topic path true true true)
                 "event" (common-queries topic path true true true)
                 "technology" (common-queries topic path true true true)
                 "organisation" (common-queries topic path true false true)
                 "stakeholder" [["delete from stakeholder where id = ?" (:topic-id path)]]
                 "project" [["delete from initiative where id = ?"  (:topic-id path)]]
                 "action_plan" (common-queries "resource" path true true true)
                 "technical_resource" (common-queries "resource" path true true true)
                 "financing_resource" (common-queries "resource" path true true true))]
      (if authorized?
        (resp/response (do
                         (jdbc/with-db-transaction [tx-conn conn]
                           (doseq [s sqls]
                             (jdbc/execute! tx-conn s)))
                         {:deleted {:topic-id (:topic-id path)
                                    :topic topic}}))
        util/unauthorized))))

(defn- get-detail
  [conn table-name id]
  (let [{:keys [json] :as result}
        (if (some #{table-name} ["organisation" "stakeholder"])
          (db.detail/get-entity-details conn {:topic-type table-name :topic-id id})
          (db.detail/get-topic-details conn {:topic-type table-name :topic-id id}))]
    (-> result
        (dissoc :json)
        (merge json))))

(defmethod ig/init-key ::get [_ {:keys [db]}]
  (cache-hierarchies! (:spec db))
  (fn [{{:keys [path]} :parameters approved? :approved? user :user}]
    (let [conn (:spec db)
          topic (:topic-type path)
          id (:topic-id path)
          authorized? (and (or (model.topic/public? topic) approved?)
                           (some? (get-resource-if-allowed conn path user)))]
      (if authorized?
        (if-let [data (get-detail conn topic id)]
          (resp/response (merge
                          (adapt (merge
                                  (case topic
                                    "technology" (dissoc data :related_content :tags :remarks :name)
                                    (dissoc data :related_content :tags :abstract :description))
                                  (extra-details topic conn data)))
                          {:owners (:owners data)}))
          util/not-found)
        util/unauthorized))))

(def put-params
  ;; FIXME: Add validation
  ;; -- Cannot be empty, for one.
  [:map])

(defn update-resource-tags [conn mailjet-config table id tags]
  ;; Delete any existing tags
  (db.detail/delete-resource-related-data conn {:table (str table "_tag") :resource_type table :id id})

  ;; Create tags for the resource
  (when-not (empty? tags)
    (let [tag-ids (map #(:id %) tags)]
      (if-not (some nil? tag-ids)
        (db.detail/add-resource-related-tags conn {:table (str table "_tag")
                                                   :resource_type table
                                                   :tags (map #(list id %) tag-ids)})
        (let [tag-category (:id (db.tag/tag-category-by-category-name conn {:category "general"}))
              new-tags (filter #(not (contains? % :id)) tags)
              tags-to-db (map #(vector % tag-category) (vec (map #(:tag %) new-tags)))
              new-tag-ids (map #(:id %) (db.tag/new-tags conn {:tags tags-to-db}))]
          (db.detail/add-resource-related-tags conn {:table (str table "_tag")
                                                     :resource_type table
                                                     :tags (map #(list id %) new-tag-ids)})
          (map
           #(email/notify-admins-pending-approval
             conn
             mailjet-config
             (merge % {:type "tag"}))
           new-tags))))))

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

(defn update-policy-language [conn language policy-id]
  (let [lang-id (:id (db.language/language-by-iso-code conn (select-keys language [:iso_code])))]
    (if-not (nil? lang-id)
      (db.policy/add-language-to-policy conn {:id policy-id :language lang-id})
      (db.policy/add-language-to-policy conn {:id policy-id
                                              :language (:id (db.language/insert-new-language conn language))}))))

(defn -update-blank-resource-picture [conn image-type resource-id image-key]
  (db.detail/update-resource-table
   conn
   {:table image-type :id resource-id :updates {image-key ""}}))

(defn -update-resource-picture [conn image image-type resource-id logo?]
  (let [url (handler.image/assoc-image conn image image-type)
        image-key (if logo? :logo :image)]
    (when-not (and image (= image url))
      (db.detail/update-resource-table
       conn
       {:table image-type :id resource-id :updates {image-key url}}))))

(defn update-resource-image [conn image image-type resource-id]
  (if (empty? image)
    (-update-blank-resource-picture conn image-type resource-id :image)
    (-update-resource-picture conn image image-type resource-id false)))

(defn -update-initiative-picture [conn image image-type initiative-id]
  (let [url (handler.image/assoc-image conn image image-type)]
    (when-not (and image (= image url))
      (db.detail/update-resource-table
       conn
       {:table image-type :id initiative-id :updates {:qimage url}}))))

(defn update-initiative-image [conn image image-type initiative-id]
  (if (empty? image)
    (-update-blank-resource-picture conn image-type initiative-id :qimage)
    (-update-initiative-picture conn image image-type initiative-id)))

(defn update-resource-logo [conn image image-type resource-id]
  (if (empty? image)
    (-update-blank-resource-picture conn image-type resource-id :logo)
    (-update-resource-picture conn image image-type resource-id true)))

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
          (db.favorite/new-association conn association))))
    (when (not-empty entity_connections)
      (doseq [association (expand-associations entity_connections "organisation" topic resource-id)]
        (if (contains? association :id)
          (db.favorite/update-stakeholder-association conn association)
          (db.favorite/new-organisation-association conn association))))))

(defn update-resource [conn mailjet-config topic-type id updates]
  (let [table (cond
                (contains? constants/resource-types topic-type) "resource"
                :else topic-type)
        table-columns (-> updates
                          (dissoc
                           :tags :urls :geo_coverage_value :org
                           :image :photo :logo :language
                           :geo_coverage_country_groups
                           :geo_coverage_countries
                           :entity_connections
                           :individual_connections
                          ;; NOTE: we ignore resource_type since
                          ;; we don't expect it to change!
                           :resource_type)
                          (assoc :related_content (pg-util/->JDBCArray (:related_content updates) "integer"))
                          (merge (when (:topics updates)
                                   {:topics (pg-util/->JDBCArray (:topics updates) "text")}))
                          (set/rename-keys {:geo_coverage_value_subnational_city :subnational_city}))
        tags (remove nil? (:tags updates))
        urls (remove nil? (:urls updates))
        params {:table table :id id :updates table-columns}
        status (db.detail/update-resource-table conn params)
        org (:org updates)
        org-id (and org
                    (or
                     (:id org)
                     (and (= -1 (:id org))
                          (handler.org/create conn org))))]
    (when (and (contains? updates :language) (= topic-type "policy"))
      (update-policy-language conn (:language updates) id))
    (when (contains? updates :image)
      (update-resource-image conn (:image updates) table id))
    (when (contains? updates :photo)
      (update-resource-image conn (:photo updates) table id))
    (when (contains? updates :logo)
      (update-resource-logo conn (:logo updates) table id))
    (update-resource-tags conn mailjet-config table id tags)
    (update-resource-language-urls conn table id urls)
    (update-resource-geo-coverage-values conn table id updates)
    (when (contains? #{"resource"} table)
      (update-resource-organisation conn table id org-id))
    (update-resource-connections conn (:entity_connections updates) (:individual_connections updates) table id)
    status))

(defn update-initiative [conn mailjet-config id data]
  (let [params (merge {:id id} data)
        tags (remove nil? (:tags data))
        status (jdbc/with-db-transaction [conn-tx conn]
                 (let [status (db.detail/update-initiative conn-tx (-> params
                                                                       (assoc :related_content (pg-util/->JDBCArray (:related_content data) "integer"))
                                                                       (dissoc :tags :entity_connections :individual_connections :urls :org :geo_coverage_countries
                                                                               :geo_coverage_country_groups :qimage)))]
                   (handler.initiative/update-geo-initiative conn-tx id (handler.initiative/extract-geo-data params))
                   status))]
    (when (contains? data :qimage)
      (update-initiative-image conn (:qimage data) "initiative" id))
    (update-resource-tags conn mailjet-config "initiative" id tags)
    (update-resource-connections conn (:entity_connections data) (:individual_connections data) "initiative" id)
    status))

(defmethod ig/init-key ::put [_ {:keys [db mailjet-config]}]
  (fn [{{{:keys [topic-type topic-id] :as path} :path body :body} :parameters
        user :user}]
    (let [submission (get-resource-if-allowed (:spec db) path user)
          review_status (:review_status submission)]
      (if (some? submission)
        (let [conn (:spec db)
              status (if (= topic-type "project")
                       (update-initiative conn mailjet-config topic-id body)
                       (update-resource conn mailjet-config topic-type topic-id body))]
          (when (and (= status 1) (= review_status "REJECTED"))
            (db.submission/update-submission
             conn
             {:table-name (util/get-internal-topic-type topic-type)
              :id topic-id
              :review_status "SUBMITTED"}))
          (resp/response {:status (if (= status 1) "success" "failure")}))
        util/unauthorized))))

(defmethod ig/init-key ::put-params [_ _]
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
