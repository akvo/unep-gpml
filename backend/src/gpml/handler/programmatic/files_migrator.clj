(ns gpml.handler.programmatic.files-migrator
  (:require [duct.logger :refer [log]]
            [gpml.db.case-study :as db.case-study]
            [gpml.db.event :as db.event]
            [gpml.db.organisation :as db.organisation]
            [gpml.db.stakeholder :as db.stakeholder]
            [gpml.domain.file :as dom.file]
            [gpml.handler.responses :as r]
            [gpml.service.file :as srv.file]
            [gpml.util :as util]
            [gpml.util.image :as util.image]
            [integrant.core :as ig]))

(def ^:const ^:private available-entities
  #{:organisation :stakeholder :case_study :event})

(def ^:private run-file-migrator-params-schema
  [:map
   [:entity-key
    [:and
     [:keyword]
     (apply conj [:enum] available-entities)]]
   [:limit {:optional true} pos-int?]])

(defn- get-file-payload
  [{:keys [logger]} src]
  (try
    (if (util/try-url-str src)
      (util.image/download-image logger
                                 src
                                 ;; If the link points to a Google API
                                 ;; we need to specify an user agent
                                 ;; otherwise it will deny the
                                 ;; request.
                                 {:headers {:user-agent "gpml/1.0.0"}})
      src)
    (catch Throwable t
      (log logger :error ::failed-to-download-image {:exception-message (ex-message t)
                                                     :stack-trace (map str (.getStackTrace t))}))))

(defn migrate-files
  [{:keys [db logger] :as config}
   {:keys [get-files-to-migrate-fn update-entity-fn
           limit entity-key visibility]}]
  (let [conn (:spec db)
        images (get-files-to-migrate-fn conn
                                        {:limit limit})]
    (if-not (seq images)
      (log logger :info ::no-files-to-migrate {:entity entity-key})
      (doseq [{:keys [id file_type file_key content]} images]
        (try
          (when-let [file-payload (get-file-payload config content)]
            (let [file-fkey (keyword (str file_type "_id"))
                  file (dom.file/base64->file file-payload entity-key file_key visibility)
                  result (srv.file/create-file config conn file)]
              (if (:success? result)
                (update-entity-fn conn id {file-fkey (:id file)})
                (log logger :error ::failed-to-create-file {:entity entity-key
                                                            :id id
                                                            :file-type (keyword file_type)
                                                            :reason :creation-file-failed
                                                            :error-details {:creation-result result}}))))
          (catch Throwable t
            (log logger :error ::failed-to-create-file {:entity entity-key
                                                        :id id
                                                        :file-type (keyword file_type)
                                                        :reason :exception
                                                        :error-details {:exception-message (ex-message t)
                                                                        :stack-trace (map str (.getStackTrace t))}})))))
    (log logger :info ::finished-migrating-files {:entity entity-key})))

(defmulti migrate-entity-files
  (fn [_ entity-key _] entity-key))

(defmethod migrate-entity-files :event
  [config entity-key opts]
  (migrate-files config
                 {:get-files-to-migrate-fn db.event/get-events-files-to-migrate
                  :update-entity-fn (fn [conn id updates] (db.event/update-event conn {:id id
                                                                                       :updates updates}))
                  :entity-key entity-key
                  :visibility :public
                  :limit (:limit opts)}))

(defmethod migrate-entity-files :stakeholder
  [config entity-key opts]
  (migrate-files config
                 {:get-files-to-migrate-fn db.stakeholder/get-stakeholders-files-to-migrate
                  :update-entity-fn (fn [conn id updates] (db.stakeholder/update-stakeholder conn
                                                                                             (merge {:id id} updates)))
                  :entity-key entity-key
                  :visibility :private
                  :limit (:limit opts)}))

(defmethod migrate-entity-files :organisation
  [config entity-key opts]
  (migrate-files config
                 {:get-files-to-migrate-fn db.organisation/get-organisation-files-to-migrate
                  :update-entity-fn (fn [conn id updates] (db.organisation/update-organisation conn
                                                                                               (merge {:id id} updates)))
                  :entity-key entity-key
                  :visibility :private
                  :limit (:limit opts)}))

(defmethod migrate-entity-files :case_study
  [config entity-key opts]
  (migrate-files config
                 {:get-files-to-migrate-fn db.case-study/get-case-studies-files-to-migrate
                  :update-entity-fn (fn [conn id updates] (db.case-study/update-case-study conn
                                                                                           {:id id
                                                                                            :updates updates}))
                  :entity-key entity-key
                  :visibility :public
                  :limit (:limit opts)}))

(defmethod ig/init-key :gpml.handler.programmatic.files-migrator/post
  [_ {:keys [logger] :as config}]
  (fn [{:keys [parameters] :as _req}]
    (try
      (let [{:keys [entity-key limit]} (:body parameters)]
        (future (migrate-entity-files config entity-key (cond-> {}
                                                          limit
                                                          (assoc :limit limit))))
        (r/ok {:success? true}))
      (catch Throwable t
        (let [log-data {:exception-message (ex-message t)
                        :exception-data (ex-data t)
                        :stack-trace (map str (.getStackTrace t))}]
          (log logger :error ::failed-to-migrate-files log-data)
          (r/server-error {:success? false
                           :reason :exception
                           :error-details log-data}))))))

(defmethod ig/init-key :gpml.handler.programmatic.files-migrator/post-params
  [_ _]
  {:body run-file-migrator-params-schema})
