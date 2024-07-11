(ns gpml.handler.like
  (:require
   [duct.logger :refer [log]]
   [gpml.db.like :as db.like]
   [gpml.domain.types :as dom.types]
   [gpml.handler.responses :as r]
   [gpml.util.postgresql :as pg-util]
   [integrant.core :as ig])
  (:import
   (java.sql SQLException)))

(def table-rename-mapping
  "Some topics like financing_resource aren't the real table
  names we want to query. Therefore, when passing the following topic
  options as tables we need to rename them to their proper source
  table."
  {"financing_resource" "resource"
   "action_plan" "resource"
   "technical_resource" "resource"
   "data_catalog" "resource"})

(def post-params
  [:and
   [:map
    [:topic (apply conj [:enum] dom.types/topic-types)]
    [:topic_id int?]]])

(def ^:private get-detail-path-params-schema
  [:map
   [:topic-type
    {:swagger {:description "The topic type (or entity type) to get details from."
               :type "string"
               :enum dom.types/topic-types}}
    (apply conj [:enum] dom.types/topic-types)]
   [:topic-id
    {:swagger {:description "The topic ID (or entity ID)."
               :type "integer"}}
    [:int {:min 1}]]])

(defmethod ig/init-key ::get [_ {:keys [logger db]}]
  (fn [{:keys [user]}]
    (try
      (let [db (:spec db)]
        (r/ok {:success? true
               :results (db.like/get-likes db {:stakeholder-id (:id user)})}))
      (catch Exception e
        (log logger :error :failed-to-like-resource e)
        (r/server-error {:success? false
                         :reason :failed-to-like-resource
                         :error-details {:error (if (instance? SQLException e)
                                                  (pg-util/get-sql-state e)
                                                  (.getMessage e))}})))))

(defmethod ig/init-key ::post [_ {:keys [logger db]}]
  (fn [{:keys [user body-params]}]
    (try
      (let [db (:spec db)
            {resource-id :topic_id resource-type :topic} body-params]
        (db.like/create-like db {:resource-id resource-id
                                 :resource-type resource-type
                                 :stakeholder-id (:id user)})
        (r/ok {:success? true
               :message "OK"}))
      (catch Exception e
        (log logger :error :failed-to-like-resource e)
        (r/server-error {:success? false
                         :reason :failed-to-like-resource
                         :error-details {:error (if (instance? SQLException e)
                                                  (pg-util/get-sql-state e)
                                                  (.getMessage e))}})))))

(defmethod ig/init-key ::delete [_ {:keys [logger db]}]
  (fn [{:keys [user] {{:keys [topic-type topic-id]} :path} :parameters}]
    (try
      (let [db (:spec db)]
        (db.like/delete-like db {:resource-id topic-id
                                 :resource-type topic-type
                                 :stakeholder-id (:id user)})
        (r/ok {:success? true
               :message "OK"}))
      (catch Exception e
        (log logger :error :failed-to-delete-like e)
        (r/server-error {:success? false
                         :reason :failed-to-delete-like
                         :error-details {:error (if (instance? SQLException e)
                                                  (pg-util/get-sql-state e)
                                                  (.getMessage e))}})))))

(defmethod ig/init-key ::post-params [_ _]
  post-params)

(defmethod ig/init-key ::get-params [_ _]
  {:path get-detail-path-params-schema})
