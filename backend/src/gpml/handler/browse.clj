(ns gpml.handler.browse
  (:require [clojure.string :as str]
            [gpml.constants :refer [topics resource-types]]
            [gpml.db.browse :as db.browse]
            [gpml.db.stakeholder :as db.stakeholder]
            [integrant.core :as ig]
            [ring.util.response :as resp]))

(def country-re #"^(\p{Upper}{3})((,\p{Upper}{3})+)?$")
(def topic-re (re-pattern (format "^(%1$s)((,(%1$s))+)?$" (str/join "|" topics))))

(def query-params
  [:map
   [:country {:optional true
              :swagger {:description "Comma separated list of country codes (ISO 3166-1 Alpha-3 code)"
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
    [:boolean]]])

(defn get-db-filter
  [{:keys [q country topic favorites user]}]
  (merge {}
         (when (and user favorites) {:user user
                                     :favorites true
                                     :resource-types resource-types})
         (when (seq country)
           {:geo-coverage (set (str/split country #","))})
         (when (seq topic)
           {:topic (set (str/split topic #","))})
         (when (seq q)
           {:search-text (-> q
                             (str/replace #"&" "")
                             (str/replace #" " " & "))})))

(defn results [query db approved?]
  (let [data (->> query
                  (get-db-filter)
                  (db.browse/filter-topic db)
                  (filter (fn [{:keys [topic]}] (or approved? (not (= topic "stakeholder")))))
                  (map (fn [{:keys [json geo_coverage_iso_code topic]}]
                         (merge
                          (assoc json
                                 :type topic)
                          (when geo_coverage_iso_code
                            {:geo_coverage_countries [geo_coverage_iso_code]})))))]
    (tap> data)
    data))

(defmethod ig/init-key :gpml.handler.browse/get [_ {:keys [db]}]
  (fn [{{:keys [query]} :parameters {:keys [email]} :jwt-claims}]
    (let [stakeholder (and email (->> {:email email}
                                      (db.stakeholder/stakeholder-by-email (:spec db))))
          user-id (:id stakeholder)
          approved? (= "APPROVED" (:review_status stakeholder))]
      (resp/response {:results (#'results
                                (merge query {:user user-id})
                                (:spec db)
                                approved?)}))))

(defmethod ig/init-key :gpml.handler.browse/query-params [_ _]
  query-params)
