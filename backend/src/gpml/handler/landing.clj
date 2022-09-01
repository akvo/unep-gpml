(ns gpml.handler.landing
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.constants :refer [resource-types topics]]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.landing :as db.landing]
            [gpml.handler.responses :as r]
            [gpml.util.postgresql :as pg-util]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [ring.util.response :as resp])
  (:import [java.sql SQLException]))

(def ^:const ^:private topic-re (util.regex/comma-separated-enums-re topics))
(def ^:const ^:private entity-groups ["topic" "community"])

(def ^:private query-params
  [:map
   [:country {:optional true
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
   [:topic {:optional true
            :swagger {:description (format "Comma separated list of topics to filter: %s" (str/join "," topics))
                      :type "string"
                      :collectionFormat "csv"
                      :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re topic-re]]]
   [:tag {:optional true
          :swagger {:description "Comma separated list of tags"
                    :type "string"
                    :collectionFormat "csv"
                    :allowEmptyValue true}}
    string?]
   [:q {:optional true
        :swagger {:description "Text search term to be found on the different topics"
                  :type "string"
                  :allowEmptyValue true}}
    [:string]]
   [:favorites {:optional true
                :error/message "Favorites should be 'true' or 'false'"
                :swagger {:description "Flag to return only favorited items"
                          :type "boolean"
                          :allowEmptyValue true}}
    [:boolean]]
   [:startDate {:optional true
                :error/message "startDate should be in the ISO 8601 format i.e.: YYYY-MM-DD"
                :swagger {:description "Events startDate in the format of ISO 8601 i.e.: YYYY-MM-DD"
                          :type "string"
                          :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re util.regex/date-iso-8601-re]]]
   [:endDate {:optional true
              :error/message "endDate should be in the ISO 8601 format i.e.: YYYY-MM-DD"
              :swagger {:description "Events endDate in the format of ISO 8601 i.e.: YYYY-MM-DD"
                        :type "string"
                        :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re util.regex/date-iso-8601-re]]]
   [:representativeGroup {:optional true
                          :swagger {:description "Comma separated list of representative groups"
                                    :type "string"
                                    :allowEmptyValue true}}
    string?]
   [:affiliation {:optional true
                  :swagger {:description "Comma separated list of affiliation ids (i.e., organisation ids)"
                            :type "string"
                            :allowEmptyValue true}}
    string?]
   [:subContentType {:optional true
                     :swagger {:description "Comma separated list of a topic's subContentTypes"
                               :type "string"
                               :allowEmptyValue true}}
    string?]
   [:entity {:optional true
             :swagger {:description "Comma separated list of entity IDs"
                       :type "string"
                       :allowEmptyValue true}}
    string?]
   [:entityGroup {:optional true
                  :swagger {:description "The entity group to count: topic or community"}
                  :type "string"
                  :default (first entity-groups)}
    (apply vector :enum entity-groups)]
   [:featured {:optional true
               :error/message "Featured should be 'true' or 'false'"
               :swagger {:description "Boolean flag to filter by featured resources"
                         :type "boolean"
                         :allowEmptyValue false}}
    boolean?]
   [:capacity_building {:optional true
                        :error/message "'capacity_building' should be 'true' or 'false'"
                        :swagger {:description "Boolean flag to filter by capacity building resources"
                                  :type "boolean"
                                  :allowEmptyValue false}}
    boolean?]])

(defn- api-opts->opts
  [{:keys [startDate endDate user-id favorites country transnational
           topic tag affiliation representativeGroup subContentType entity
           entityGroup q capacity_building featured]}]
  (cond-> {}

    startDate
    (assoc :start-date startDate)

    endDate
    (assoc :end-date endDate)

    (and user-id favorites)
    (assoc :user-id user-id :favorites true :resource-types resource-types)

    (seq country)
    (assoc :geo-coverage (->> (set (str/split country #","))
                              (map #(Integer/parseInt %))))

    (seq transnational)
    (assoc :transnational (->> (set (str/split transnational #","))
                               (map #(Integer/parseInt %))))

    (seq topic)
    (assoc :topic (set (str/split topic #",")))

    (seq tag)
    (assoc :tag (set (str/split tag #",")))

    (seq affiliation)
    (assoc :affiliation (set (map #(Integer/parseInt %) (str/split affiliation #","))))

    (seq representativeGroup)
    (assoc :representative-group (set (str/split representativeGroup #",")))

    (seq subContentType)
    (assoc :sub-content-type (set (str/split subContentType #",")))

    (seq entity)
    (assoc :entity (set (map #(Integer/parseInt %) (str/split entity #","))))

    (seq entityGroup)
    (assoc :entity-group (keyword entityGroup))

    (seq q)
    (assoc :search-text (->> (str/trim q)
                             (re-seq #"\w+")
                             (str/join " & ")))

    featured
    (assoc :featured featured)

    capacity_building
    (assoc :capacity-building capacity_building)

    true
    (assoc :review-status "APPROVED")))

(defn- get-resource-map-counts
  [{:keys [db logger]}
   {{:keys [query]} :parameters
    user :user}]
  (try
    (let [conn (:spec db)
          opts (api-opts->opts (assoc query :user-id (:id user)))
          modified-opts (if-not (seq (get opts :transnational))
                          opts
                          (let [opts {:filters {:country-groups (get opts :transnational)}}
                                country-group-countries (db.country-group/get-country-groups-countries opts)
                                geo-coverage-countries (map :id country-group-countries)]
                            (assoc opts :geo-coverage (set (concat
                                                            (get opts :geo-coverage)
                                                            geo-coverage-countries)))))
          summary-data (->> (gpml.db.landing/summary conn)
                            (mapv (fn [{:keys [resource_type count country_count]}]
                                    {(keyword resource_type) count :countries country_count})))
          {:keys [country_counts country_group_counts]} (db.landing/get-resource-map-counts conn modified-opts)]
      (resp/response {:success? true
                      :map country_counts
                      :country_group_counts country_group_counts
                      :summary summary-data}))
    (catch Exception e
      (log logger :error ::failed-to-get-resource-map-counts {:exception-message (.getMessage e)})
      (r/server-error {:success? false
                       :reason :failed-to-get-resource-map-counts
                       :error-details {:error (if (instance? SQLException e)
                                                (pg-util/get-sql-state e)
                                                (.getMessage e))}}))))

(defmethod ig/init-key :gpml.handler.landing/get
  [_ config]
  (fn [req]
    (get-resource-map-counts config req)))

(defmethod ig/init-key :gpml.handler.landing/get-query-params [_ _]
  {:query query-params})
