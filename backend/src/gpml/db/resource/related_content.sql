-- :name create-related-contents :execute :affected
INSERT INTO related_content(:i*:insert-cols)
VALUES :t*:insert-values;

-- :name get-related-contents :query :many
-- :doc Gets the related content for a specific resource type and id
SELECT * FROM get_related_content(:resource-table-name::regclass, :resource-id::integer);

-- :name delete-related-contents :execute :affected
-- :doc Deletes the related contents for a specific resource type and id
DELETE FROM related_content
WHERE resource_id = :resource-id::integer AND resource_table_name = :resource-table-name::regclass;
