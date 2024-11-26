(ns gpml.db.community
  #:ns-tracker{:resource-deps ["community.sql"]}
  (:require
   [clojure.string :as str]
   [hugsql.core :as hugsql]))

(declare get-community-members)

(hugsql/def-db-fns "gpml/db/community.sql" {:quoting :ansi})

(defn get-community-members-query-and-filters [params]
  (let [{:keys [count-only? limit page filters order-by descending]} params
        {:keys [search-text network-type affiliation geo-coverage-type transnational
                country tag representative-group entity is-member]} filters
        pagination (when (and (not count-only?)
                              limit page)
                     (format "LIMIT %d OFFSET %d" limit (* limit page)))
        order-by (when order-by
                   (format "ORDER BY %s %s" order-by (if descending
                                                       "DESC"
                                                       "ASC")))
        tags-join (when (seq tag)
                    "JOIN json_array_elements(tags) ts ON TRUE
                     JOIN json_each_text(ts) t ON LOWER(t.value) = ANY (ARRAY[:v*:filters.tag]::VARCHAR[]) AND LOWER(t.value) IS NOT NULL")
        where-cond (cond-> "WHERE review_status = 'APPROVED'"
                     (seq search-text)
                     (str " AND search_text ILIKE '%" (str/lower-case search-text) "%'")

                     (seq affiliation)
                     (str " AND (affiliation->>'id')::int IN (:v*:filters.affiliation)")

                     (seq geo-coverage-type)
                     (str " AND geo_coverage_type = ANY(ARRAY[:v*:filters.geo-coverage-type]::geo_coverage_type[])")

                     (seq country)
                     (str " AND country IN (:v*:filters.country)")

                     (seq transnational)
                     (str " AND (SELECT COUNT(*) FROM json_array_elements_text(geo_coverage_values) WHERE value::INT IN (:v*:filters.country)) > 0")

                     (seq representative-group)
                     (str " AND representative_group IN (:v*:filters.representative-group)")

                     (seq network-type)
                     (str " AND type IN (:v*:filters.network-type)")

                     (seq entity)
                     (str " AND id IN (:v*:filters.entity)")

                     (some? is-member)
                     (str " AND is_member IS " is-member))]

    (if (:count-only? params)
      (format "SELECT cm.type AS network_type, COUNT(cm.*)
               FROM community_members cm
               %s
               %s
               GROUP BY type
               UNION ALL
               SELECT 'gpml_member_entities' AS network_type, COUNT(*)
               FROM community_members
               WHERE review_status = 'APPROVED' AND is_member IS TRUE;" (or tags-join "") where-cond)
      (format "SELECT
                 cm.id,
                 cm.name,
                 cm.type,
                 cm.country,
                 cm.geo_coverage_type,
                 cm.picture_id,
                 cm.created,
                 cm.affiliation,
                 cm.representative_group,
                 cm.review_status,
                 cm.is_member,
                 cm.job_title,
                 cm.files,
                 cm.assigned_badges
               FROM community_members cm
               %s
               %s
               %s
               %s;" (or tags-join "") where-cond (or order-by "") (or pagination "")))))
