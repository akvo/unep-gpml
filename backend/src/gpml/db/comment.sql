-- :name create-comment :i! :raw
-- :doc Create a new comment record
INSERT INTO comment(id, author_id, parent_id, resource_id, resource_type, updated_at, title, content)
VALUES (
:id,
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
:content);

-- :name update-comment :! :n
UPDATE comment
SET updated_at = :updated-at
--~(when (seq (:title params)) ", title = :title")
--~(when (seq (:content params)) ", content = :content")
WHERE id = :id;

-- :name get-resource-comments :? :*
-- :doc Get all the comments for a resource
SELECT c.*, s.picture AS author_picture
FROM comment c
JOIN stakeholder s ON c.author_id = s.id
WHERE 1=1
--~(when (:id params) " AND c.id = :id")
--~(when (:author-id params) " AND c.author_id = :author-id")
--~(when (:resource-id params) " AND c.resource_id = :resource-id")
--~(when (:resource-type params) " AND c.resource_type = :resource-type::resource_type")

-- :name delete-comment :! :n
-- :doc Deletes a comment
DELETE FROM comment
WHERE id = :id;
