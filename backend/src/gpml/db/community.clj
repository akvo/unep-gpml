(ns gpml.db.community
  (:require [hugsql.core :as hugsql]))

(declare get-community-members)

(hugsql/def-db-fns "gpml/db/community.sql")

(defn get-community-members-query-and-filters
  [params]
  (let [{:keys [count-only? limit offset filters]} params
        {:keys [search-text network-type affiliation geo-coverage-type country tag representative-group]} filters
        pagination (when (and (not count-only?)
                              limit offset)
                     (format "LIMIT %d OFFSET %d" limit (* limit offset)))
        tags-join (when (seq tag)
                    "JOIN json_array_elements(tags) ts ON TRUE
                     JOIN json_each_text(ts) t ON LOWER(t.value) = ANY (ARRAY[:v*:filters.tag]::VARCHAR[]) AND LOWER(t.value) IS NOT NULL")
        where-cond (cond-> "WHERE review_status = 'APPROVED'"
                     (seq search-text)
                     (str " AND search_text @@ to_tsquery(:filters.search-text)")

                     (seq affiliation)
                     (str " AND (affiliation->>'id')::int IN (:v*:filters.affiliation)")

                     (seq geo-coverage-type)
                     (str " AND geo_coverage_type = ANY(ARRAY[:v*:filters.geo-coverage-type]::geo_coverage_type[])")

                     (seq country)
                     (str " AND country IN (:v*:filters.country)")

                     (seq representative-group)
                     (str " AND representative_group IN (:v*:filters.representative-group)")

                     (seq network-type)
                     (str " AND type IN (:v*:filters.network-type)"))]

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
      (format "SELECT cm.*
               FROM community_members cm
               %s
               %s
               %s;" (or tags-join "") where-cond (or pagination "")))))
