(ns gpml.db.landing
  (:require [clojure.set :as set]
            [hugsql.core :as hugsql]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.pg-util]))

(declare map-counts summary map-transnational-counts)

(hugsql/def-db-fns "gpml/db/landing.sql")

(defn- stakeholder-count-by-geo-coverage-query [geo-coverage-type]
  (str
    "SELECT
     'stakeholder' AS entity, country AS geo_coverage, "
    (if (= geo-coverage-type :transnational)
      "0 AS entity_count "
      "COUNT(country) AS entity_count ")
    "FROM
    stakeholder
    WHERE
    review_status = 'APPROVED'
    GROUP BY
    entity, geo_coverage"))

(defn- non-member-organisation-count-by-geo-coverage-query [geo-coverage-type]
  (str
    "SELECT
     'non_member_organisation' AS entity,
     COALESCE(egc.country, cgc.country) AS geo_coverage,"
    (if (= geo-coverage-type :transnational)
      " COUNT(cgc.country_group) AS entity_count"
      " COUNT(COALESCE(egc.country, cgc.country)) AS entity_count")
    " FROM organisation e
      LEFT JOIN organisation_geo_coverage egc ON e.id = egc.organisation
      LEFT JOIN country_group_country cgc ON cgc.country_group = egc.country_group
     WHERE
     e.review_status = 'APPROVED' AND e.is_member = false "
    (if (= geo-coverage-type :transnational)
      "AND e.geo_coverage_type = 'transnational'"
      "AND e.geo_coverage_type <> 'transnational'")
    " GROUP BY entity, geo_coverage"))

(defn- entity-count-by-geo-coverage-query
  [entity-name geo-coverage-type]
  (let [entity-col (if (= entity-name "resource")
                     "REPLACE(LOWER(e.type), ' ', '_')"
                     (str "'" entity-name "'"))
        entity-count-col (if (= geo-coverage-type :transnational)
                           "COUNT(cgc.country_group) AS entity_count"
                           "COUNT(COALESCE(egc.country, cgc.country)) AS entity_count")
        where-cond (if (= geo-coverage-type :transnational)
                     (if (= entity-name "initiative")
                       "AND e.q24->>'transnational'::text = 'Transnational'"
                       "AND e.geo_coverage_type = 'transnational'")
                     (if (= entity-name "initiative")
                       "AND e.q24->>'transnational'::text IS NULL"
                       "AND e.geo_coverage_type <> 'transnational'"))]
    (cond
      (= entity-name "stakeholder")
      (stakeholder-count-by-geo-coverage-query geo-coverage-type)

      (= entity-name "non_member_organisation")
      (non-member-organisation-count-by-geo-coverage-query geo-coverage-type)

      :else
      (apply
        format
        "SELECT
             %s AS entity,
             COALESCE(egc.country, cgc.country) AS geo_coverage,
             %s
         FROM
             %s e
             LEFT JOIN %s_geo_coverage egc ON e.id = egc.%s
             LEFT JOIN country_group_country cgc ON cgc.country_group = egc.country_group
         WHERE
              e.review_status = 'APPROVED' %s
         GROUP BY
              entity,
              geo_coverage"
        (flatten [entity-col entity-count-col (repeat 3 entity-name) where-cond])))))

(defn generate-entity-count-by-geo-coverage-query-cte
  [{:keys [cte-name geo-coverage-type]} _opts]
  (str
   "WITH "
   cte-name
   " AS ("
   (reduce (fn [acc entity]
             (let [query (entity-count-by-geo-coverage-query entity geo-coverage-type)]
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

(defn map-counts-explicit [conn]
  (let [map-counts (map-counts conn)
        transnational-counts (map-transnational-counts conn)]
    (reduce
     (fn [acc [_ counts]]
       (conj acc (merge-with into topic-counts (apply merge counts))))
     []
     (group-by :id (concat map-counts transnational-counts)))))

(defn remap-counts [x]
  (assoc (dissoc x :id) :country_id (:id x)))

(defn map-counts-include-all-countries [conn]
  (let [counts (map-counts-explicit conn)
        included-countries (->> counts (map :id) set)
        all-countries (->> (db.country/all-countries conn) (map :id) set)
        missing-countries (remove nil? (set/difference all-countries included-countries))
        missing-counts (map #(merge {:id %} topic-counts) missing-countries)]
    (map remap-counts (concat counts missing-counts))))

(comment

  (require 'dev)
  (def db (dev/db-conn))

  (map-counts-include-all-countries db))
