(ns gpml.handler.browse
  (:require [clojure.string :as str]
            [gpml.constants :refer [topics resource-types approved-user-topics]]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.event :as db.event]
            [gpml.db.initiative :as db.initiative]
            [gpml.db.policy :as db.policy]
            [gpml.db.resource :as db.resource]
            [gpml.db.technology :as db.technology]
            [gpml.db.topic :as db.topic]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def ^:const topic-re (util.regex/comma-separated-enums-re topics))

(def query-params
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
   [:limit {:optional true
            :swagger {:description "Limit the number of entries per page"
                      :type "int"
                      :allowEmptyValue true}}
    [:int {:min 0 :max 100}]]
   [:offset {:optional true
             :swagger{:description "Number of items to skip when fetching entries"
                      :type "int"
                      :allowEmptyValue true}}
    [:int {:min 0}]]])

(defn get-db-filter
  [{:keys [q transnational country affiliation representativeGroup startDate endDate topic tag favorites user-id limit offset]}]
  (cond-> {}
    offset
    (assoc :offset offset)

    limit
    (assoc :limit limit)

    startDate
    (assoc :start-date startDate)

    endDate
    (assoc :end-date endDate)

    (and user-id favorites)
    (assoc :user-id user-id :favorites true :resource-types resource-types)

    (seq country)
    (assoc :geo-coverage (->> (set (str/split country #","))
                              (map read-string)))

    (seq transnational)
    (assoc :transnational (set (map str (str/split transnational #","))))

    (seq topic)
    (assoc :topic (set (str/split topic #",")))

    (seq tag)
    (assoc :tag (set (str/split tag #",")))

    (seq affiliation)
    (assoc :affiliation (set (map #(Integer/parseInt %) (str/split affiliation #","))))

    (seq representativeGroup)
    (assoc :representative-group (set (str/split representativeGroup #",")))

    (seq q)
    (assoc :search-text (->> (str/trim q)
                             (re-seq #"\w+")
                             (str/join " & ")))))

(defn- result->result-with-connections [db {:keys [type] :as result}]
  (case type
    (or "technical_resource" "financing_resource" "action_plan")
    (merge result
      {:entity_connections (db.resource/entity-connections-by-id db (select-keys result [:id]))
       :stakeholder_connections (db.resource/stakeholder-connections-by-id db (select-keys result [:id]))})

    "event"
    (merge result
      {:entity_connections (db.event/entity-connections-by-id db (select-keys result [:id]))
       :stakeholder_connections (db.event/stakeholder-connections-by-id db (select-keys result [:id]))})

    "project"
    (merge result
      {:entity_connections (db.initiative/entity-connections-by-id db (select-keys result [:id]))
       :stakeholder_connections (db.initiative/stakeholder-connections-by-id db (select-keys result [:id]))})

    "policy"
    (merge result
      {:entity_connections (db.policy/entity-connections-by-id db (select-keys result [:id]))
       :stakeholder_connections (db.policy/stakeholder-connections-by-id db (select-keys result [:id]))})

    "technology"
    (merge result
      {:entity_connections (db.technology/entity-connections-by-id db (select-keys result [:id]))
       :stakeholder_connections (db.technology/stakeholder-connections-by-id db (select-keys result [:id]))})

    result))

(defn browse-response [query db approved? admin]
  (let [{:keys [geo-coverage transnational] :as modified-filters} (->> query
                                                                    (get-db-filter)
                                                                    (merge {:approved approved?
                                                                            :admin admin}))
        modified-filters (cond
                           (and (seq geo-coverage) (seq transnational))
                           (let [country-group-countries (flatten
                                                           (conj
                                                             (map #(db.country-group/get-country-group-countries
                                                                     db {:id (Integer/parseInt %)})
                                                               (:transnational modified-filters))))
                                 geo-coverage-countries (map (comp str :id) country-group-countries)
                                 geo-coverage (map str geo-coverage)
                                 transnational (->> (db.country-group/get-country-groups-by-country db {:id (first (:geo-coverage modified-filters))})
                                                     (map (comp str :id))
                                                     set)]
                             (assoc modified-filters :geo-coverage-countries (set (concat geo-coverage-countries geo-coverage))
                                                     :transnational transnational))

                           (seq geo-coverage)
                           (let [transnational (->> (db.country-group/get-country-groups-by-country db {:id (first (:geo-coverage modified-filters))})
                                                 (map (comp str :id))
                                                 set)]
                             (assoc modified-filters :transnational transnational))

                           (seq transnational)
                           (let [country-group-countries (flatten
                                                           (conj
                                                             (map #(db.country-group/get-country-group-countries
                                                                     db {:id (Integer/parseInt %)})
                                                               (:transnational modified-filters))))
                                 geo-coverage-countries (map (comp str :id) country-group-countries)]
                             (assoc modified-filters :geo-coverage-countries (set geo-coverage-countries)))

                           :else
                           modified-filters)
        results (->> modified-filters
                     (db.topic/get-topics db)
                     (map (fn [{:keys [json topic]}]
                            (assoc json :type topic))))
        counts (->> (assoc modified-filters :count-only? true)
                    (db.topic/get-topics db))]
    {:results (map #(result->result-with-connections db %) results)
     :counts counts}))

(defmethod ig/init-key :gpml.handler.browse/get [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters
        approved? :approved?
        user :user}]
    (resp/response (#'browse-response
                    (merge query {:user-id (:id user)})
                    (:spec db)
                    approved?
                    (= "ADMIN" (:role user))))))

(defmethod ig/init-key :gpml.handler.browse/query-params [_ _]
  query-params)
