(ns gpml.handler.country-state
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.country-state :as db.country-state]
            [gpml.domain.country-state :as dom.country-state]
            [gpml.handler.responses :as r]
            [gpml.handler.util :as handler.util]
            [integrant.core :as ig]
            [malli.util :as mu]))

(def ^:private get-params
  [:map
   [:names
    {:optional true
     :swagger {:description "Comma separated list of country state names."
               :type "string"}}
    [:sequential
     {:decode/string (fn [s] (map str/lower-case (str/split s #",")))}
     [string? {:min 1}]]]
   [:codes
    {:optional true
     :swagger {:description "Comma separated list of country state codes."
               :type "string"}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     [string? {:min 1}]]]
   [:types
    {:optional true
     :swagger {:description "Comma separated list of country state types."
               :type "string"}}
    [:sequential
     {:decode/string (fn [s] (str/split s #","))}
     [string? {:min 1}]]]
   [:countries_ids
    {:optional true
     :swagger {:description "Comma separated list of country state names."
               :type "string"}}
    [:sequential
     {:decode/string (fn [s] (map #(Integer/parseInt %) (str/split s #",")))}
     pos-int?]]])

(defn- get-country-states
  [{:keys [db logger]} {{:keys [query]} :parameters :as _req}]
  (try
    (r/ok {:success? true
           :country_states (db.country-state/get-country-states (:spec db)
                                                                {:filters query})})
    (catch Exception e
      (log logger :error ::failed-to-get-country-states {:exception-message (ex-message e)})
      (r/server-error {:success? false
                       :reason :failed-to-get-country-states
                       :error-details {:error (class e)}}))))

(defmethod ig/init-key :gpml.handler.country-state/get
  [_ config]
  (fn [req]
    (get-country-states config req)))

(defmethod ig/init-key :gpml.handler.country-state/get-params
  [_ _]
  {:query get-params})

(defmethod ig/init-key :gpml.handler.country-state/get-responses
  [_ _]
  {200 {:body (-> handler.util/default-ok-response-body-schema
                  (mu/assoc :country_states [:sequential dom.country-state/CountryState]))}
   500 {:body handler.util/default-error-response-body-schema}})
