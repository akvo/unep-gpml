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
--~ (#'gpml.db.like/generate-table-like params)
WHERE
--~ (#'gpml.db.like/generate-delete-where params)


-- :name get-stakeholders :*
-- :doc Get stakeholder data for a given resource
WITH stakeholder AS (
  SELECT
    s.id,
    s.picture,
    s.first_name,
    s.last_name,
    s.picture_id,
    f.object_key,
    f.visibility
  FROM
    stakeholder s
    LEFT JOIN file f ON s.picture_id = f.id
)
SELECT
  s.*
FROM
--~ (#'gpml.db.like/generate-table-like params)
  l,
  stakeholder s
WHERE l.stakeholder_id = s.id
--~ (#'gpml.db.like/generate-select-where params)
ORDER BY l.created ASC

-- :name get-likes :*
-- :doc Get likes for a given stakeholder
SELECT id, 'event' AS type, title FROM event e, event_like l WHERE e.id = l.event_id AND l.stakeholder_id = :stakeholder-id
UNION ALL
SELECT id, 'technology' AS type, name AS title FROM technology t, technology_like l WHERE t.id = l.technology_id AND l.stakeholder_id = :stakeholder-id
UNION ALL
SELECT id, 'policy' AS type, title FROM policy p, policy_like l WHERE p.id = l.policy_id AND l.stakeholder_id = :stakeholder-id
UNION ALL
SELECT id, 'initiative' AS type, btrim((q2)::text, '\"'::text) AS title FROM initiative i, initiative_like l WHERE i.id = l.initiative_id AND l.stakeholder_id = :stakeholder-id
UNION ALL
SELECT id, regexp_replace(lower(type), ' ','_') as type, title FROM resource r, resource_like l WHERE r.id = l.resource_id AND l.stakeholder_id = :stakeholder-id
UNION ALL
SELECT id, 'case_study', title FROM case_study c, case_study_like l WHERE c.id = l.case_study_id AND l.stakeholder_id = :stakeholder-id
