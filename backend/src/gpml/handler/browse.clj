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
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def country-re #"^\d+(,\d+)*$")
(def topic-re (re-pattern (format "^(%1$s)((,(%1$s))+)?$" (str/join "|" topics))))

(def query-params
  [:map
   [:country {:optional true
              :swagger {:description "Comma separated list of country id"
                        :type "string"
                        :collectionFormat "csv"
                        :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re country-re]]]
   [:transnational {:optional true
                    :swagger {:description "Comma separated list of transnational id"
                              :type "string"
                              :collectionFormat "csv"
                              :allowEmptyValue true}}
    [:or
     [:string {:max 0}]
     [:re country-re]]]
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
  [{:keys [q transnational country topic tag favorites user-id limit offset]}]
  (merge {}
         (when offset
           {:offset offset})
         (when limit
           {:limit limit})
         (when (and user-id favorites) {:user-id user-id
                                        :favorites true
                                        :resource-types resource-types})
         (when (seq country)
           {:geo-coverage (->> (set (str/split country #","))
                               (map read-string))})
         (when (seq transnational)
           {:transnational  (set (map str (str/split transnational #",")))})
         (when (seq topic)
           {:topic (set (str/split topic #","))})
         (when (seq tag)
           {:tag (set (str/split tag #","))})
         (when (seq q)
           {:search-text (->> (str/trim q)
                              (re-seq #"\w+")
                              (str/join " & "))})))

(defn maybe-filter-private-topics [topics approved?]
  (or (and approved? topics)
      (->> topics
           (filter #(not (contains? approved-user-topics %)))
           vec)))

(defn modify-db-filter-topics [db-filter]
  (let [approved? (:approved db-filter)]
    (if approved?
      db-filter
      (let [t (or (:topic db-filter) topics)
            filtered-topics (set (maybe-filter-private-topics t approved?))]
        (merge db-filter {:topic filtered-topics})))))

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
  (let [modified-filters (->> query
                              (get-db-filter)
                              (merge {:approved approved?
                                      :admin admin})
                              (modify-db-filter-topics))
        modified-filters (if (:geo-coverage modified-filters)
                         (let [transnational (->> (db.country-group/get-country-groups-by-country db {:id (first (:geo-coverage modified-filters))})
                                                  (map (comp str :id))
                                                  set)]
                           (assoc modified-filters :transnational transnational))
                         modified-filters)
        results (->> modified-filters
                     (db.topic/get-topics db)
                     (map (fn [{:keys [json topic]}]
                            (assoc json :type topic))))
        counts (->> (assoc modified-filters :count-only? true)
                    (db.topic/get-topics db)
                    (filter #(or approved?
                                 (not (contains? approved-user-topics (:topic %))))))]
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
