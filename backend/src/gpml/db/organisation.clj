(ns gpml.db.organisation
  {:ns-tracker/resource-deps ["organisation.sql"]}
  (:require [gpml.util :as util]
            [gpml.util.sql :as sql-util]
            [hugsql.core :as hugsql]))

(declare update-organisation
         organisation-by-id
         all-public-entities
         all-public-non-member-entities
         all-non-members
         new-organisation
         all-members
         geo-coverage-v2
         get-organisation-files-to-migrate
         get-organisations
         list-organisations)

(hugsql/def-db-fns "gpml/db/organisation.sql" {:quoting :ansi})

(defn organisation->db-organisation
  "Apply transformations to Organisation entity fields to database specific
  types."
  [resource]
  (-> resource
      (util/update-if-not-nil :geo_coverage_type sql-util/keyword->pg-enum "geo_coverage_type")
      (util/update-if-not-nil :review_status sql-util/keyword->pg-enum "review_status")))

(defn list-organisations-query-and-filters
  [params]
  (let [{:keys [count-only? limit page order-by descending]} params
        order-by (when order-by
                   (format "ORDER BY %s %s" order-by (if descending
                                                       "DESC"
                                                       "ASC")))
        pagination (when (and (not count-only?)
                              limit
                              page)
                     (format "LIMIT %d OFFSET %d" limit (* limit page)))]
    (if count-only?
      "SELECT count(*) FROM organisations_cte cte_orgs;"
      (format "SELECT cte_orgs.*
               FROM organisations_cte cte_orgs
               %s
               %s;"
              (or order-by "")
              (or pagination "")))))

(defn list-organisations-cto-query-filter-and-params
  [params]
  (let [{:keys [filters]} params
        {:keys [geo-coverage-types types review-status tags]} filters
        where-cond (cond-> "WHERE 1=1"
                     (seq review-status)
                     (str " AND o.review_status = :filters.review-status::REVIEW_STATUS")

                     (contains? (set (keys filters)) :is-member)
                     (str " AND o.is_member = :filters.is-member")

                     (seq geo-coverage-types)
                     (str " AND o.geo_coverage_type = ANY(ARRAY[:v*:filters.geo-coverage-types]::GEO_COVERAGE_TYPE[])")

                     (seq (:name filters))
                     (str " AND o.name ILIKE '%' || :filters.name || '%'")

                     (seq types)
                     (str " AND o.type IN (:v*:filters.types)"))
        having (when (seq tags)
                 "HAVING array_agg(t.tag) FILTER (WHERE t.id IS NOT NULL) && ARRAY[:v*:filters.tags]::text[]")]
    (format "%s
             GROUP BY o.id
             %s"
            where-cond
            (or having ""))))
