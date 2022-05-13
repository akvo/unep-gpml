-- :name get-resources
-- :doc Get the list of resources in the platform.
-- :require [gpml.db.resource.list]
WITH platform_resources AS (
--~(#'gpml.db.resource.list/generate-get-resources-query)
)
SELECT id, title
FROM platform_resources
--~(when (seq (get-in params [:filters :search-text])) " WHERE search_text @@ to_tsquery(:filters.search-text) ")
--~(if (:limit params) "LIMIT :limit" (str "LIMIT " gpml.db.resource.list/default-limit))
