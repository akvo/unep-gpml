-- :name get-resource :query :one
-- :doc Get resource's details given it's id. FIXME: add filters
SELECT *
FROM :i:table-name
WHERE id = :id::integer

-- :name delete-resource* :execute :affected
DELETE FROM :i:table-name
WHERE id = :id;
