(ns gpml.handler.programmatic.plastic-strategy
  (:require
   [camel-snake-kebab.core :refer [->kebab-case]]
   [camel-snake-kebab.extras :as cske]
   [gpml.handler.responses :as r]
   [gpml.service.plastic-strategy :as srv.ps]
   [integrant.core :as ig]))

(def ^:private create-plastic-strategies-params-schema
  [:sequential
   {:swagger
    {:description "A list of plastic strategies to create."
     :type "array"
     :items {:type "object"}}}
   [:map
    [:country_id
     {:swagger
      {:description "The GPML country unique identifier."
       :type "integer"}}
     [:int {:min 1}]]
    [:chat_channel_name
     {:swagger
      {:description "The chat channel name for new plastic strategy."
       :type "string"
       :allowEmptyValue false}}
     [:string {:min 1}]]]])

(defn- create-plastic-strategies [config req]
  (let [pses-payload (cske/transform-keys ->kebab-case (get-in req [:parameters :body]))
        result (srv.ps/create-plastic-strategies config pses-payload)]
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
