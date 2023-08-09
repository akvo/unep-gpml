-- :name create-file* :execute :affected
INSERT INTO file(id, object_key, name, alt_desc, type, extension, visibility)
VALUES (:id, :object_key, :name, :alt_desc, :type, :extension, :visibility::FILE_VISIBILITY);

-- :name delete-file* :execute :affected
DELETE FROM file
WHERE id = :id;

-- :name get-files* :query :many
SELECT *
FROM file
WHERE 1=1
--~ (when (get-in params [:filters :id]) " AND id = :filters.id")
--~ (when (get-in params [:filters :ids]) " AND id IN (:v*:filters.ids)")
--~ (when (get-in params [:filters :visibilities]) " AND visibility = ANY(CAST(ARRAY[:v*:filters.visibilities] AS FILE_VISIBILITY[]))")
