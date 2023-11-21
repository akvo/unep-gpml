(ns gpml.handler.plastic-strategy
  (:require [camel-snake-kebab.core :refer [->kebab-case]]
            [camel-snake-kebab.extras :as cske]
            [clojure.string :as str]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.service.permissions :as srv.permissions]
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

(defn- get-plastic-strategies*
  [config search-opts]
  (let [result (srv.ps/get-plastic-strategies config search-opts)]
    (if (:success? result)
      (r/ok (:plastic-strategies result))
      (r/server-error (dissoc result :success?)))))

(defn- get-plastic-strategies
  [config {:keys [user] :as req}]
  (let [query-params (cske/transform-keys #(->kebab-case % :separator \_)
                                          (get-in req [:parameters :query]))
        search-opts {:filters query-params}]
    (if (h.r.permission/super-admin? config (:id user))
      (get-plastic-strategies* config search-opts)
      (get-plastic-strategies* config (assoc-in search-opts [:filters :rbac-user-id] (:id user))))))

(defn- get-plastic-strategy
  [config {:keys [user] :as req}]
  (let [country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
        search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        {:keys [success? plastic-strategy reason] :as result}
        (srv.ps/get-plastic-strategy config search-opts)]
    (if success?
      (if (h.r.permission/operation-allowed? config
                                             {:user-id (:id user)
                                              :entity-type :plastic-strategy
                                              :entity-id (:id plastic-strategy)
                                              :operation-type :read
                                              :root-context? false})
        (r/ok plastic-strategy)
        (r/forbidden {:message "Unauthorized"}))
      (if (= reason :not-found)
        (r/not-found {})
        (r/server-error (dissoc result :success?))))))

(defn- update-plastic-strategy
  [config {:keys [user] :as req}]
  (let [country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
        search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        {:keys [success? plastic-strategy reason] :as get-ps-result}
        (srv.ps/get-plastic-strategy config search-opts)]
    (if-not success?
      (if (= reason :not-found)
        (r/not-found {})
        (r/server-error (dissoc get-ps-result :success?)))
      (if-not (h.r.permission/operation-allowed? config
                                                 {:user-id (:id user)
                                                  :entity-type :plastic-strategy
                                                  :entity-id (:id plastic-strategy)
                                                  :operation-type :update
                                                  :root-context? false})
        (r/forbidden {:message "Unauthorized"})
        (let [plastic-strategy (-> (get-in req [:parameters :body])
                                   (assoc :id (:id plastic-strategy)))
              result (srv.ps/update-plastic-strategy config
                                                     plastic-strategy)]
          (if (:success? result)
            (r/ok {})
            (r/server-error (dissoc result :success?))))))))

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
