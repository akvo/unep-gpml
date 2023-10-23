-- :name create-badge* :returning-execute :one
-- :doc Create new badge
insert into badge (:i*:insert-cols)
values :t*:insert-values returning id;

-- :name delete-badge* :execute :affected
DELETE FROM badge
WHERE id = :id;