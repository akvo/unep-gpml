(ns gpml.handler.browse
  (:require [clojure.string :as str]
            [duct.logger :refer [log]]
            [gpml.db.country-group :as db.country-group]
            [gpml.db.resource.connection :as db.resource.connection]
            [gpml.db.topic :as db.topic]
            [gpml.domain.file :as dom.file]
            [gpml.domain.resource :as dom.resource]
            [gpml.domain.types :as dom.types]
            [gpml.handler.resource.permission :as h.r.permission]
            [gpml.handler.responses :as r]
            [gpml.handler.util :as handler.util]
            [gpml.service.file :as srv.file]
            [gpml.util.postgresql :as pg-util]
            [gpml.util.regular-expressions :as util.regex]
            [integrant.core :as ig]
            [medley.core :as medley])
  (:import [java.sql SQLException]))

(def ^:const topic-re (util.regex/comma-separated-enums-re dom.types/topic-types))
(def ^:const ^:private order-by-fields ["title" "description" "id" "featured"])
(def ^:const ^:private default-limit 50)
(def ^:const ^:private default-offset 0)

(def api-opts-schema
  "Browse API's filter options."
  [:and
   [:map
    ;; TODO: rename `country` to `countries`. Sync with FE.
    [:country {:optional true
               :swagger {:description "Comma separated list of country id"
                         :type "string"
                         :collectionFormat "csv"
                         :allowEmptyValue false}}
     [:set
      {:decode/string
       (fn [s]
         (->> (set (str/split s #","))
              (map #(Integer/parseInt %))))}
      pos-int?]]
    ;; TODO: rename `transnational` to `country-groups`. Sync with FE.
    [:transnational {:optional true
                     :swagger {:description "Comma separated list of transnational id"
                               :type "string"
                               :collectionFormat "csv"
                               :allowEmptyValue false}}
     [:set
      {:decode/string (fn [s] (set (map #(Integer/parseInt %) (str/split s #","))))}
      pos-int?]]
    [:topic {:optional true
             :swagger {:description (format "Comma separated list of topics to filter: %s" (str/join "," dom.types/topic-types))
                       :type "string"
                       :collectionFormat "csv"
                       :allowEmptyValue false}}
     [:set
      {:decode/string (fn [s] (set (str/split s #",")))}
      (apply conj [:enum] dom.types/topic-types)]]
    [:tag {:optional true
           :swagger {:description "Comma separated list of tags"
                     :type "string"
                     :collectionFormat "csv"
                     :allowEmptyValue false}}
     [:set
      {:decode/string (fn [s] (set (str/split s #",")))}
      string?]]
    [:q {:optional true
         :swagger {:description "Text search term to be found on the different topics"
                   :type "string"
                   :allowEmptyValue false}}
     [:string
      {:min 1
       :decode/string (fn [s] (->> (str/trim s)
                                   (re-seq #"\w+")
                                   (str/join " & ")))}]]
    [:favorites {:optional true
                 :error/message "Favorites should be 'true' or 'false'"
                 :swagger {:description "Flag to return only favorited items"
                           :type "boolean"
                           :allowEmptyValue false}}
     [:boolean]]
    [:startDate {:optional true
                 :error/message "startDate should be in the ISO 8601 format i.e.: YYYY-MM-DD"
                 :swagger {:description "Events startDate in the format of ISO 8601 i.e.: YYYY-MM-DD"
                           :type "string"
                           :allowEmptyValue false}}
     [:or
      [:string {:max 0}]
      [:re util.regex/date-iso-8601-re]]]
    [:endDate {:optional true
               :error/message "endDate should be in the ISO 8601 format i.e.: YYYY-MM-DD"
               :swagger {:description "Events endDate in the format of ISO 8601 i.e.: YYYY-MM-DD"
                         :type "string"
                         :allowEmptyValue false}}
     [:or
      [:string {:max 0}]
      [:re util.regex/date-iso-8601-re]]]
    [:representativeGroup {:optional true
                           :swagger {:description "Comma separated list of representative groups"
                                     :type "string"
                                     :allowEmptyValue false}}
     [:set
      {:decode/string (fn [s] (set (str/split s #",")))}
      string?]]
    [:affiliation {:optional true
                   :swagger {:description "Comma separated list of affiliation ids (i.e., organisation ids)"
                             :type "string"
                             :allowEmptyValue false}}
     [:set
      {:decode/string (fn [s] (set (map #(Integer/parseInt %) (str/split s #","))))}
      pos-int?]]
    [:subContentType {:optional true
                      :swagger {:description "Comma separated list of a topic's subContentTypes"
                                :type "string"
                                :allowEmptyValue false}}
     [:set
      {:decode/string (fn [s] (set (str/split s #",")))}
      string?]]
    [:entity {:optional true
              :swagger {:description "Comma separated list of entity IDs"
                        :type "string"
                        :allowEmptyValue false}}
     [:set
      {:decode/string (fn [s] (set (map #(Integer/parseInt %) (str/split s #","))))}
      pos-int?]]
    [:orderBy {:optional true
               :swagger {:description "One of the following properties to order the list of results: title, description, id"
                         :type "string"
                         :allowEmptyValue false}}
     (apply vector :enum order-by-fields)]
    [:incCountsForTags {:optional true
                        :swagger {:description "Includes the counts for the specified tags which is a comma separated list of approved tags."
                                  :type "string"}}
     [:set
      {:decode/string (fn [s] (set (str/split s #",")))}
      string?]]
    [:descending {:optional true
                  :swagger {:description "Order results in descending order: true or false"
                            :type "boolean"
                            :allowEmptyValue false}}
     [:boolean]]
    [:limit {:optional true
             :swagger {:description "Limit the number of entries per page"
                       :type "int"
                       :allowEmptyValue false}}
     [:int {:min 1}]]
    [:offset {:optional true
              :swagger {:description "Number of items to skip when fetching entries"
                        :type "int"
                        :allowEmptyValue false}}
     [:int {:min 0}]]
    [:featured {:optional true
                :error/message "Featured should be 'true' or 'false'"
                :swagger {:description "Boolean flag to filter by featured resources"
                          :type "boolean"
                          :allowEmptyValue false}}
     boolean?]
    [:upcoming {:optional true
                :error/message "Upcoming should be 'true' or 'false'"
                :swagger {:description "Boolean flag to filter by upcoming events. This only applies to the event entity"
                          :type "boolean"
                          :allowEmptyValue false}}
     boolean?]
    [:capacity_building {:optional true
                         :error/message "'capacity_building' should be 'true' or 'false'"
                         :swagger {:description "Boolean flag to filter by capacity building resources"
                                   :type "boolean"
                                   :allowEmptyValue false}}
     boolean?]]
   [:fn
    {:error/fn
     (fn [_ _]
       "Upcoming parameter is only supported for the 'event' topic.")}
    (fn [{:keys [upcoming topic]}]
      (if-not (true? upcoming)
        true
        (and upcoming
             (= (count topic) 1)
             (= (first topic) "event"))))]])

(defn get-db-filter
  "Transforms API query parameters into a map of database filters."
  [{:keys [limit offset startDate endDate user-id favorites country transnational
           topic tag affiliation representativeGroup subContentType entity orderBy
           descending q incCountsForTags featured capacity_building upcoming]
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
    (assoc :user-id user-id :favorites true :resource-types dom.resource/types)

    (seq country)
    (assoc :countries country)

    (seq transnational)
    (assoc :country-groups transnational)

    (seq topic)
    (assoc :topic topic)

    (seq tag)
    (assoc :tag tag)

    (seq incCountsForTags)
    (assoc :tags-to-count incCountsForTags)

    (seq affiliation)
    (assoc :affiliation affiliation)

    (seq representativeGroup)
    (assoc :representative-group representativeGroup)

    (seq subContentType)
    (assoc :sub-content-type subContentType)

    (seq entity)
    (assoc :entity entity)

    (seq orderBy)
    (assoc :order-by orderBy)

    (not (nil? descending))
    (assoc :descending descending)

    (seq q)
    (assoc :search-text q)

    featured
    (assoc :featured featured)

    upcoming
    (assoc :upcoming upcoming)

    capacity_building
    (assoc :capacity-building capacity_building)

    true
    (assoc :review-status "APPROVED")))

(defn- resource->api-resource
  [config resource]
  (let [conn (get-in config [:db :spec])
        {:keys [topic json]} resource
        resource-type (handler.util/get-internal-topic-type topic)
        {:keys [id image_id thumbnail_id]} json
        files (->> (:files json)
                   (map dom.file/decode-file)
                   (srv.file/add-files-urls config)
                   (medley/index-by (comp str :id)))
        connections (db.resource.connection/get-resource-stakeholder-connections
                     conn
                     {:resource-type resource-type
                      :resource-id id})]
    (assoc json
           :type topic
           :image (get-in files [image_id :url])
           :thumbnail (get-in files [thumbnail_id :url])
           :stakeholder_connections connections)))

(defn- browse-response
  [{:keys [logger] {db :spec} :db :as config} query approved? admin]
  (try
    (let [{:keys [countries country-groups] :as modified-filters}
          (->> query
               (get-db-filter)
               (merge {:approved approved?
                       :admin admin}))
          modified-filters (cond
                             (seq countries)
                             (let [opts {:filters {:countries-ids countries}}
                                   transnational (->> (db.country-group/get-country-groups-by-countries db opts)
                                                      (map :id)
                                                      set)]
                               (assoc modified-filters
                                      :geo-coverage-countries countries
                                      :geo-coverage-country-groups transnational))

                             (seq country-groups)
                             (let [opts {:filters {:country-groups country-groups}}
                                   country-group-countries (db.country-group/get-country-groups-countries db opts)
                                   geo-coverage-countries (map :id country-group-countries)]
                               (assoc modified-filters
                                      :geo-coverage-country-groups country-groups
                                      :geo-coverage-countries (set geo-coverage-countries)))
                             :else
                             modified-filters)
          get-topics-start-time (System/currentTimeMillis)
          results (->> modified-filters
                       (db.topic/get-topics db)
                       (map (partial resource->api-resource config)))
          get-topics-exec-time (- (System/currentTimeMillis) get-topics-start-time)
          count-topics-start-time (System/currentTimeMillis)
          counts (->> (assoc modified-filters :count-only? true)
                      (db.topic/get-topics db))
          count-topics-exec-time (- (System/currentTimeMillis) count-topics-start-time)]
      (log logger :info ::query-exec-time {:get-topics-exec-time (str get-topics-exec-time "ms")
                                           :count-topics-exec-time (str count-topics-exec-time "ms")})
      (r/ok {:success? true
             :results results
             :counts counts}))
    (catch Throwable t
      (log logger :error :failed-to-get-topics {:exception-message (ex-message t)
                                                :context-data {:query-params query}})
      (let [response {:success? false
                      :reason :could-not-get-topics}]
        (if (instance? SQLException t)
          (r/server-error (assoc-in response [:error-details :error] (pg-util/get-sql-state t)))
          (r/server-error (assoc-in response [:error-details :error] (ex-message t))))))))

(defmethod ig/init-key :gpml.handler.browse/get [_ config]
  (fn [{{:keys [query]} :parameters
        approved? :approved?
        user :user}]
    (#'browse-response
     config
     (merge query {:user-id (:id user)})
     approved?
     (h.r.permission/super-admin? config (:id user)))))

(defmethod ig/init-key :gpml.handler.browse/query-params [_ _]
  api-opts-schema)
