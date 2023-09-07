(ns gpml.handler.programmatic.organisation
  (:require [clojure.java.jdbc :as jdbc]
            [duct.logger :refer [log]]
            [gpml.domain.organisation :as dom.org]
            [gpml.handler.organisation :as handler.org]
            [gpml.handler.responses :as r]
            [gpml.util.malli :as util.malli]
            [gpml.util.postgresql :as pg-util]
            [integrant.core :as ig])
  (:import [java.sql SQLException]))

(defn- create-organisation
  [{:keys [db logger] :as config} req]
  (try
    (jdbc/with-db-transaction [tx (:spec db)]
      (r/ok {:success? true
             :org-id (handler.org/create config tx (:body-params req))}))
    (catch Exception e
      (log logger :error ::create-org-failed {:exception-message (.getMessage e)})
      (if (instance? SQLException e)
        (if (= :unique-constraint-violation (pg-util/get-sql-state e))
          (r/conflict {:success? false
                       :reason :organisation-name-already-exists})
          (r/server-error {:success? false
                           :reason :could-not-create-org}))
        (r/server-error {:success? false
                         :reason :could-not-create-org
                         :error-details {:message (.getMessage e)}})))))

(defmethod ig/init-key :gpml.handler.programmatic.organisation/post
  [_ config]
  (fn [req]
    (create-organisation config req)))

(defmethod ig/init-key :gpml.handler.programmatic.organisation/post-params
  [_ _]
  {:body (-> dom.org/Organisation
             (util.malli/dissoc [:id :created :modified]))})
