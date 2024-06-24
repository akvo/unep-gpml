(ns gpml.handler.resources
  (:require
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.db.country-group :as db.country-group]
   [gpml.db.resource.connection :as db.resource.connection]
   [gpml.db.topic :as db.topic]
   [gpml.domain.file :as dom.file]
   [gpml.domain.resource :as dom.resource]
   [gpml.domain.types :as dom.types]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.handler.util :as handler.util]
   [gpml.service.file :as srv.file]
   [gpml.service.plastic-strategy :as svc.ps]
   [gpml.util.postgresql :as pg-util]
   [gpml.util.regular-expressions :as util.regex]
   [integrant.core :as ig]
   [medley.core :as medley]
   [taoensso.timbre :as timbre])
  (:import
   (java.sql SQLException)))

(def ^:private resource-columns
  {:policy ["id" ""]})

(defn- resources-response [{:keys [logger] {db :spec} :db :as config} query approved? admin]
  (try
    (r/ok {:success? true
           :results []
           :counts []})
    (catch Exception t
      (timbre/with-context+ query
        (log logger :error :failed-to-get-topics t))
      (let [response {:success? false
                      :reason :could-not-get-topics}]
        (if (instance? SQLException t)
          (r/server-error (assoc-in response [:error-details :error] (pg-util/get-sql-state t)))
          (r/server-error (assoc-in response [:error-details :error] (ex-message t))))))))


(defmethod ig/init-key :gpml.handler.resources/get [_ config]
  (fn [{{:keys [query]} :parameters
        approved? :approved?
        user :user}]
    (#'resources-response config
                          (merge query {:user-id (:id user)})
                          approved?
                          (h.r.permission/super-admin? config (:id user)))))
