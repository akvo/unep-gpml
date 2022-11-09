-- :name delete-resource-geo-coverage :execute :affected
-- :doc Deletes all the geo_coverage records related to a specific resource type and id
DELETE FROM :i:table WHERE :i:resource-col = :resource-id;

-- :name create-resource-geo-coverage :returning-execute :many
-- :doc Creates new geo-coverage records for a given resource table
INSERT INTO :i:table(:i*:insert-cols)
VALUES :t*:insert-values RETURNING *;

-- :name get-resource-geo-coverage :query :many
-- :doc Get geo coverage optionally applying filters.
SELECT *
FROM :i:table
WHERE 1=1
--~(when (seq (get-in params [:filters :resources-ids])) " AND :i:resource-col IN (:v*:filters.resources-ids)")
--~(when (seq (get-in params [:filters :countries-ids])) " AND country IN (:v*:filters.countries-ids)")N
--~(when (seq (get-in params [:filters :country-groups-ids])) " AND country_group IN (:v*:filters.country-groups-ids)")
;

-- :name get-resource-country-state :query :many
-- :doc Get resource country states.
SELECT *
FROM :i:table
WHERE 1=1
--~(when (seq (get-in params [:filters :resources-ids])) " AND :i:resource-col IN (:v*:filters.resources-ids)")
--~(when (seq (get-in params [:filters :countries-states-ids])) " AND country_state_id IN (:v*:filters.countries-states-ids)")
;
