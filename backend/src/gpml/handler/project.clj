(ns gpml.handler.project
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.project :as db.prj]
            [gpml.db.project.geo-coverage :as db.prj.geo]
            [gpml.domain.project :as dom.prj]
            [gpml.domain.types :as dom.types]
            [gpml.handler.responses :as r]
            [gpml.handler.util :as handler.util]
            [gpml.util.postgresql :as pg-util]
            [gpml.util.sql :as sql-util]
            [integrant.core :as ig]
            [malli.util :as mu])
  (:import [java.sql SQLException]))

(def ^:private api-opts-schema
  [:map
   [:ids
    {:optional true
     :swagger {:description "A comma separated list of Project's identifiers."
               :type "string"
               :format "uuid"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     uuid?]]
   [:stakeholders_ids
    {:optional true
     :swagger {:description "A comma separated list of stakeholder identifiers."
               :type "integer"
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
     (apply conj [:enum] dom.prj/project-types)]]])

(defn- create-project
  [{:keys [db logger]} {:keys [parameters user] :as _req}]
  (try
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [body (:body parameters)
            db-project (-> body
                           (assoc :stakeholder_id (:id user))
                           (dom.prj/create-project)
                           (db.prj/project->db-project))
            inserted-values (db.prj/create-projects conn
                                                    {:insert-cols (map name (keys db-project))
                                                     :insert-values [(vals db-project)]})]
        (if (= inserted-values 1)
          (let [project-id (:id db-project)
                project-geo-coverage-keys [:project_id :country_id :country_group_id]
                geo-coverage-countries (:geo_coverage_countries body)
                geo-coverage-country-groups (:geo_coverage_country_groups body)
                project-geo-coverage-countries (map #(zipmap project-geo-coverage-keys [project-id % nil]) geo-coverage-countries)
                project-geo-coverage-country-groups (map #(zipmap project-geo-coverage-keys [project-id nil %]) geo-coverage-country-groups)
                project-geo-coverage (concat project-geo-coverage-countries project-geo-coverage-country-groups)
                insert-values (sql-util/get-insert-values project-geo-coverage-keys project-geo-coverage)
                inserted-values (db.prj.geo/create-project-geo-coverage conn
                                                                        {:insert-cols (map name project-geo-coverage-keys)
                                                                         :insert-values insert-values})]
            (when-not (= inserted-values (count project-geo-coverage))
              (throw (ex-info "Failed to create project geo coverage" {:inserted-values inserted-values}))))
          (throw (ex-info "Failed to create project" {:inserted-values inserted-values})))
        (r/ok {:success? true :project_id (:id db-project)})))
    (catch Exception e
      (log logger :error ::failed-to-create-project {:exception-message (.getMessage e)
                                                     :context-data parameters})
      (r/server-error {:success? false
                       :reason :failed-to-create-project
                       :error-details {:error (if (instance? SQLException e)
                                                (pg-util/get-sql-state e)
                                                (.getMessage e))}}))))

(defn- get-projects
  [{:keys [db logger]} {:keys [parameters]}]
  (try
    (let [db-opts (db.prj/opts->db-opts (:query parameters))
          results (db.prj/get-projects (:spec db)
                                       {:filters db-opts})]
      {:success? true
       :projects results})
    (catch Exception e
      (log logger :error ::failed-to-get-projects {:exception-message (.getMessage e)
                                                   :context-data parameters})
      {:success? false
       :reason :failed-to-get-projects
       :error-details {:error (if (instance? SQLException e)
                                (pg-util/get-sql-state e)
                                (.getMessage e))}})))

(defn- update-project
  [{:keys [db logger]} {:keys [parameters]}]
  (try
    (jdbc/with-db-transaction [conn (:spec db)]
      (let [{:keys [geo_coverage_countries geo_coverage_country_groups] :as body} (:body parameters)
            {:keys [id]} (:path parameters)
            db-project (-> body
                           (db.prj/project->db-project))
            updated-values (db.prj/update-project conn
                                                  {:updates db-project
                                                   :id id})]
        (if (= updated-values 1)
          (when (or (seq geo_coverage_countries)
                    (seq geo_coverage_country_groups))
            (let [_deleted-values (db.prj.geo/delete-project-geo-coverage conn {:project-id id})
                  project-geo-coverage-keys [:project_id :country_id :country_group_id]
                  project-geo-coverage-countries (map #(zipmap project-geo-coverage-keys [id % nil]) geo_coverage_countries)
                  project-geo-coverage-country-groups (map #(zipmap project-geo-coverage-keys [id nil %]) geo_coverage_country_groups)
                  project-geo-coverage (concat project-geo-coverage-countries project-geo-coverage-country-groups)
                  insert-values (sql-util/get-insert-values project-geo-coverage-keys project-geo-coverage)
                  inserted-values (db.prj.geo/create-project-geo-coverage conn
                                                                          {:insert-cols (map name project-geo-coverage-keys)
                                                                           :insert-values insert-values})]
              (when-not (= inserted-values (count project-geo-coverage))
                (throw (ex-info "Failed to update project geo coverage" {:inserted-values inserted-values})))))
          (throw (ex-info "Failed to update project" {:updated-values updated-values})))
        (r/ok {:success? true})))
    (catch Exception e
      (log logger :error ::failed-to-update-project {:exception-message (.getMessage e)
                                                     :context-data {:parameters parameters}})
      (r/server-error {:success? false
                       :reason :failed-to-update-project
                       :error-details {:error (if (instance? SQLException e)
                                                (pg-util/get-sql-state e)
                                                (.getMessage e))}}))))

(defn- delete-project
  [{:keys [db logger]} {:keys [parameters]}]
  (try
    (let [opts {:ids [(get-in parameters [:path :id])]}
          db-opts (db.prj/opts->db-opts opts)
          filters (select-keys db-opts [:ids])
          deleted-values (db.prj/delete-projects (:spec db)
                                                 {:filters filters})]
      (if (= deleted-values 1)
        (r/ok {:success? true})
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
  (fn [req]
    (create-project config req)))

(defmethod ig/init-key :gpml.handler.project/post-params
  [_ _]
  {:body (-> dom.prj/Project
             (mu/dissoc :id)
             (mu/dissoc :stakeholder_id))})

(defmethod ig/init-key :gpml.handler.project/post-responses
  [_ _]
  (let [project-id-properties {:swagger
                               {:description "The newly created Project's identifier."
                                :type "string"
                                :format "uuid"}}
        ok-response-schema-update-fn #(mu/update-properties % (constantly project-id-properties))]
    {200 {:body (-> handler.util/default-ok-response-body-schema
                    (mu/assoc :project_id uuid?)
                    (mu/update-in [:project_id] ok-response-schema-update-fn))}
     500 {:body handler.util/default-error-response-body-schema}}))

(defmethod ig/init-key :gpml.handler.project/get
  [_ config]
  (fn [req]
    (let [result (get-projects config req)]
      (if (:success? result)
        (r/ok result)
        (r/server-error result)))))

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
  (fn [req]
    (update-project config req)))

(defmethod ig/init-key :gpml.handler.project/put-params
  [_ _]
  {:path (mu/select-keys dom.prj/Project [:id])
   :body (mu/optional-keys (mu/dissoc dom.prj/Project :id))})

(defmethod ig/init-key :gpml.handler.project/put-responses
  [_ _]
  {200 {:body handler.util/default-ok-response-body-schema}
   500 {:body handler.util/default-error-response-body-schema}})

(defmethod ig/init-key :gpml.handler.project/get-by-id
  [_ config]
  (fn [{{:keys [path]} :parameters :as req}]
    (let [req (assoc-in req [:parameters :query :ids] [(:id path)])
          result (get-projects config req)]
      (if (:success? result)
        (if-let [project (-> result :projects first)]
          (r/ok {:success? true
                 :project project})
          (r/not-found {:success? false
                        :reason :project-not-found}))
        (r/server-error result)))))

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
  (fn [req]
    (delete-project config req)))

(defmethod ig/init-key :gpml.handler.project/delete-params
  [_ _]
  {:path (mu/select-keys dom.prj/Project [:id])})

(defmethod ig/init-key :gpml.handler.project/delete-responses
  [_ _]
  {200 {:body handler.util/default-ok-response-body-schema}
   500 {:body handler.util/default-error-response-body-schema}})
