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

-- :snip all-organisation-resource-owner-associations-query
SELECT organisation, 'event' AS resource_type, event AS resource_id
FROM organisation_event
WHERE organisation = :org-id AND association = 'owner'
UNION
SELECT organisation, 'policy' AS resource_type, policy AS resource_id
FROM organisation_policy
WHERE organisation = :org-id AND association = 'owner'
UNION
SELECT organisation, 'technology' AS resource_type, technology AS resource_id
FROM organisation_technology
WHERE organisation = :org-id AND association = 'owner'
UNION
SELECT organisation, 'resource' AS resource_type, resource AS resource_id
FROM organisation_resource
WHERE organisation = :org-id AND association = 'owner'
UNION
SELECT organisation, 'initiative' AS resource_type, initiative AS resource_id
FROM organisation_initiative
WHERE organisation = :org-id AND association = 'owner'
UNION
SELECT organisation, 'case_study' AS resource_type, case_study AS resource_id
FROM organisation_case_study
WHERE organisation = :org-id AND association = 'owner'

-- :name get-sth-org-focal-point-resources-associations :query :many
-- :doc Get the associations of a organisation given focal-point stakeholder association
WITH org_associations AS (
  :snip:all-organisation-resource-owner-associations-query
)
SELECT so.stakeholder AS stakeholder_id, oacs.resource_id, oacs.resource_type
FROM stakeholder_organisation so
INNER JOIN org_associations oacs ON so.organisation = oacs.organisation
WHERE so.stakeholder = :sth-id AND so.association = 'focal-point';

-- :name get-all-organisation-owner-associations :query :many
WITH org_associations AS (
  :snip:all-organisation-resource-owner-associations-query
)
SELECT * FROM org_associations;

-- :name get-orgs-focal-points-associations-on-resource :query :many
SELECT so.*, so.association as role
FROM stakeholder_organisation so
INNER JOIN :i:org-resource-table ort ON so.organisation = ort.organisation
WHERE so.organisation IN (:v*:orgs-ids)
AND so.association = 'focal-point'
AND ort.association = 'owner'
--~ (format "AND ort.%s = %d" (:org-resource-col params) (:org-resource-id params))
;
