(ns gpml.db.landing
  {:ns-tracker/resource-deps ["landing.sql"]}
  (:require [clojure.set :as set]
            [hugsql.core :as hugsql]
            [gpml.constants :as constants]
            [gpml.db.country :as db.country]
            [gpml.util.postgresql]))

(def ^:const ^:private non-transnational-geo-coverage-types ["regional" "national" "sub-national"])
(def ^:const ^:private transnational-geo-coverage-types ["transnational"])

(declare map-counts map-counts-by-country-group summary)

(hugsql/def-db-fns "gpml/db/landing.sql")

(defn- entity-count-by-country-group-query
  [entity-name]
  (let [entity-name-select-clause (cond
                                    (= entity-name "resource")
                                    "REPLACE(LOWER(e.type), ' ', '_')"

                                    ;;TODO: discuss initiative naming
                                    ;;with FE team. Ideally we should
                                    ;;stop using `project` name and
                                    ;;use the real table name which is
                                    ;;`initiative`.
                                    (= entity-name "initiative")
                                    "'project'"

                                    :else
                                    (str "'" entity-name "'"))
        entity-name-from-clause (if (= entity-name "non_member_organisation")
                                  "organisation"
                                  entity-name)
        where-cond (cond-> ""
                     (= entity-name "non_member_organisation")
                     (str " AND e.is_member IS FALSE")

                     (= entity-name "organisation")
                     (str " AND e.is_member IS TRUE"))
        extra-group-by-field (if (= entity-name "resource")
                               ", e.type"
                               "")]
    (apply
     format
     "SELECT DISTINCT ON (cgc.country_group, e.id) cgc.country_group AS country_group_id,
	     %s AS entity,
             COUNT(e.id) entity_count
      FROM %s_geo_coverage egc
      LEFT JOIN %s e ON e.id = egc.%s
      LEFT JOIN country_group_country cgc ON egc.country = cgc.country
      OR egc.country_group = cgc.country_group
      WHERE e.review_status = 'APPROVED' %s
      GROUP BY cgc.country_group, e.id, cgc.country %s"
     (flatten [entity-name-select-clause
               (repeat 3 entity-name-from-clause)
               where-cond extra-group-by-field]))))

(defn generate-entity-count-by-country-group-queries
  [_ _]
  (reduce (fn [acc entity]
            (let [query (entity-count-by-country-group-query entity)]
              (if (seq acc)
                (str acc " UNION ALL " query)
                query)))
          ""
          constants/geo-coverage-entity-tables))

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
  (let [counts (map-counts conn (merge opts {:count-name "counts"}
                                       (when (= :topic (:entity-group opts))
                                         {:geo-coverage-types non-transnational-geo-coverage-types})))
        transnational-counts-by-country (map-counts conn (merge opts {:geo-coverage-types transnational-geo-coverage-types
                                                                      :count-name "transnational_counts"}))]
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
