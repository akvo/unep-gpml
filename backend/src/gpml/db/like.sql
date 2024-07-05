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
--~ (#'gpml.db.like/generate-delete-from params)
WHERE
--~ (#'gpml.db.like/generate-delete-where params)
