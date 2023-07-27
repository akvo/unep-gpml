-- :name get-resource-associations :query :many
-- :doc Get the organisation association details for a specific resource.
SELECT *, association as role
FROM :i:table
WHERE :i:resource-col = :filters.resource-id
--~ (when (get-in params [:filters :entity-id]) " AND :i:entity-col = :filters.entity-id")
--~ (when (get-in params [:filters :associations]) " AND association = ANY(CAST(ARRAY[:v*:filters.associations] AS :i:resource-assoc-type[])) ")
;

-- :name delete-stakeholder-associations :execute :affected
DELETE FROM
--~ (format "stakeholder_%s" (:table-suffix params))
WHERE id IN (:v*:ids);

-- :name delete-organisation-associations :execute :affected
DELETE FROM
--~ (format "organisation_%s" (:table-suffix params))
WHERE id IN (:v*:ids);

-- :name update-stakeholder-association :execute :affected
-- :require [gpml.util.sql]
UPDATE
--~ (format "stakeholder_%s" (:table-suffix params))
SET modified=now(),
--~ (#'gpml.util.sql/generate-update-stakeholder-association params)
WHERE id = :id;

-- :name update-organisation-association :execute :affected
-- :require [gpml.util.sql]
UPDATE
--~ (format "organisation_%s" (:table-suffix params))
SET modified=now(),
--~ (#'gpml.util.sql/generate-update-stakeholder-association params)
WHERE id = :id;

-- :name create-stakeholder-association :execute :affected
INSERT INTO
--~ (format "stakeholder_%s(stakeholder, :i:resource-col, association, remarks)" (:table-suffix params))
VALUES
--~ (format "(:stakeholder, :resource-id, :association::%s_association, :remarks)" (:resource-col params))
;

-- :name create-organisation-association :execute :affected
INSERT INTO
--~ (format "organisation_%s(organisation, :i:resource-col, association, remarks)" (:table-suffix params))
VALUES
--~ (format "(:organisation, :resource-id, :association::%s_association, :remarks)" (:resource-col params))
;
