(ns gpml.handler.list
  (:require
   [clojure.string :as str]
   [gpml.db.resource.list :as db.resource.list]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(def ^:const default-api-limit 100)

(defn- api-opts->opts
  [{:keys [q limit]
    :or {limit default-api-limit}}]
  (cond-> {}
    limit
    (assoc :limit limit)

    (seq q)
    (assoc-in [:filters :search-text] q)))

(defmethod ig/init-key :gpml.handler.list/get
  [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (let [conn (:spec db)
          opts (api-opts->opts query)]
      (resp/response (db.resource.list/get-resources conn opts)))))

(defmethod ig/init-key :gpml.handler.list/get-params
  [_ _]
  {:query [:map
           [:q
            {:optional true
             :swagger {:description "Text search term to be found on the platform resources."
                       :type "string"
                       :allowEmptyValue true}}
            [:string]]
           [:limit
            {:optional true
             :swagger {:description "Limit the amount of results returned by the API."
                       :type "integer"
                       :allowEmptyValue true}}
            [:int {:min 1}]]]})

(defmethod ig/init-key :gpml.handler.list/get-response
  [_ _]
  {200 {:body [:vector
               [:maybe
                [:map
                 [:id [:int]]
                 [:title [:string]]]]]}})
