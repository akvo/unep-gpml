(ns gpml.db.landing
  (:require [clojure.set :as set]
            [hugsql.core :as hugsql]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.pg-util]))

(def ^:const ^:private non-transnational-geo-coverage-types ["regional" "national" "sub-national"])
(def ^:const ^:private transnational-geo-coverage-types ["transnational"])

(declare map-counts map-counts-by-country-group summary)

(hugsql/def-db-fns "gpml/db/landing.sql")

(defn- entity-count-by-country-group-query
  [entity-name]
  (let [entity-name-from-clause (if (= entity-name "non_member_organisation")
                                  "organisation"
                                  entity-name)
        where-cond (cond-> ""
                     (= entity-name "non_member_organisation")
                     (str " AND e.is_member IS FALSE")

                     (= entity-name "organisation")
                     (str " AND e.is_member IS TRUE"))]
    (apply
     format
     "SELECT
         '%s' AS entity,
         country_group AS geo_coverage,
         COUNT(e.*)
     FROM
         %s e
     JOIN
         %s_geo_coverage egc ON e.id = egc.%s
     WHERE egc.country_group IS NOT NULL %s
     GROUP BY entity, geo_coverage"
     (flatten [entity-name (repeat 3 entity-name-from-clause) where-cond]))))

(defn generate-entity-count-by-country-group-query-cte
  [{:keys [cte-name]} _opts]
  (str
   "WITH "
   cte-name
   " AS ("
   (reduce (fn [acc entity]
             (let [query (entity-count-by-country-group-query entity)]
               (if (seq acc)
                 (str acc " UNION ALL " query)
                 query)))
           ""
           constants/geo-coverage-entity-tables)
   ")"))

(def topic-counts
  (->> constants/topics
       (map #(-> {}
                 (assoc-in [:counts (keyword %)] 0)
                 (assoc-in [:transnational_counts (keyword %)] 0)))
       (apply merge-with into)))

(defn get-map-counts-by-country-group
  "Get the entities count (i.e., Policy, Resource, Event, Organisation,
  Stakeholder, etc.) by country group (Europe, African States, etc.)."
  [conn]
  (let [counts (map-counts-by-country-group conn {})
        default-count-values (->> constants/topics
                                  (map #(assoc-in {} [:counts (keyword %)] 0))
                                  (apply merge-with into))]
    (reduce (fn [acc counts]
              (conj acc (merge-with into default-count-values counts)))
            []
            counts)))

(defn map-counts-explicit
  "Get the entities count (i.e., Policy, Resource, Event, Organisation,
  Stakeholder, etc.) by country. The result of this
  counting is grouped by countries."
  [conn opts]
  (let [counts (map-counts conn (merge opts {:geo-coverage-types non-transnational-geo-coverage-types
                                             :count-name "counts"
                                             :distinct-on-geo-coverage? true}))
        transnational-counts-by-country (map-counts conn (merge opts {:geo-coverage-types transnational-geo-coverage-types
                                                                      :count-name "transnational_counts"
                                                                      :distinct-on-geo-coverage? true}))]
    (reduce
     (fn [acc [_ counts]]
       (conj acc (merge-with into topic-counts (apply merge counts))))
     []
     (group-by :id (concat counts transnational-counts-by-country)))))

(defn remap-counts
  [x]
  (assoc (dissoc x :id) :country_id (:id x)))

(defn map-counts-include-all-countries
  [conn opts]
  (let [counts (map-counts-explicit conn opts)
        included-countries (->> counts (map :id) set)
        all-countries (->> (db.country/all-countries conn) (map :id) set)
        missing-countries (remove nil? (set/difference all-countries included-countries))
        missing-counts (map #(merge {:id %} topic-counts) missing-countries)]
    (map remap-counts (concat counts missing-counts))))
