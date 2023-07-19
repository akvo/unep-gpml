-- :name get-resource-associations :query :many
-- :doc Get the organisation association details for a specific resource.
SELECT *, association as role
FROM :i:table
WHERE :i:resource-col = :filters.resource-id
--~ (when (get-in params [:filters :entity-id]) " AND :i:entity-col = :filters.entity-id")
--~ (when (get-in params [:filters :associations]) " AND association = ANY(CAST(ARRAY[:v*:filters.associations] AS :i:resource-assoc-type[])) ")
