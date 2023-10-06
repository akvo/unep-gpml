(ns gpml.handler.programmatic.plastic-strategy
  (:require [gpml.db.plastic-strategy :as db.ps]
            [gpml.handler.responses :as r]
            [integrant.core :as ig]))

(def ^:private create-plastic-strategies-params-schema
  [:sequential
   {:swagger {:description "A list of countries IDs. Each will be used to create a plastic strategy."
              :type "array"
              :items {:type "integer"}}}
   [:int {:min 1}]])

(defn- create-plastic-strategies
  [{:keys [db]} req]
  (let [countries-ids (get-in req [:parameters :body])
        plastic-strategies (map vector countries-ids)
        result (db.ps/create-plastic-strategies (:spec db) plastic-strategies)]
    (if (:success? result)
      (r/ok {})
      (r/server-error (dissoc result :success?)))))

(defmethod ig/init-key :gpml.handler.programmatic.plastic-strategy/post
  [_ config]
  (fn [req]
    (create-plastic-strategies config req)))

(defmethod ig/init-key :gpml.handler.programmatic.plastic-strategy/post-params
  [_ _]
  {:body create-plastic-strategies-params-schema})
