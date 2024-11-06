(ns gpml.handler.project
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.set :as set]
   [duct.logger :refer [log]]
   [gpml.auth :as auth]
   [gpml.db.project :as db.prj]
   [gpml.domain.project :as dom.prj]
   [gpml.domain.types :as dom.types]
   [gpml.handler.file :as handler.file]
   [gpml.handler.resource.geo-coverage :as handler.geo-coverage]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.resource.related-content :as handler.resource.related-content]
   [gpml.handler.resource.tag :as handler.resource.tag]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as handler.util]
   [gpml.service.association :as srv.association]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util :as util]
   [gpml.util.email :as email]
   [gpml.util.malli :as util.malli]
   [gpml.util.postgresql :as pg-util]
   [gpml.util.sql :as sql-util]
   [integrant.core :as ig]
   [malli.util :as mu]
   [taoensso.timbre :as timbre])
  (:import
   [java.sql SQLException]))

(defn- get-projects [{:keys [db logger]} {:keys [parameters user]}]
  (try
    (let [db-opts (-> (:query parameters)
                      (assoc :stakeholders_ids [(:id user)])
                      (db.prj/opts->db-opts))
          results (db.prj/get-projects (:spec db)
                                       {:filters db-opts})]
      {:success? true
       :projects (map db.prj/db-project->project results)})
    (catch Exception e
      (timbre/with-context+ parameters
        (log logger :error :failed-to-get-projects e))
      {:success? false
       :reason :failed-to-get-projects
       :error-details {:error (if (instance? SQLException e)
                                (pg-util/get-sql-state e)
                                (.getMessage e))}})))

(defn- update-project [{:keys [db logger]} {:keys [parameters]}]
  (try
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [id (get-in parameters [:path :id])
            {:keys [ids]} (db.prj/opts->db-opts {:ids [id]})
            old-project (first (db.prj/get-projects conn {:filters {:ids ids}}))]
        (if-not (seq old-project)
          (r/bad-request {:success? false :reason
                          :failed-to-update-project})
          (let [{:keys [geo_coverage_type
                        geo_coverage_countries
                        geo_coverage_country_groups
                        geo_coverage_country_states] :as body} (:body parameters)
                db-project (db.prj/project->db-project body)
                updated-values (db.prj/update-project conn
                                                      {:updates db-project
                                                       :id id})
                new-geo-coverage-type (keyword geo_coverage_type)
                old-geo-coverage-type (keyword (:geo_coverage_type old-project))]
            (if (= updated-values 1)
              (let [result (cond
                             (and (= new-geo-coverage-type :global)
                                  (= old-geo-coverage-type :global))
                             {:success? true}

                             (and (= new-geo-coverage-type :global)
                                  (not= old-geo-coverage-type :global))
                             (handler.geo-coverage/delete-resource-geo-coverage conn :project id)

                             :else
                             (handler.geo-coverage/update-resource-geo-coverage conn
                                                                                :project
                                                                                id
                                                                                new-geo-coverage-type
                                                                                {:countries geo_coverage_countries
                                                                                 :country-groups geo_coverage_country_groups
                                                                                 :country-states geo_coverage_country_states}))]
                (if (:success? result)
                  (r/ok result)
                  (throw (ex-info "Failed to update project geo coverage" {}))))
              (throw (ex-info "Failed to update project" {:updated-values updated-values})))
            (r/ok {:success? true})))))
    (catch Exception e
      (timbre/with-context+ parameters
        (log logger :error :failed-to-update-project e))
      (r/server-error {:success? false
                       :reason :failed-to-update-project
                       :error-details {:error (if (instance? SQLException e)
                                                (pg-util/get-sql-state e)
                                                (.getMessage e))}}))))

(defn- delete-project [{:keys [db logger]} {:keys [parameters]}]
  (try
    (let [project-id (get-in parameters [:path :id])
          opts {:ids [project-id]}
          db-opts (db.prj/opts->db-opts opts)
          filters (select-keys db-opts [:ids])
          deleted-values (db.prj/delete-projects (:spec db)
                                                 {:filters filters})]
      (if (= deleted-values 1)
        (let [{:keys [success?] :as delete-ctx-result} (srv.permissions/delete-resource-context
                                                        {:conn (:spec db)
                                                         :logger logger}
                                                        {:resource-id project-id
                                                         :context-type-name :project})]
          (if success?
            (r/ok {:success? true})
            (r/server-error delete-ctx-result)))
        (r/server-error {:success? false
                         :reason :could-not-delete-project})))
    (catch Exception e
      (timbre/with-context+ parameters
        (log logger :error :failed-to-delete-project e))
      (r/server-error {:success? false
                       :reason :failed-to-delete-project
                       :error-details {:error (if (instance? SQLException e)
                                                (pg-util/get-sql-state e)
                                                (.getMessage e))}}))))

(defn- create-project [{:keys [logger mailjet-config] :as config}
                       conn
                       user
                       {:keys [title start_date end_date summary publish_year valid_from valid_to
                               image thumbnail gallery videos background purpose highlights outcomes
                               created_by url info_docs sub_content_type language source
                               capacity_building geo_coverage_type geo_coverage_countries
                               geo_coverage_country_groups geo_coverage_country_states
                               tags related_content entity_connections individual_connections]}]
  (let [image-id (when (seq image)
                   (handler.file/create-file config conn image :project :images :public))
        thumbnail-id (when (seq thumbnail)
                       (handler.file/create-file config conn thumbnail :project :images :public))
        data (cond-> {:title title
                      :start_date start_date
                      :end_date end_date
                      :publish_year publish_year
                      :summary summary
                      :valid_from valid_from
                      :valid_to valid_to
                      :geo_coverage_type geo_coverage_type
                      :geo_coverage_countries geo_coverage_countries
                      :geo_coverage_country_groups geo_coverage_country_groups
                      :geo_coverage_country_states geo_coverage_country_states
                      :created_by created_by
                      :url url
                      :info_docs info_docs
                      :sub_content_type sub_content_type
                      :language language
                      :source source
                      :videos videos
                      :background background
                      :purpose purpose
                      :highlights highlights
                      :outcomes outcomes}
               (some? capacity_building)
               (assoc :capacity_building capacity_building)
               image-id
               (assoc :image_id image-id)
               thumbnail-id
               (assoc :thumbnail_id thumbnail-id))
        project-id (->>
                    (update data :source #(sql-util/keyword->pg-enum % "resource_source"))
                    (db.prj/new-project conn)
                    :id)
        gallery-ids (when (seq gallery)
                      (map #(handler.file/create-file config conn % :project :images :public) gallery))
        geo-coverage-type (keyword geo_coverage_type)
        api-individual-connections (handler.util/individual-connections->api-individual-connections conn individual_connections created_by)
        org-associations (map #(set/rename-keys % {:entity :organisation}) entity_connections)]
    (when (seq gallery-ids)
      (db.prj/create-project-gallery conn {:images (map (partial vector project-id) gallery-ids)}))
    (when (not-empty tags)
      (handler.resource.tag/create-resource-tags conn logger mailjet-config {:tags tags
                                                                             :tag-category "general"
                                                                             :resource-name "project"
                                                                             :resource-id project-id}))
    (when (seq related_content)
      (handler.resource.related-content/create-related-contents conn logger project-id "project" related_content))
    (srv.permissions/create-resource-context
     {:conn conn
      :logger logger}
     {:context-type :project
      :resource-id project-id})
    (srv.association/save-associations
     {:conn conn
      :logger logger}
     {:org-associations org-associations
      :sth-associations (if (seq api-individual-connections)
                          api-individual-connections
                          [{:role "owner"
                            :stakeholder (:id user)}])
      :resource-type "project"
      :resource-id project-id})
    (handler.geo-coverage/create-resource-geo-coverage conn
                                                       :project
                                                       project-id
                                                       geo-coverage-type
                                                       {:countries geo_coverage_countries
                                                        :country-groups geo_coverage_country_groups
                                                        :country-states geo_coverage_country_states})
    (email/notify-admins-pending-approval
     conn
     mailjet-config
     (merge data {:type "project"}))
    project-id))

(defmethod ig/init-key :gpml.handler.project/post
  [_ {:keys [db logger] :as config}]
  (fn [{:keys [body-params parameters user]}]
    (try
      (if-not (h.r.permission/operation-allowed?
               config
               {:user-id (:id user)
                :entity-type :project
                :operation-type :create
                :root-context? true})
        (r/forbidden {:message "Unauthorized"})
        (jdbc/with-db-transaction [tx (:spec db)]
          (let [project-id (create-project
                            config
                            tx
                            user
                            (assoc body-params
                                   :created_by (:id user)
                                   :source (get-in parameters [:body :source])))]
            (r/created {:success? true
                        :message "New project created"
                        :id project-id}))))
      (catch Exception e
        (log logger :error :failed-to-create-project e)
        (let [response {:success? false
                        :reason :could-not-create-project}]
          (if (instance? SQLException e)
            (r/server-error response)
            (r/server-error (assoc-in response [:body :error-details :error] (.getMessage e)))))))))

(def ^:private post-params
  [:and
   (into
    [:map
     [:title string?]
     [:start_date string?]
     [:end_date string?]
     [:publish_year {:optional true} integer?]
     [:summary {:optional true} string?]
     [:valid_from {:optional true} string?]
     [:valid_to {:optional true} string?]
     [:geo_coverage_type
      [:enum "global", "national", "transnational",
       "sub-national"]]
     [:image {:optional true} [:fn (comp util/base64? util/base64-headless)]]
     [:thumbnail {:optional true} [:fn (comp util/base64? util/base64-headless)]]
     [:gallery {:optional true} [:set [:fn (comp util/base64? util/base64-headless)]]]
     [:videos {:optional true} [:set string?]]
     [:background {:optional true} string?]
     [:purpose {:optional true} string?]
     [:highlights {:optional true} [:set string?]]
     [:outcomes {:optional true} [:set string?]]
     [:url {:optional true} string?]
     [:info_docs {:optional true} string?]
     [:capacity_building {:optional true} boolean?]
     [:sub_content_type {:optional true} string?]
     [:related_content {:optional true}
      [:vector {:optional true}
       [:map {:optional true}
        [:id [:int]]
        [:type (apply conj [:enum] dom.types/resources-types)]]]]
     [:entity_connections {:optional true}
      [:vector {:optional true}
       [:map
        [:entity int?]
        [:role
         [:enum "owner" "implementor" "partner" "donor"]]]]]
     [:individual_connections {:optional true}
      [:vector {:optional true}
       [:map
        [:stakeholder int?]
        [:role
         [:enum "owner" "resource_editor"]]]]]
     [:tags {:optional true}
      [:vector {:optional true}
       [:map {:optional true}
        [:id {:optional true} pos-int?]
        [:tag string?]]]]
     [:language string?]
     [:source
      {:default dom.types/default-resource-source
       :decode/string keyword
       :decode/json keyword}
      (apply conj [:enum] dom.types/resource-source-types)]
     auth/owners-schema]
    handler.geo-coverage/api-geo-coverage-schemas)
   handler.geo-coverage/api-geo-coverage-validator-schema])

(defmethod ig/init-key :gpml.handler.project/post-params
  [_ _]
  post-params)

(defmethod ig/init-key :gpml.handler.project/post-responses
  [_ _]
  (let [project-id-properties {:swagger
                               {:description "The newly created Project's identifier."
                                :type "integer"}}
        ok-response-schema-update-fn #(mu/update-properties % (constantly project-id-properties))]
    {200 {:body (-> handler.util/default-ok-response-body-schema
                    (mu/assoc :project_id pos-int?)
                    (mu/update-in [:project_id] ok-response-schema-update-fn))}
     500 {:body handler.util/default-error-response-body-schema}}))

(defmethod ig/init-key :gpml.handler.project/get
  [_ {:keys [db]}]
  (fn [{:keys [parameters]}]
    (let [conn (:spec db)
          projects (db.prj/project-all conn (:query parameters))]
      (r/ok {:success? true :results projects}))))

(defmethod ig/init-key :gpml.handler.project/get-by-id
  [_ {:keys [db]}]
  (fn [{{:keys [path]} :parameters}]
    (let [conn (:spec db)
          project (db.prj/project-by-id conn path)]
      (if (seq project)
        (r/ok {:success? true
               :project project})
        (r/not-found {:success? false
                      :reason :project-not-found})))))

(defmethod ig/init-key :gpml.handler.project/get-params
  [_ _]
  {:query [:map
           [:page {:default 1} pos-int?]
           [:limit {:default 5} pos-int?]]})

(defmethod ig/init-key :gpml.handler.project/get-responses
  [_ _]
  {200 {:body (-> handler.util/default-ok-response-body-schema
                  (mu/assoc :projects [:maybe [:sequential dom.prj/Project]]))}
   500 {:body handler.util/default-error-response-body-schema}})

(defmethod ig/init-key :gpml.handler.project/put
  [_ config]
  (fn [{:keys [user parameters] :as req}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :project
          :entity-id (get-in parameters [:path :id])
          :operation-type :update})
      (update-project config req)
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.project/put-params
  [_ _]
  {:path (mu/select-keys dom.prj/Project [:id])
   :body (mu/optional-keys (util.malli/dissoc dom.prj/Project [:id :stakeholder_id]))})

(defmethod ig/init-key :gpml.handler.project/put-responses
  [_ _]
  {200 {:body handler.util/default-ok-response-body-schema}
   500 {:body handler.util/default-error-response-body-schema}})

(defmethod ig/init-key :gpml.handler.project/delete
  [_ config]
  (fn [{:keys [user parameters] :as req}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :project
          :entity-id (get-in parameters [:path :id])
          :operation-type :delete})
      (delete-project config req)
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.project/delete-params
  [_ _]
  {:path (mu/select-keys dom.prj/Project [:id])})

(defmethod ig/init-key :gpml.handler.project/delete-responses
  [_ _]
  {200 {:body handler.util/default-ok-response-body-schema}
   500 {:body handler.util/default-error-response-body-schema}})
