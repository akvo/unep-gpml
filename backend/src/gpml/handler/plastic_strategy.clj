(ns gpml.handler.plastic-strategy
  (:require [camel-snake-kebab.core :refer [->kebab-case]]
            [camel-snake-kebab.extras :as cske]
            [clojure.string :as str]
            [gpml.handler.responses :as r]
            [gpml.service.plastic-strategy :as srv.ps]
            [integrant.core :as ig]))

(def ^:private common-plastic-strategy-path-params-schema
  [:map
   [:iso_code_a2
    {:swagger {:description "The country ISO Code Alpha 2"
               :type "string"}}
    [:string {:decode/string str/upper-case
              :max 2}]]])

(def ^:private get-plastic-strategies-params-schema
  [:map
   [:countries_iso_codes_a2
    {:optional true
     :swagger {:description "A comma separated list of country ISO Code Alpha 2"
               :type "string"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split (str/upper-case s) #","))}
     [:string {:max 2}]]]
   [:countries_names
    {:optional true
     :swagger {:description "A comma separated list of country names"
               :type "string"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s] (str/split (str/lower-case s) #","))}
     [:string {:min 1}]]]])

(def ^:private update-plastic-strategy-steps-params
  [:map
   [:steps
    {:swagger
     {:description "The plastic strategy step state."
      :type "array"}}
    [:sequential
     [:map]]]])

(defn- get-plastic-strategies
  [config req]
  (let [query-params (cske/transform-keys #(->kebab-case % :separator \_)
                                          (get-in req [:parameters :query]))
        result (srv.ps/get-plastic-strategies config {:filters query-params})]
    (if (:success? result)
      (r/ok (:plastic-strategies result))
      (r/server-error (dissoc result :success?)))))

(defn- get-plastic-strategy
  [config req]
  (let [country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
        search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        result (srv.ps/get-plastic-strategy config search-opts)]
    (if (:success? result)
      (r/ok (:plastic-strategy result))
      (if (= (:reason result) :not-found)
        (r/not-found {})
        (r/server-error (dissoc result :success?))))))

(defn- update-plastic-strategy
  [config req]
  (let [to-update (get-in req [:parameters :body])
        country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
        result (srv.ps/update-plastic-strategy config
                                               country-iso-code-a2
                                               to-update)]
    (if (:success? result)
      (r/ok {})
      (if (= (:reason result) :not-found)
        (r/not-found {})
        (r/server-error (dissoc result :success?))))))

(defmethod ig/init-key :gpml.handler.plastic-strategy/get-all
  [_ config]
  (fn [req]
    (get-plastic-strategies config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy/get-all-params
  [_ _]
  {:query get-plastic-strategies-params-schema})

(defmethod ig/init-key :gpml.handler.plastic-strategy/get
  [_ config]
  (fn [req]
    (get-plastic-strategy config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy/get-params
  [_ _]
  {:path common-plastic-strategy-path-params-schema})

(defmethod ig/init-key :gpml.handler.plastic-strategy/update-steps
  [_ config]
  (fn [req]
    (update-plastic-strategy config req)))

(defmethod ig/init-key :gpml.handler.plastic-strategy/update-steps-params
  [_ _]
  {:path common-plastic-strategy-path-params-schema
   :body update-plastic-strategy-steps-params})
