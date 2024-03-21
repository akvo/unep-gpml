(ns gpml.handler.plastic-strategy
  (:require
   [camel-snake-kebab.core :refer [->kebab-case]]
   [camel-snake-kebab.extras :as cske]
   [clojure.string :as str]
   [gpml.handler.resource.permission :as h.r.permission]
   [gpml.handler.responses :as r]
   [gpml.service.plastic-strategy :as svc.ps]
   [gpml.util.json :as json]
   [gpml.util.malli :refer [failure-with success-with]]
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
     {:decode/string (fn [s]
                       (str/split (str/upper-case s) #","))}
     [:string {:max 2}]]]
   [:countries_names
    {:optional true
     :swagger {:description "A comma separated list of country names"
               :type "string"
               :allowEmptyValue false}}
    [:sequential
     {:decode/string (fn [s]
                       (str/split (str/lower-case s) #","))}
     [:string {:min 1}]]]])

(def ^:private update-plastic-strategy-steps-params
  [:map
   {:closed false}
   [:steps
    {:swagger
     {:description "The plastic strategy step state."
      :type "array"}}
    [:sequential
     [:map {:closed false}]]]])

(defn- get-plastic-strategies* [config search-opts]
  (let [result (svc.ps/get-plastic-strategies config search-opts)]
    (if (:success? result)
      (r/ok (:plastic-strategies result))
      (r/server-error (dissoc result :success?)))))

(defn- get-plastic-strategies [config {:keys [user] :as req}]
  (let [query-params (cske/transform-keys #(->kebab-case % :separator \_)
                                          (get-in req [:parameters :query]))
        search-opts {:filters query-params}]
    (if (h.r.permission/super-admin? config (:id user))
      (get-plastic-strategies* config search-opts)
      (get-plastic-strategies* config (assoc-in search-opts [:filters :rbac-user-id] (:id user))))))

(defn- get-plastic-strategy [config {:keys [user] :as req}]
  (let [country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
        search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        {:keys [success? plastic-strategy reason] :as result}
        (svc.ps/get-plastic-strategy config search-opts)]
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

(defn- update-plastic-strategy [config {:keys [user] :as req}]
  (let [country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
        search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
        {:keys [success? plastic-strategy reason]
         :as get-ps-result} (svc.ps/get-plastic-strategy config search-opts)]
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
              result (svc.ps/update-plastic-strategy config
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

(defmethod ig/init-key :gpml.handler.plastic-strategy/admin-ensure-chat
  [_ config]
  (fn [req]
    (let [country-iso-code-a2 (get-in req [:parameters :path :iso_code_a2])
          search-opts {:filters {:countries-iso-codes-a2 [country-iso-code-a2]}}
          {:keys [success? plastic-strategy reason]
           :as result} (when country-iso-code-a2
                         (svc.ps/get-plastic-strategy config search-opts))]
      (if success?
        (let [{:keys [success?] :as result} (svc.ps/ensure-chat-channel-id config plastic-strategy)]
          (if success?
            (-> result
                (select-keys [:success? :channel-id])
                r/ok)
            (r/server-error (select-keys result [:success? :reason]))))
        (if (= reason :not-found)
          (r/not-found {})
          (r/server-error (select-keys result [:success? :reason])))))))

(defmethod ig/init-key :gpml.handler.plastic-strategy/admin-ensure-chat-params
  [_ _]
  {:path common-plastic-strategy-path-params-schema})

(defmethod ig/init-key :gpml.handler.plastic-strategy/admin-ensure-chat-responses
  [_ _]
  {200 {:body (success-with :channel-id :string)}
   500 {:body (failure-with :reason any?)}})

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

(comment
  (gpml.util.http-client/request (dev/logger)
                                 {:url "http://localhost:3000/api/plastic-strategy/0A"
                                  :method :put
                                  :body (json/->json {:steps
                                                      [{:slug "", :label "Instructions", :checked true}
                                                       {:slug "1-project-team",
                                                        :label "National Steering Committee & Project Team",
                                                        :checked false,
                                                        :substeps
                                                        [{:slug "", :label "Intro", :checked true}
                                                         {:slug "setup-team", :label "Setup your team", :checked false}]}
                                                       {:slug "2-stakeholder-consultation",
                                                        :label "Stakeholder Consultation Process",
                                                        :substeps
                                                        [{:slug "", :label "Intro", :checked false}
                                                         {:slug "stakeholder-map",
                                                          :label "Stakeholder Map",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmarked true,
                                                           :ps_bookmark_sections_keys "stakeholder-map",
                                                           :tag "stakeholder-{country}",
                                                           :base_path "organisations"}}
                                                         {:slug "case-studies",
                                                          :label "Case Studies",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmark_sections_keys "stakeholder-case-studies",
                                                           :tag "stakeholder consultation process"}}
                                                         {:slug "initiatives",
                                                          :label "Initiatives",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmark_sections_keys "stakeholder-initiatives",
                                                           :topic "initiative",
                                                           :country "{countryID}"}}
                                                         {:slug "summary", :label "Summary & Report", :checked false}]}
                                                       {:slug "3-legislation-policy",
                                                        :label "Legislation & Policy Review Report",
                                                        :substeps
                                                        [{:slug "", :label "Intro", :checked false}
                                                         {:slug "country-policy",
                                                          :label "Country Policy Framework",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmark_sections_keys "country-policy",
                                                           :topic "policy",
                                                           :country "{countryID}"}}
                                                         {:slug "legislative-development",
                                                          :label "Legislative Development Guide",
                                                          :checked false}
                                                         {:slug "case-studies",
                                                          :label "Case Studies",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmark_sections_keys "stakeholder-case-studies",
                                                           :tag "legislative & policy review case study"}}
                                                         {:slug "summary", :label "Summary & Report", :checked false}]}
                                                       {:slug "4-data-analysis",
                                                        :label "Data Analysis",
                                                        :substeps
                                                        [{:slug "", :label "Intro", :checked false}
                                                         {:slug "available-tools",
                                                          :label "Available Tools",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmark_sections_keys "data-available-tools",
                                                           :tag "data analysis - available tools"}}
                                                         {:slug "available-data",
                                                          :label "Available Data & Statistics",
                                                          :checked false}
                                                         {:slug "data-collection",
                                                          :label "Data Collection",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmark_sections_keys "data-collection",
                                                           :tag "data analysis - data collection"}}
                                                         {:slug "calculation",
                                                          :label "Calculation of Indicators",
                                                          :checked false}
                                                         {:slug "available-information",
                                                          :label "Available Information",
                                                          :checked false,
                                                          :api_params
                                                          {:ps_bookmark_sections_keys "data-collection",
                                                           :topic
                                                           "technology,event,financing_resource,technical_resource",
                                                           :capacity_building true,
                                                           :country "{countryID}"}}
                                                         {:slug "summary", :label "Summary & Report", :checked false}]}
                                                       {:slug "5-national-source",
                                                        :label "National Source Inventory Report",
                                                        :substeps
                                                        [{:slug "", :label "Intro", :checked false}
                                                         {:slug "summary", :label "Summary & Report", :checked false}]}
                                                       {:slug "6-national-plastic-strategy",
                                                        :label "National Plastic Strategy",
                                                        :substeps
                                                        [{:slug "", :label "Intro", :checked false}
                                                         {:slug "summary", :label "Upload", :checked false}]}
                                                       {:slug "7-final-review", :label "Final Review", :checked false}]})
                                  :content-type :json
                                  :as :json-keyword-keys}))
