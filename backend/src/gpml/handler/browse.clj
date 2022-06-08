(ns gpml.handler.browse
  (:require
   [clojure.string :as str]
   [duct.logger :refer [log]]
   [gpml.constants :refer [resource-types topics]]
   [gpml.db.country-group :as db.country-group]
   [gpml.db.resource.connection :as db.resource.connection]
   [gpml.db.topic :as db.topic]
   [gpml.util.regular-expressions :as util.regex]
   [integrant.core :as ig]
   [ring.util.response :as resp]))

(def ^:const topic-re (util.regex/comma-separated-enums-re topics))
(def ^:const order-by-fields ["title" "description" "id"])
(def ^:const default-limit 50)
(def ^:const default-offset 0)

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
   [:orderBy {:optional true
              :swagger {:description "One of the following properties to order the list of results: title, description, id"
                        :type "string"
                        :allowEmptyValue true}}
    (apply vector :enum order-by-fields)]
   [:incCountsForTags {:optional true
                       :swagger {:description "Includes the counts for the specified tags which is a comma separated list of approved tags."
                                 :type "string"}}
    [:string {:min 1}]]
   [:descending {:optional true
                 :swagger {:description "Order results in descending order: true or false"
                           :type "boolean"
                           :allowEmptyValue true}}
    [:boolean]]
   [:limit {:optional true
            :swagger {:description "Limit the number of entries per page"
                      :type "int"
                      :allowEmptyValue true}}
    [:int {:min 0 :max 100}]]
   [:offset {:optional true
             :swagger {:description "Number of items to skip when fetching entries"
                       :type "int"
                       :allowEmptyValue true}}
    [:int {:min 0}]]])

(defn get-db-filter
  [{:keys [limit offset startDate endDate user-id favorites country transnational
           topic tag affiliation representativeGroup subContentType entity orderBy
           descending q incCountsForTags]
    :or {limit default-limit
         offset default-offset}}]
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
                              (map #(Integer/parseInt %))))

    (seq transnational)
    (assoc :transnational (set (map #(Integer/parseInt %) (str/split transnational #","))))

    (seq topic)
    (assoc :topic (set (str/split topic #",")))

    (seq tag)
    (assoc :tag (set (str/split tag #",")))

    (seq incCountsForTags)
    (assoc :tags-to-count (set (str/split incCountsForTags #",")))

    (seq affiliation)
    (assoc :affiliation (set (map #(Integer/parseInt %) (str/split affiliation #","))))

    (seq representativeGroup)
    (assoc :representative-group (set (str/split representativeGroup #",")))

    (seq subContentType)
    (assoc :sub-content-type (set (str/split subContentType #",")))

    (seq entity)
    (assoc :entity (set (map #(Integer/parseInt %) (str/split entity #","))))

    (seq orderBy)
    (assoc :order-by orderBy)

    (not (nil? descending))
    (assoc :descending descending)

    (seq q)
    (assoc :search-text (->> (str/trim q)
                             (re-seq #"\w+")
                             (str/join " & ")))))

(defn- result->result-with-connections [db {:keys [type] :as result}]
  (let [resource-type (cond
                        (some #{type} resource-types)
                        "resource"

                        ;; TODO: review with the team the change from
                        ;; project to initiative
                        (= type "project")
                        "initiative"

                        :else
                        type)]
    (->> {:resource-type resource-type
          :resource-id (:id result)}
         (db.resource.connection/get-resource-stakeholder-connections db)
         (assoc result :stakeholder_connections))))

(defn browse-response
  [{:keys [logger] {db :spec} :db} query approved? admin]
  (let [{:keys [geo-coverage transnational] :as modified-filters} (->> query
                                                                       (get-db-filter)
                                                                       (merge {:approved approved?
                                                                               :admin admin}))
        modified-filters (cond
                           (and (seq geo-coverage) (seq transnational))
                           (let [country-group-countries (flatten
                                                          (conj
                                                           (map #(db.country-group/get-country-group-countries
                                                                  db {:id %})
                                                                (:transnational modified-filters))))
                                 geo-coverage-countries (map :id country-group-countries)
                                 transnational (->> (map #(db.country-group/get-country-groups-by-country db {:id %}) (:geo-coverage modified-filters))
                                                    (apply concat)
                                                    (map :id)
                                                    set)]
                             (assoc modified-filters :geo-coverage-countries (set (concat geo-coverage-countries geo-coverage))
                                    :transnational transnational))

                           (seq geo-coverage)
                           (let [transnational (->> (map #(db.country-group/get-country-groups-by-country db {:id %}) (:geo-coverage modified-filters))
                                                    (apply concat)
                                                    (map :id)
                                                    set)]
                             (assoc modified-filters :transnational transnational))

                           (seq transnational)
                           (let [country-group-countries (flatten
                                                          (conj
                                                           (map #(db.country-group/get-country-group-countries
                                                                  db {:id %})
                                                                (:transnational modified-filters))))
                                 geo-coverage-countries (map :id country-group-countries)]
                             (assoc modified-filters :geo-coverage-countries (set geo-coverage-countries)))
                           :else
                           modified-filters)
        get-topics-start-time (System/currentTimeMillis)
        results (->> modified-filters
                     (db.topic/get-topics db)
                     (map (fn [{:keys [json topic]}]
                            (assoc json :type topic))))
        get-topics-exec-time (- (System/currentTimeMillis) get-topics-start-time)
        count-topics-start-time (System/currentTimeMillis)
        counts (->> (assoc modified-filters :count-only? true)
                    (db.topic/get-topics db))
        count-topics-exec-time (- (System/currentTimeMillis) count-topics-start-time)]
    (log logger :info ::query-exec-time {:get-topics-exec-time (str get-topics-exec-time "ms")
                                         :count-topics-exec-time (str count-topics-exec-time "ms")})
    {:results (map #(result->result-with-connections db %) results)
     :counts counts}))

(defmethod ig/init-key :gpml.handler.browse/get [_ config]
  (fn [{{:keys [query]} :parameters
        approved? :approved?
        user :user}]
    (resp/response (#'browse-response
                    config
                    (merge query {:user-id (:id user)})
                    approved?
                    (= "ADMIN" (:role user))))))

(defmethod ig/init-key :gpml.handler.browse/query-params [_ _]
  query-params)
