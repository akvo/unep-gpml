-- :name create-badge* :returning-execute :one
-- :doc Create new badge
insert into badge (:i*:insert-cols)
values :t*:insert-values returning id;

-- :name delete-badge* :execute :affected
DELETE FROM badge
WHERE id = :id;

-- :name get-badge-by-id-or-name* :query :one
-- :doc Get a Badge by its unique name or its id
select * from badge
--~ (if (contains? params :id) " WHERE id = :id" " WHERE name = :name")

-- :name add-badge-assignment* :execute :affected
INSERT INTO :i:badge-assignment-table(badge_id, :i:badge-assignment-entity-col, assigned_by)
VALUES (:badge-id, :badge-assignment-entity-id, :assigned-by);

-- :name remove-badge-assignment* :execute :affected
DELETE FROM :i:badge-assignment-table
WHERE badge_id = :badge-id
      AND :i:badge-assignment-entity-col = :badge-assignment-entity-id;