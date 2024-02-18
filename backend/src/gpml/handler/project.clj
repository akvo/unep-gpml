(ns gpml.handler.project
  (:require
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.db.project :as db.prj]
   [gpml.domain.project :as dom.prj]
   [gpml.domain.types :as dom.types]
   [gpml.handler.resource.geo-coverage :as handler.geo-coverage]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as handler.util]
   [gpml.service.permissions :as srv.permissions]
   [gpml.util.malli :as util.malli]
   [gpml.util.postgresql :as pg-util]
   [integrant.core :as ig]
   [malli.util :as mu])
  (:import
   [java.sql SQLException]))

(def ^:private api-opts-schema
  [:map
   [:ids
    {:optional true
     :swagger {:description "A comma separated list of Project's identifiers."
               :type "string"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     pos-int?]]
   [:geo_coverage_types
    {:optional true
     :swagger {:description "A comma separated list of geo_coverage_types"
               :type "string"
               :enum dom.types/geo-coverage-types
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     (apply conj [:enum] dom.types/geo-coverage-types)]]
   [:types
    {:optional true
     :swagger {:description "A comma separated list of Project's types."
               :type "string"
               :enum dom.prj/project-types
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     (apply conj [:enum] dom.prj/project-types)]]
   [:countries
    {:optional true
     :swagger {:description "A comma separated list of country identifiers."
               :type "string"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     pos-int?]]
   [:country_groups
    {:optional true
     :swagger {:description "A comma separated list of country group identifiers."
               :type "string"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     pos-int?]]
   [:stages
    {:optional true
     :swagger {:description "A comma separated list of Project's stages."
               :type "string"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     (apply conj [:enum] dom.prj/project-stages)]]])

(defn- create-project [{:keys [db logger]} {:keys [parameters user] :as _req}]
  (try
    (jdbc/with-db-transaction [tx (:spec db)]
      (let [body (:body parameters)
            db-project (-> body
                           (assoc :stakeholder_id (:id user))
                           (db.prj/project->db-project))
            inserted-values (db.prj/create-projects tx
                                                    {:insert-cols (map name (keys db-project))
                                                     :insert-values [(vals db-project)]})
            {:keys [geo_coverage_type
                    geo_coverage_countries
                    geo_coverage_country_groups
                    geo_coverage_country_states]} body
            geo-coverage-type (keyword geo_coverage_type)
            project-id (-> inserted-values first :id)]
        (if (= (count inserted-values) 1)
          (do
            (let [result (handler.geo-coverage/create-resource-geo-coverage
                          tx
                          :project
                          project-id
                          geo-coverage-type
                          {:countries geo_coverage_countries
                           :country-groups geo_coverage_country_groups
                           :country-states geo_coverage_country_states})]
              (when-not (:success? result)
                (throw (ex-info "Failed to create project geo coverage" {:inserted-values inserted-values}))))
            (srv.permissions/create-resource-context
             {:conn tx
              :logger logger}
             {:context-type :project
              :resource-id project-id})
            (srv.permissions/assign-roles-to-users-from-connections
             {:conn tx
              :logger logger}
             {:context-type :project
              :resource-id project-id
              :individual-connections [{:role "owner"
                                        :stakeholder (:id user)}]}))
          (throw (ex-info "Failed to create project" {:inserted-values inserted-values})))
        (r/ok {:success? true :project_id project-id})))
    (catch Exception e
      (log logger :error ::failed-to-create-project {:exception-message (.getMessage e)
                                                     :context-data parameters})
      (r/server-error {:success? false
                       :reason :failed-to-create-project
                       :error-details {:error (if (instance? SQLException e)
                                                (pg-util/get-sql-state e)
                                                (.getMessage e))}}))))

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
      (log logger :error ::failed-to-get-projects {:exception-message (.getMessage e)
                                                   :context-data parameters})
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
      (log logger :error ::failed-to-update-project {:exception-message (.getMessage e)
                                                     :context-data {:parameters parameters}})
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
      (log logger :error ::failed-to-delete-project {:exception-message (.getMessage e)
                                                     :context-data {:parameters parameters}})
      (r/server-error {:success? false
                       :reason :failed-to-delete-project
                       :error-details {:error (if (instance? SQLException e)
                                                (pg-util/get-sql-state e)
                                                (.getMessage e))}}))))

(defmethod ig/init-key :gpml.handler.project/post
  [_ config]
  (fn [{:keys [user] :as req}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :project
          :operation-type :create
          :root-context? true})
      (create-project config req)
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.project/post-params
  [_ _]
  {:body (-> dom.prj/Project
             (mu/dissoc :id)
             (mu/dissoc :stakeholder_id))})

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
  [_ config]
  (fn [{:keys [user] :as req}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :application
          :custom-permission :read-projects
          :root-context? true})
      (let [result (get-projects config req)]
        (if (:success? result)
          (r/ok result)
          (r/server-error result)))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.project/get-params
  [_ _]
  {:query api-opts-schema})

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

(defmethod ig/init-key :gpml.handler.project/get-by-id
  [_ config]
  (fn [{{:keys [path]} :parameters user :user :as req}]
    (if (h.r.permission/operation-allowed?
         config
         {:user-id (:id user)
          :entity-type :project
          :entity-id (:id path)
          :operation-type :read})
      (let [req (assoc-in req [:parameters :query :ids] [(:id path)])
            result (get-projects config req)]
        (if (:success? result)
          (if-let [project (-> result :projects first)]
            (r/ok {:success? true
                   :project project})
            (r/not-found {:success? false
                          :reason :project-not-found}))
          (r/server-error result)))
      (r/forbidden {:message "Unauthorized"}))))

(defmethod ig/init-key :gpml.handler.project/get-by-id-params
  [_ _]
  {:path (mu/select-keys dom.prj/Project [:id])})

(defmethod ig/init-key :gpml.handler.project/get-by-id-responses
  [_ _]
  {200 {:body (-> handler.util/default-ok-response-body-schema
                  (mu/assoc :project dom.prj/Project))}
   400 {:body handler.util/default-error-response-body-schema}
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
