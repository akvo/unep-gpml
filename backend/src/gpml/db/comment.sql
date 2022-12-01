-- :name create-comment :returning-execute :one
-- :doc Create a new comment record
INSERT INTO comment(author_id, parent_id, resource_id, resource_type, updated_at, title, content)
VALUES (
:author-id,
/*~(if (:parent-id params) */
:parent-id,
/*~*/
NULL,
/*~ ) ~*/
:resource-id,
:resource-type::resource_type,
:updated-at,
/*~(if (seq (:title params)) */
:title,
/*~*/
NULL,
/*~ ) ~*/
:content) RETURNING *;

-- :name update-comment :execute :affected
UPDATE comment
SET updated_at = :updated-at
--~(when (seq (:title params)) ", title = :title")
--~(when (seq (:content params)) ", content = :content")
WHERE id = :id;

-- :name get-resource-comments :query :many
-- :doc Get all the comments for a resource
SELECT
    c.*,
    s.picture AS author_picture,
    concat_ws(' ', s.first_name, s.last_name) AS author_name
FROM
    comment c
    JOIN stakeholder s ON c.author_id = s.id
WHERE
    1 = 1
--~(when (:id params) " AND c.id = :id")
--~(when (:author-id params) " AND c.author_id = :author-id")
--~(when (:resource-id params) " AND c.resource_id = :resource-id")
--~(when (:resource-type params) " AND c.resource_type = :resource-type::resource_type")

-- :name delete-comment :execute :affected
-- :doc Deletes a comment
DELETE FROM comment
WHERE id = :id;
