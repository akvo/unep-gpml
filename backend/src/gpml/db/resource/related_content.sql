-- :name create-related-contents :insert :affected
INSERT INTO related_content(resource_id, resource_table_name, related_resource_id, related_resource_table_name)
VALUES :t*:related-contents;

-- :name get-related-contents :query :many
-- :doc Gets the related content for a specific resource type and id
SELECT * FROM get_related_content(:resource-table-name::regclass, :resource-id::integer);

-- :name delete-related-contents :execute :affected
-- :doc Deletes the related contents for a specific resource type and id
DELETE FROM related_content
WHERE resource_id = :resource-id::integer AND resource_table_name = :resource-table-name::regclass;
