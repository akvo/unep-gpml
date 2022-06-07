-- :name get-resource-stakeholder-connections
-- :doc Get stakeholder connections to a specific resource type and id
SELECT sc.id, sc.association AS role, s.id AS stakeholder_id, concat_ws(' ', s.first_name, s.last_name) AS stakeholder, s.picture AS image, s.role AS stakeholder_role
FROM stakeholder_:i:resource-type sc
JOIN stakeholder s
ON sc.stakeholder = s.id
WHERE sc.:i:resource-type = :resource-id
-- TODO: remove the following line once we refactor association and
-- favorites schema.
AND sc.is_bookmark IS FALSE;

-- :name get-resource-entity-connections
-- :doc Get entity connections to a specific resource type and id
SELECT oc.id, oc.association AS role, o.id AS entity_id, o.name AS entity, o.logo AS image
FROM organisation_:i:resource-type oc
JOIN organisation o
ON oc.organisation = o.id
WHERE oc.:i:resource-type = :resource-id
