(ns gpml.handler.programmatic.brs-api-importer
  (:require [duct.logger :refer [log]]
            [gpml.handler.responses :as r]
            [gpml.scheduler.brs-api-importer :as brs-api-importer]
            [integrant.core :as ig]))

(defn- run-brs-api-importer
  [{:keys [logger] :as config}]
  (try
    (future (brs-api-importer/import-or-update-entities config))
    (r/ok {:success? true
           :message "Import job started."})
    (catch Exception e
      (let [error-details {:exception-message (ex-message e)}]
        (log logger :error ::failed-to-run-brs-api-importer error-details)
        (r/server-error {:success? false
                         :reason :failed-to-run-brs-api-importer
                         :error-details error-details})))))

(defmethod ig/init-key :gpml.handler.programmatic.brs-api-importer/post
  [_ config]
  (fn [_req]
    (run-brs-api-importer config)))
