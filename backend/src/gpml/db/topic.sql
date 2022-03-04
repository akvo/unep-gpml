-- :name get-topics :? :*
-- :doc Gets the list of topics. If count-only? parameter is set to true, the query will only group and count the topics.
-- :require [gpml.db.topic]
--~ (#'gpml.db.topic/generate-topic-query {} (if (seq (:topic params)) {:tables (:topic params)} {}))
,
cte_results AS (
--~ (#'gpml.db.topic/generate-filter-topic-snippet params)
)
--~ (#'gpml.db.topic/generate-get-topics params)
