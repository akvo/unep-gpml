(ns gpml.db.landing
  (:require [clojure.set :as set]
            [hugsql.core :as hugsql]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.pg-util]))

(declare map-counts summary)

(hugsql/def-db-fns "gpml/db/landing.sql")

(defn- entity-count-by-geo-coverage-query
  [entity-name geo-coverage geo-coverage-type]
  (let [entity-col (if (= entity-name "resource")
                     "REPLACE(LOWER(e.type), ' ', '_')"
                     (str "'" entity-name "'"))
        entity-name-from-clause (if (= entity-name "non_member_organisation")
                                  "organisation"
                                  entity-name)
        entity-count-col (if (= geo-coverage-type :transnational)
                           "COUNT(cgc.country_group) AS entity_count"
                           "COUNT(COALESCE(egc.country, cgc.country)) AS entity_count")
        geo-coverage-col (if (= geo-coverage :country-group)
                           "cgc.country_group"
                           "COALESCE(egc.country, cgc.country)")
        where-cond (cond-> ""
                     (and (= geo-coverage-type :transnational)
                          (= entity-name "initiative"))
                     (str " AND e.q24->>'transnational'::text = 'Transnational'")

                     (and (= geo-coverage-type :transnational)
                          (not= entity-name "initiative"))
                     (str " AND e.geo_coverage_type = 'transnational'")

                     (and (= entity-name "initiative")
                          (not= geo-coverage-type :transnational))
                     (str " AND e.q24->>'transnational'::text IS NULL")

                     (and (not= entity-name "initiative")
                          (not= geo-coverage-type :transnational))
                     (str " AND e.geo_coverage_type <> 'transnational'")

                     (= entity-name "non_member_organisation")
                     (str " AND is_member IS FALSE")

                     (= entity-name "organisation")
                     (str " AND is_member IS TRUE"))]
    (apply
     format
     "SELECT
             %s AS entity,
             %s AS geo_coverage,
             %s
         FROM
             %s e
             LEFT JOIN %s_geo_coverage egc ON e.id = egc.%s
             LEFT JOIN country_group_country cgc ON cgc.country_group = egc.country_group
         WHERE
              e.review_status = 'APPROVED' AND (egc.country IS NOT NULL or cgc.country IS NOT NULL) %s
         GROUP BY
              entity,
              geo_coverage"
     (flatten [entity-col geo-coverage-col
               entity-count-col
               (repeat 3 entity-name-from-clause) where-cond]))))

(defn generate-entity-count-by-geo-coverage-query-cte
  [{:keys [cte-name geo-coverage geo-coverage-type]} _opts]
  (str
   "WITH "
   cte-name
   " AS ("
   (reduce (fn [acc entity]
             (let [query (entity-count-by-geo-coverage-query entity geo-coverage geo-coverage-type)]
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

(defn map-counts-explicit
  "Get the entities count (i.e., Policy, Resource, Event, Organisation,
  Stakeholder, etc.) by country. The result of this
  counting is grouped by countries."
  [conn opts]
  (let [counts (map-counts conn (merge opts {:geo-coverage-types ["regional" "national" "sub-national"]
                                             :count-name "counts"
                                             :distinct-on-geo-coverage? true}))
        transnational-counts-by-country (map-counts conn (merge opts {:geo-coverage-types ["transnational"]
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
