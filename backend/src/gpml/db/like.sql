-- :name create-like :!
-- :doc Creates a new like for a given resource
-- :require [gpml.db.like]
INSERT INTO
--~ (#'gpml.db.like/generate-sql-into params)
VALUES (:resource-id, :stakeholder-id)

-- :name delete-like :!
-- :doc Deletes a like for a given resource
DELETE
FROM
--~ (#'gpml.db.like/generate-table-like params)
WHERE
--~ (#'gpml.db.like/generate-delete-where params)


-- :name get-likes :*
-- :doc Get likes data for a given resource
WITH stakeholder AS (
  SELECT
    s.id,
    s.picture,
    s.first_name,
    s.last_name,
    s.picture_id,
    f.object_key,
    f.visibility
  FROM
    stakeholder s
    LEFT JOIN file f ON s.picture_id = f.id
)
SELECT
  s.*
FROM
--~ (#'gpml.db.like/generate-table-like params)
  l,
  stakeholder s
WHERE l.stakeholder_id = s.id
--~ (#'gpml.db.like/generate-select-where params)
ORDER BY l.created ASC
