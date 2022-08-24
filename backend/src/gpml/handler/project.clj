(ns gpml.handler.project
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.project :as db.prj]
            [gpml.domain.project :as dom.prj]
            [gpml.domain.types :as dom.types]
            [gpml.handler.responses :as r]
            [gpml.util.postgresql :as pg-util]
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
    (let [db-project (-> (:body parameters)
                         (assoc :stakeholder_id (:id user))
                         (dom.prj/create-project)
                         (db.prj/project->db-project))
          inserted-values (db.prj/create-projects (:spec db) {:insert-cols (map name (keys db-project))
                                                              :insert-values [(vals db-project)]})]
      (if (= inserted-values 1)
        (r/ok {:success? true
               :project_id (:id db-project)})
        (r/server-error {:success? false
                         :reason :failed-to-create-project})))
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
    (let [db-project (-> (:body parameters)
                         (db.prj/project->db-project))
          updated-values (db.prj/update-project (:spec db)
                                                {:updates db-project
                                                 :id (get-in parameters [:path :id])})]
      (if (= updated-values 1)
        (r/ok {:success? true})
        (r/server-error {:success? false
                         :reason :failed-to-update-project})))
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
  {200 {:body [:map
               [:success?
                {:swagger {:description "Indicates if the operation was successfull or not."
                           :type "boolean"}}
                boolean?]
               [:project_id
                {:swagger {:description "The newly created Project's identifier."
                           :type "string"
                           :format "uuid"}}
                uuid?]]}
   500 {:body [:map
               [:success?
                {:swagger {:description "Indicates if the operation was successfull or not."
                           :type "boolean"}}
                boolean?]
               [:reason
                {:swagger {:description "The reason of request failure."
                           :type "string"}}
                keyword?]
               [:error-details
                {:swagger {:description "JSON object with more details about the error."
                           :type "object"
                           :properties {:error {:type "string"}}
                           :additionalProperties {:type "string"}}}
                map?]]}})

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

(defmethod ig/init-key :gpml.handler.project/put
  [_ config]
  (fn [req]
    (update-project config req)))

(defmethod ig/init-key :gpml.handler.project/put-params
  [_ _]
  {:path (mu/select-keys dom.prj/Project [:id])
   :body (mu/optional-keys (mu/dissoc dom.prj/Project :id))})

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

(defmethod ig/init-key :gpml.handler.project/delete
  [_ config]
  (fn [req]
    (delete-project config req)))

(defmethod ig/init-key :gpml.handler.project/delete-params
  [_ _]
  {:path (mu/select-keys dom.prj/Project [:id])})
