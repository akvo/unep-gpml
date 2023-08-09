(ns gpml.handler.community
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.community :as db.community]
            [gpml.db.country-group :as db.country-group]
            [gpml.domain.file :as dom.file]
            [gpml.handler.responses :as r]
            [gpml.service.file :as srv.file]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [medley.core :as medley]))

(def ^:const community-network-types ["organisation" "stakeholder"])
(def ^:const geo-coverage-types ["Transnational" "National" "Global" "Sub-national"])
(def ^:const geo-coverage-types-re (util.regex/comma-separated-enums-re geo-coverage-types))
(def ^:const network-types-re (util.regex/comma-separated-enums-re community-network-types))
(def ^:const default-api-limit 8)
(def ^:const order-by-fields ["name"])

(def get-community-members-query-params
  [:map
   [:country
    {:optional true
     :swagger {:description "Comma separated list of country id"
               :type "string"
               :collectionFormat "csv"
               :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re util.regex/comma-separated-numbers-re]]]
   [:transnational {:optional true
                    :swagger {:description "Comma separated list of transnational id"
                              :type "string"
                              :collectionFormat "csv"
                              :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re util.regex/comma-separated-numbers-re]]]
   [:geoCoverageType
    {:optional true
     :swagger {:description (format "Comma separated list of geo coverage types to filter: %s" (str/join "," geo-coverage-types))
               :type "string"
               :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re geo-coverage-types-re]]]
   [:networkType
    {:optional true
     :swagger {:description (format "Comma separated list of community network types to filter: %s" (str/join "," community-network-types))
               :type "string"
               :collectionFormat "csv"
               :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re network-types-re]]]
   [:tag
    {:optional true
     :swagger {:description "Comma separated list of tags"
               :type "string"
               :collectionFormat "csv"
               :allowEmptyValue true}}
    string?]
   [:q
    {:optional true
     :swagger {:description "Text search term to be found on the different community members"
               :type "string"
               :allowEmptyValue true}}
    [:string]]
   [:limit
    {:optional true
     :swagger {:description "Limit the number of entries per page"
               :type "int"
               :allowEmptyValue true}}
    [:int {:min 0 :max 100}]]
   [:representativeGroup
    {:optional true
     :swagger {:description "Comma separated list of representative groups"
               :type "string"
               :allowEmptyValue true}}
    string?]
   [:affiliation
    {:optional true
     :swagger {:description "Comma separated list of affiliation ids (i.e., organisation ids)"
               :type "string"
               :allowEmptyValue true}}
    string?]
   [:entity
    {:optional true
     :swagger {:description "Comma separated list of entity ids (i.e., organisation ids)"
               :type "string"
               :allowEmptyValue true}}
    string?]
   [:isMember {:optional true
               :swagger {:description "Filter member/non-member organisations"
                         :type "boolean"
                         :allowEmptyValue true}}
    [:boolean]]
   [:orderBy {:optional true
              :swagger {:description "One of the following properties to order the list of results: name"
                        :type "string"
                        :allowEmptyValue true}}
    (apply vector :enum order-by-fields)]
   [:descending {:optional true
                 :swagger {:description "Order results in descending order: true or false"
                           :type "boolean"
                           :allowEmptyValue true}}
    [:boolean]]
   [:page
    {:optional true
     :swagger {:description "Retrieve entries for a given page number"
               :type "int"
               :allowEmptyValue true}}
    [:int {:min 0}]]])

(defn api-params->opts
  [{:keys [q country tag networkType affiliation representativeGroup geoCoverageType
           limit page transnational orderBy descending entity isMember]
    :or {limit default-api-limit
         page 0}}]
  (cond-> {}
    page
    (assoc :page page)

    limit
    (assoc :limit limit)

    (seq representativeGroup)
    (assoc-in [:filters :representative-group] (set (str/split representativeGroup #",")))

    (seq geoCoverageType)
    (assoc-in [:filters :geo-coverage-type] (->> (set (str/split geoCoverageType #","))
                                                 (map str/lower-case)))

    (seq affiliation)
    (assoc-in [:filters :affiliation] (->> (set (str/split affiliation #","))
                                           (map #(Integer/parseInt %))))

    (seq country)
    (assoc-in [:filters :country] (->> (set (str/split country #","))
                                       (map #(Integer/parseInt %))))

    (seq transnational)
    (assoc-in [:filters :transnational] (->> (set (str/split transnational #","))
                                             (map #(Integer/parseInt %))))

    (seq networkType)
    (assoc-in [:filters :network-type] (set (str/split networkType #",")))

    (seq tag)
    (assoc-in [:filters :tag] (set (str/split tag #",")))

    (seq entity)
    (assoc-in [:filters :entity] (map #(Integer/parseInt %) (str/split entity #",")))

    (not (nil? isMember))
    (assoc-in [:filters :is-member] isMember)

    (seq orderBy)
    (assoc :order-by orderBy)

    (not (nil? descending))
    (assoc :descending descending)

    (seq q)
    (assoc-in [:filters :search-text] (->> (str/trim q)
                                           (re-seq #"\w+")
                                           (str/join " & ")))))

(defn- community-member->api-community-member
  [config community-member]
  (let [{files :files member-type :type
         picture-id :picture_id logo-id :logo_id} community-member
        files-w-urls (->> files
                          (map dom.file/decode-file)
                          (srv.file/add-files-urls config)
                          (medley/index-by (comp str :id)))]
    (cond-> community-member
      (= "stakeholder" member-type)
      (assoc :picture (get-in files-w-urls [picture-id :url]))

      (= "organisation" member-type)
      (assoc :logo (get-in files-w-urls [logo-id :url])))))

(defn get-community-members
  [{:keys [db logger] :as config} req]
  (try
    (let [conn (:spec db)
          query-params (get-in req [:parameters :query])
          opts (api-params->opts query-params)
          modified-filters (if (get-in opts [:filters :transnational])
                             (let [opts {:filters {:country-groups (get-in opts [:filters :transnational])}}
                                   country-group-countries (db.country-group/get-country-groups-countries conn opts)
                                   geo-coverage-countries (map :id country-group-countries)]
                               (assoc-in opts [:filters :country] (set (concat
                                                                        (get-in opts [:filters :country])
                                                                        geo-coverage-countries))))
                             opts)
          results (->> (db.community/get-community-members conn modified-filters)
                       (map (partial community-member->api-community-member config)))]
      (r/ok {:results results
             :counts (db.community/get-community-members conn (assoc modified-filters :count-only? true))}))
    (catch Throwable t
      (let [log-data {:exception-message (ex-message t)
                      :exception-data (ex-data t)
                      :context-data (get-in req [:parameters :query])}]
        (log logger :error :failed-to-get-community-members log-data)
        (log logger :debug :failed-to-get-community-members (assoc log-data :stack-trace (.getStackTrace t)))
        (r/server-error {:success? false
                         :reason :failed-to-get-community-members
                         :error-details {:msg (:exception-message log-data)}})))))

(defmethod ig/init-key :gpml.handler.community/get [_ config]
  (fn [req]
    (get-community-members config req)))

(defmethod ig/init-key :gpml.handler.community/get-params [_ _]
  get-community-members-query-params)
