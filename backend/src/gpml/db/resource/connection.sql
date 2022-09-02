-- :name get-resource-stakeholder-connections
-- :doc Get stakeholder connections to a specific resource type and id
SELECT sc.id, sc.association AS role, s.id AS stakeholder_id, concat_ws(' ', s.first_name, s.last_name) AS stakeholder, s.picture AS image, s.role AS stakeholder_role, s.country, s.job_title,json_agg(json_build_object('id', t.id, 'tag', t.tag, 'tag_relation_category', st.tag_relation_category)) AS tags
FROM stakeholder_:i:resource-type sc
JOIN stakeholder s
ON sc.stakeholder = s.id
LEFT JOIN stakeholder_tag st ON st.stakeholder = s.id
LEFT JOIN tag t ON t.id = st.tag
WHERE sc.:i:resource-type = :resource-id
GROUP BY sc.id, s.id

-- :name get-resource-entity-connections
-- :doc Get entity connections to a specific resource type and id
SELECT oc.id, oc.association AS role, o.id AS entity_id, o.name AS entity, o.logo AS image
FROM organisation_:i:resource-type oc
JOIN organisation o
ON oc.organisation = o.id
WHERE oc.:i:resource-type = :resource-id
