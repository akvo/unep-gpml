(ns gpml.handler.community
  (:require [clojure.string :as str]
            [gpml.db.community :as db.community]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def ^:const community-network-types ["organisation" "stakeholder"])
(def ^:const geo-coverage-types ["Transnational" "National" "Global"])
(def ^:const geo-coverage-types-re (util.regex/comma-separated-enums-re geo-coverage-types))
(def ^:const network-types-re (util.regex/comma-separated-enums-re community-network-types))
(def ^:const default-api-limit 8)

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
   [:networkType
    {:optional true
     :swagger {:description (format "Comma separated list of community network types to filter: %s" (str/join "," community-network-types))
               :type "string"
               :collectionFormat "csv"
               :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re network-types-re]]]
   [:geoCoverageType
    {:optional true
     :swagger {:description (format "Comma separated list of geo coverage types to filter: %s" (str/join "," geo-coverage-types))
               :type "string"
               :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re geo-coverage-types-re]]]
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
   [:offset
    {:optional true
     :swagger{:description "Number of items to skip when fetching entries"
              :type "int"
              :allowEmptyValue true}}
    [:int {:min 0}]]])

(defn api-params->opts
  [{:keys [q country tag networkType affiliation representativeGroup geoCoverageType limit offset]
    :or {limit default-api-limit
         offset 0}}]
  (cond-> {}
    offset
    (assoc :offset offset)

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

    (seq networkType)
    (assoc-in [:filters :network-type] (set (str/split networkType #",")))

    (seq tag)
    (assoc-in [:filters :tag] (set (str/split tag #",")))

    (seq q)
    (assoc-in [:filters :search-text] (->> (str/trim q)
                                           (re-seq #"\w+")
                                           (str/join " & ")))))

(defn get-community-members
  [db query-params]
  (let [opts (api-params->opts query-params)]
    {:results (db.community/get-community-members (:spec db) opts)
     :counts (db.community/get-community-members (:spec db) (assoc opts :count-only? true))}))

(defmethod ig/init-key :gpml.handler.community/get [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters}]
    (resp/response (get-community-members db query))))

(defmethod ig/init-key :gpml.handler.community/get-params [_ _]
  get-community-members-query-params)
