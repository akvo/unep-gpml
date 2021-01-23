-- :name filter-topic :? :*
-- :doc Filter topic by type, geo_coverage and search string
SELECT DISTINCT ON (topic, (json->>'id')::int) topic, geo_coverage_iso_code, json
  FROM v_topic
 WHERE 1=1
--~ (when (seq (:search-text params)) "AND search_text @@ to_tsquery(:search-text)")
--~ (when (seq (:geo-coverage params)) "AND geo_coverage_iso_code IN (:v*:geo-coverage)")
--~ (when (seq (:topic params)) "AND topic IN (:v*:topic)")
ORDER BY topic, (json->>'id')::int, (json->>'created')::timestamptz
--~ (when-not (or (seq (:geo-coverage params)) (seq (:search-text params))) "LIMIT 50")
