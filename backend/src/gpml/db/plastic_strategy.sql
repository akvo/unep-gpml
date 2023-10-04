-- :name get-plastic-strategies* :query :many
-- :doc Get plastic strategies and their steps as a flat JSON list.
SELECT ps.id, ps.steps, ps.created_at, ps.last_updated_at,
json_build_object('id', c.id,
		  'name', c.name,
		  'iso_code_a3', c.iso_code_a3,
		  'iso_code_a2', c.iso_code_a2,
		  'territory', c.territory,
		  'description', c.description,
		  'headequarter', c.headquarter) AS country
FROM plastic_strategy ps
INNER JOIN country c ON c.id = country_id
WHERE 1=1
--~(when (seq (get-in params [:filters :ids])) " AND ps.id IN (:v*:filters.ids)")
--~(when (seq (get-in params [:filters :countries-ids])) " AND ps.country_id IN (:v*:filters.countries-ids)")
--~(when (seq (get-in params [:filters :countries-iso-codes-a2])) " AND c.iso_code_a2 IN (:v*:filters.countries-iso-codes-a2)")
--~(when (seq (get-in params [:filters :c>ountries-iso-codes-a3])) " AND c.iso_code_a3 IN (:v*:filters.countries-iso-codes-a3)")
--~(when (seq (get-in params [:filters :countries-names])) " AND LOWER(c.name) IN (:v*:filters.countries-names)")
GROUP BY ps.id, c.id;

-- :name update-plastic-strategy* :execute :affected
-- :doc Update the plastic strategy step completion status. Other properties are static.
UPDATE plastic_strategy
SET steps = :updates.steps::JSONB, last_updated_at = now()
WHERE id = :id;
