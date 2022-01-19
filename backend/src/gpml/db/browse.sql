-- :name get-topics :? :*
-- :doc Gets the list of topics. If count-only? parameter is provided, the query will only group and count the topics.
/* :require [gpml.sql-util]
            [gpml.db.browse] */
WITH
--~ (#'gpml.db.browse/generate-topic-data-ctes {} gpml.db.browse/generic-cte-opts)
,
--~ (#'gpml.db.browse/generate-topic-geo-coverage-ctes {} gpml.db.browse/generic-cte-opts)
,
--~ (#'gpml.db.browse/generate-topic-search-text-ctes {} gpml.db.browse/generic-cte-opts)
,
--~ (#'gpml.db.browse/generate-topic-ctes {} gpml.db.browse/generic-cte-opts)
,
--~ (#'gpml.db.browse/generate-topic-cte {} gpml.db.browse/generic-cte-opts)
,
cte_results AS (
--~ (#'gpml.sql-util/generate-filter-topic-snippet params)
)
--~ (#'gpml.sql-util/generate-get-topics params)
;
