-- :name filter-topic :? :*
-- :doc Filter topic by type, geo_coverage and search string
-- :require [gpml.sql-util]
--~ (#'gpml.sql-util/generate-filter-topic-snippet params)
-- NOTE: We deliberately use a check for nil as opposed to empty list, here. See commit message in
-- 938110757e03f60e8c5a4396ccea8bd99bcef579
--~ (when (some? (:topic params)) "AND t.topic = ANY(ARRAY[:v*:topic]::varchar[])")
ORDER BY (COALESCE(t.json->>'start_date', t.json->>'created'))::timestamptz DESC, (t.json->>'id')::int DESC
--~ (format "LIMIT %s" (or (and (contains? params :limit) (:limit params)) 50))
--~ (format "OFFSET %s" (or (and (contains? params :offset) (:offset params)) 0))

-- :name topic-counts :? :*
-- :doc Return the counts of all topics based on query params
-- :require [gpml.sql-util]
WITH results AS (
--~ (#'gpml.sql-util/generate-filter-topic-snippet params)
)
SELECT topic, COUNT(topic) FROM results
GROUP BY topic;
