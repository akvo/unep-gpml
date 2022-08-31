(ns gpml.db.landing
  {:ns-tracker/resource-deps ["landing.sql"]}
  (:require [clojure.set :as set]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.util.postgresql]
            [hugsql.core :as hugsql]))

(def ^:const ^:private non-transnational-geo-coverage-types ["regional" "national" "sub-national"])
(def ^:const ^:private transnational-geo-coverage-types ["transnational"])

(declare map-counts summary)

(hugsql/def-db-fns "gpml/db/landing.sql")

(def ^:private default-topic-counts
  (->> constants/topics
       (map #(-> {}
                 (assoc-in [:counts (keyword %)] 0)
                 (assoc-in [:transnational_counts (keyword %)] 0)))
       (apply merge-with into)))

(defn- get-resource-map-counts*
  [conn opts]
  (let [modified-opts (if (= :topic (:entity-group opts))
                        (merge opts {:geo-coverage-types (concat non-transnational-geo-coverage-types transnational-geo-coverage-types)})
                        opts)
        {:keys [country_counts transnational_counts country_group_counts]}
        (:result (map-counts conn modified-opts))]
    {:country_counts (reduce
                      (fn [acc [_ counts]]
                        (conj acc (merge-with into default-topic-counts (apply merge counts))))
                      []
                      (group-by :country_id (concat country_counts transnational_counts)))
     :country_group_counts country_group_counts}))

(defn get-resource-map-counts
  "Returns a map with resource counts aggregated by country and country
  group."
  [conn opts]
  (let [{:keys [country_counts country_group_counts]} (get-resource-map-counts* conn opts)
        included-countries (->> country_counts (map :country_id) set)
        all-countries (->> (db.country/all-countries conn) (map :id) set)
        missing-countries (remove nil? (set/difference all-countries included-countries))
        missing-counts (map #(merge {:country_id %} default-topic-counts) missing-countries)]
    {:country_counts (concat country_counts missing-counts)
     :country_group_counts country_group_counts}))
