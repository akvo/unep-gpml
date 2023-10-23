(ns gpml.handler.badge
  (:require [duct.logger :refer [log]]
            [gpml.db.badge :as db.badge]
            [gpml.handler.responses :as r]
            [gpml.service.file :as srv.file]
            [gpml.util :as util]
            [integrant.core :as ig]))

(defn- get-badge-by-name
  [{:keys [db] :as config} badge-name]
  (let [{:keys [success? badge] :as result} (db.badge/get-badge-by-name (:spec db) {:name badge-name})
        badge-content-file-id (:content-file-id badge)]
    (if-not success?
      result
      (let [{:keys [success? file] :as result-content-file} (srv.file/get-file
                                                             config
                                                             (:spec db)
                                                             {:filters {:id badge-content-file-id}})]
        (if-not success?
          result-content-file
          (-> result
              (util/update-if-not-nil :badge #(dissoc % :content-file-id))
              (assoc-in [:badge :content-file-url] (:url file))))))))

(defmethod ig/init-key :gpml.handler.badge/get
  [_ {:keys [logger] :as config}]
  (fn [req]
    (try
      (let [badge-name (get-in req [:parameters :path :name])
            {:keys [success? reason] :as result} (get-badge-by-name config badge-name)]
        (if success?
          (r/ok result)
          (if (= reason :not-found)
            (r/not-found {})
            (r/server-error result))))
      (catch Throwable t
        (log logger :error ::get-badge-failed {:exception-message (.getMessage t)})
        (r/server-error {:success? false
                         :reason :could-not-get-badge
                         :error-details {:message (.getMessage t)}})))))

(defmethod ig/init-key :gpml.handler.badge/get-params
  [_ _]
  {:path [:map
          [:name
           {:optional false
            :swagger
            {:description "The Badge's name."
             :type "string"
             :allowEmptyValue false}}
           [:string {:min 1}]]]})
