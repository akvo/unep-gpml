(ns gpml.handler.search
  (:require
   [clojure.java.io :as io]
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.db :as db]
   [gpml.handler.responses :as r]
   [gpml.util.http-client :as http]
   [gpml.util.json :as json]
   [gpml.util.postgresql :as pg-util]
   [integrant.core :as ig]
   [taoensso.timbre :as timbre])
  (:import
   (java.sql SQLException)))

(def search-api-opts
  [:and
   [:map
    [:q {:optional false
         :swagger {:description "Natural language search on resources"
                   :type "string"
                   :allowEmptyValue false}}
     [:string
      {:min 1}]]]])

(def ^:private prompt (slurp (io/resource "gpml/openai/search-prompt.txt")))

(defn- open-api-request [logger api-key q]
  (http/request logger
                {:url "https://api.openai.com/v1/chat/completions"
                 :method :post
                 :headers {:authorization (format "Bearer %s" api-key)}
                 :content-type :json
                 :as :json-keyword-keys
                 :body (json/->json {:model "gpt-4o-mini"
                                     :messages [{:role "system"
                                                 :content [{:type "text"
                                                            :text prompt}]}
                                                {:role "user"
                                                 :content [{:type "text"
                                                            :text q}]}]
                                     :temperature 1
                                     :max_tokens 1500
                                     :top_p 1
                                     :frequency_penalty 0
                                     :presence_penalty 0})}))


(defn- sql-allowed? [sql]
  (boolean (re-matches #"^(?i)select \* from v_resources where.*" sql)))

(defmethod ig/init-key ::get [_ {:keys [db-read-only logger openapi-api-key]}]
  (fn [{{:keys [query]} :parameters}]
    (try
      (when (str/blank? openapi-api-key)
        (throw (Exception. "Internal server error")))
      (let [resp (open-api-request logger openapi-api-key (:q query))
            sql (-> resp :body :choices first :message :content str/trim)]
        (log logger :report :openai-generated-query {:q (:q query) :sql sql :response (:body resp)})
        (when (not (sql-allowed? sql))
          (log logger :error :invalid-query sql)
          (throw (Exception. "Invalid query")))
        (let [data (db/execute! db-read-only [sql])]
          (r/ok {:success? true
                 :results (->> data :result (map :json))})))
      (catch Exception e
        (timbre/with-context+ query
          (log logger :error :failed-to-execute-query e))
        (let [response {:success? false
                        :reason :failed-to-execute-query}]
          (if (instance? SQLException e)
            (r/server-error (assoc-in response [:error-details :error] (pg-util/get-sql-state e)))
            (r/server-error (assoc-in response [:error-details :error] (ex-message e)))))))))

(defmethod ig/init-key ::query-params [_ _]
  search-api-opts)
