-- :name new-initiative :returning-execute :one
-- :doc Insert a new initiative
-- :require [gpml.util.sql]
INSERT INTO initiative(
--~ (#'gpml.util.sql/generate-insert params)
) VALUES (
--~ (#'gpml.util.sql/generate-jsonb params)
) returning id;

-- :name initiative-by-id :query :one
SELECT i.*, COALESCE(json_agg(acs.stakeholder) FILTER (WHERE acs.stakeholder IS NOT NULL), '[]') as owners
FROM initiative i
LEFT JOIN stakeholder_initiative acs ON acs.initiative = i.id AND association = 'owner'
WHERE i.id = :id
GROUP BY i.id;

-- :name delete-initiative-geo-coverage :execute :affected
-- :doc Remove specified countries or country groups from an initiative
DELETE FROM initiative_geo_coverage WHERE initiative=:id;

-- :name add-initiative-tags :returning-execute :one
-- :doc add initiative tags
INSERT INTO initiative_tag(initiative, tag)
VALUES :t*:tags RETURNING id;

-- :name create-initiatives
-- :doc Creates multiple initiatives.
INSERT INTO initiative(:i*:insert-cols)
VALUES :t*:insert-values RETURNING *;

-- :name get-initiatives :query :many
-- :doc Get initiatives. Accepts optional filters.
SELECT *
FROM initiative
WHERE 1=1
--~(when (seq (get-in params [:filters :brs-api-ids])) " AND brs_api_id IN (:v*:filters.brs-api-ids)")
--~(when (seq (get-in params [:filters :ids])) " AND id IN (:v*:filters.ids)")

-- :name update-initiative :execute :affected
UPDATE initiative
SET
/*~
(str/join ","
  (for [[field _] (:updates params)]
    (str (identifier-param-quote (name field) options)
      " = :updates." (name field))))
~*/
WHERE id = :id;
