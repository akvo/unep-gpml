(ns gpml.handler.programmatic.badge
  (:require [duct.logger :refer [log]]
            [gpml.db.badge :as db.badge]
            [gpml.domain.badge :as dom.badge]
            [gpml.domain.file :as dom.file]
            [gpml.handler.responses :as r]
            [gpml.service.file :as srv.file]
            [gpml.service.permissions :as srv.permissions]
            [gpml.util.malli :as util.malli]
            [gpml.util.sql :as sql-util]
            [gpml.util.thread-transactions :as tht]
            [integrant.core :as ig]))

(defn- create-badge
  [{:keys [db logger] :as config} badge]
  (let [transactions [{:txn-fn
                       (fn create-content-file
                         [{{:keys [content_file]} :badge :as context}]
                         (let [content-file-entity (dom.file/base64->file content_file :badge :content_files :public)
                               result (srv.file/create-file config (:spec db) content-file-entity)]
                           (if (:success? result)
                             (assoc context :content-file-entity (dissoc content-file-entity :content))
                             (assoc context
                                    :success? false
                                    :reason (:reason result)
                                    :error-details (:error-details result)))))
                       :rollback-fn
                       (fn rollback-create-content-file
                         [{:keys [content-file-entity] :as context}]
                         (when (seq content-file-entity)
                           (srv.file/delete-file config (:spec db) {:id (:id content-file-entity)}))
                         (dissoc context :content-file-entity :badge))}
                      {:txn-fn
                       (fn create-badge
                         [{:keys [content-file-entity] :as context}]
                         (let [db-badge (db.badge/badge->db-badge
                                         (-> badge
                                             (assoc :content_file_id (:id content-file-entity))
                                             (dissoc :content_file)))
                               insert-cols (sql-util/get-insert-columns-from-entity-col [db-badge])
                               insert-values (sql-util/entity-col->persistence-entity-col [db-badge])
                               {:keys [success? id] :as result} (db.badge/create-badge
                                                                 (:spec db)
                                                                 {:insert-cols insert-cols
                                                                  :insert-values insert-values})]
                           (if success?
                             (assoc-in context [:badge :id] id)
                             (assoc context
                                    :success? false
                                    :error-details (:error-details result)
                                    :reason :failed-to-create-badge))))
                       :rollback-fn
                       (fn rollback-create-badge
                         [{:keys [badge] :as context}]
                         (db.badge/delete-badge (:spec db) (:id badge))
                         (dissoc context :badge))}
                      {:txn-fn
                       (fn create-badge-rbac-context
                         [{{:keys [id]} :badge :as context}]
                         (let [result (srv.permissions/create-resource-context {:conn (:spec db)
                                                                                :logger logger}
                                                                               {:context-type :badge
                                                                                :resource-id id})]
                           (if (:success? result)
                             {:success? true
                              :id id}
                             (assoc context
                                    :success? false
                                    :reason :failed-to-create-badge-rbac-context
                                    :error-details result))))}]
        context {:success? true
                 :badge badge}]
    (tht/thread-transactions logger transactions context)))

(defmethod ig/init-key :gpml.handler.programmatic.badge/post
  [_ {:keys [logger] :as config}]
  (fn [req]
    (try
      (let [api-badge (get-in req [:parameters :body])
            badge-schema-keys (util.malli/keys dom.badge/Badge)
            badge (-> api-badge
                      (select-keys badge-schema-keys))
            {:keys [success?] :as result} (create-badge config badge)]
        (if success?
          (r/ok result)
          (r/server-error result)))
      (catch Throwable t
        (log logger :error ::create-badge-failed {:exception-message (.getMessage t)})
        (r/server-error {:success? false
                         :reason :could-not-create-badge
                         :error-details {:message (.getMessage t)}})))))

(defmethod ig/init-key :gpml.handler.programmatic.badge/post-params
  [_ _]
  {:body (-> dom.badge/Badge
             (util.malli/dissoc [:id]))})
