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
        processed-order-by (if (= "not_ps_bookmarked" order-by)
                             "ps_bookmarked"
                             order-by)
        order-by-order (cond (= "ps_bookmarked" order-by)
                             "DESC NULLS LAST"

                             (= "not_ps_bookmarked" order-by)
                             "ASC NULLS FIRST"

                             descending
                             "DESC"

                             :else
                             "ASC")
        order-by (when processed-order-by
                   (format "ORDER BY %s %s" processed-order-by order-by-order))
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

(defn list-organisations-ps-bookmark-partial-select
  [params]
  (let [{:keys [plastic-strategy-id]} params]
    (when plastic-strategy-id
      "json_agg(
         DISTINCT jsonb_build_object(
           'plastic_strategy_id', psb.plastic_strategy_id,
           'organisation_id', psb.organisation_id,
           'section_key', psb.section_key
         )
       ) FILTER (WHERE psb.plastic_strategy_id IS NOT NULL) AS plastic_strategy_bookmarks,
       (psb.organisation_id IS NOT NULL)::boolean AS ps_bookmarked,")))

(defn list-organisations-badges-partial-select
  [params]
  (let [{:keys [badges]} params]
    (when-not (nil? badges)
      "COALESCE(
         jsonb_agg(
           DISTINCT jsonb_build_object(
             'badge_id', oba.badge_id,
             'badge_name', ba.name,
             'organisation_id', oba.organisation_id,
             'assigned_by', oba.assigned_by,
             'assigned_at', oba.assigned_at
           )
         ) FILTER (WHERE oba.badge_id IS NOT NULL),
        '[]'::jsonb) AS assigned_badges,")))

(defn list-organisations-strengths-cto
  [{:keys [plastic-strategy-id]}]
  (let [bookmarked-initiatives-join (if-not plastic-strategy-id
                                      ""
                                      (format
                                       "INNER JOIN plastic_strategy_initiative_bookmark psib
                                         ON (oi.initiative = psib.initiative_id AND psib.plastic_strategy_id = %d)"
                                       plastic-strategy-id))]
    (format "SELECT oi.organisation, %s AS initiative
             FROM organisation_initiative oi
             %s
             WHERE oi.association IN ('owner', 'implementor', 'donor', 'partner')"
            (if-not plastic-strategy-id
              "oi.initiative"
              "psib.initiative_id")
            bookmarked-initiatives-join)))

(defn list-organisations-cto-query-filter-and-params
  [params]
  (let [{:keys [filters plastic-strategy-id]} params
        {:keys [geo-coverage-types types review-status tags ps-bookmark-sections-keys]} filters
        ps-bookmark-section-keys-join-cond (if-not ps-bookmark-sections-keys
                                             ""
                                             " AND psb.section_key IN (:v*:filters.ps-bookmark-sections-keys)")
        ps-bookmark-join (if-not plastic-strategy-id
                           ""
                           (format "LEFT JOIN plastic_strategy_organisation_bookmark psb ON (o.id = psb.organisation_id %s AND psb.plastic_strategy_id = %d)"
                                   ps-bookmark-section-keys-join-cond
                                   plastic-strategy-id))
        badges-join (if-not (contains? (set (keys params)) :badges)
                      ""
                      "LEFT JOIN organisation_badge oba ON oba.organisation_id = o.id
                       LEFT JOIN badge ba ON ba.id = oba.badge_id")
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
                     (str " AND o.type IN (:v*:filters.types)")

                     (and plastic-strategy-id
                          (seq ps-bookmark-sections-keys)
                          (contains? (set (keys filters)) :ps-bookmarked))
                     (str " AND psb.section_key IN (:v*:filters.ps-bookmark-sections-keys)"))
        having (when (seq tags)
                 "HAVING array_agg(t.tag) FILTER (WHERE t.id IS NOT NULL) @> ARRAY[:v*:filters.tags]::text[]")
        ps-bookmark-group-by (if-not plastic-strategy-id
                               ""
                               ", psb.organisation_id")]
    (format "%s
             %s
             %s
             GROUP BY o.id %s
             %s"
            ps-bookmark-join
            badges-join
            where-cond
            ps-bookmark-group-by
            (or having ""))))
