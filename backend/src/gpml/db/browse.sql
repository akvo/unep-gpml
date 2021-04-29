-- :name filter-topic :? :*
-- :doc Filter topic by type, geo_coverage and search string
SELECT DISTINCT ON (t.topic, (COALESCE(t.json->>'start_date', t.json->>'created'))::timestamptz, (t.json->>'id')::int) t.topic, t.geo_coverage_iso_code, t.json
  FROM v_topic t
--~ (when (and (:favorites params) (:user params) (:resource-types params)) "JOIN v_stakeholder_association a ON a.stakeholder = :user AND a.id = (t.json->>'id')::int AND (a.topic = t.topic OR (a.topic = 'resource' AND t.topic IN (:v*:resource-types)))")
 WHERE 1=1
--~ (when (seq (:search-text params)) "AND t.search_text @@ to_tsquery(:search-text)")
--~ (when (seq (:geo-coverage params)) "AND t.geo_coverage_iso_code IN (:v*:geo-coverage)")
--~ (when (seq (:topic params)) "AND t.topic IN (:v*:topic)")
ORDER BY (COALESCE(t.json->>'start_date', t.json->>'created'))::timestamptz DESC, (t.json->>'id')::int DESC
--~ (format "LIMIT %s" (or (and (contains? params :limit) (:limit params)) 50))
--~ (format "OFFSET %s" (or (and (contains? params :offset) (:offset params)) 0))
