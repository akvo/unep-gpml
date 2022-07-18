-- :name delete-resource-geo-coverage :execute :affected
-- :doc Deletes all the geo_coverage records related to a specific resource type and id
DELETE FROM :i:table WHERE :i:resource-col = :resource-id;

-- :name create-resource-geo-coverage :returning-execute :many
-- :doc Creates new geo-coverage records for a given resource table
INSERT INTO :i:table (:i:resource-col, country_group, country)
VALUES :t*:geo-coverage RETURNING *;
