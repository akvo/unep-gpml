-- :name new-country :insert-returning :one
-- :doc Insert new country
INSERT INTO country (name, iso_code_a3, description)
VALUES(:name, :iso_code_a3, :description) returning id

-- :name add-country-headquarter :execute :affected
-- :doc Add headquarter to a given country
UPDATE country SET headquarter = :headquarter
WHERE id = :id

-- :name get-countries :query :many
-- :doc Get countries applying optional filters.
SELECT *
FROM country
WHERE iso_code_a3 IS NOT NULL AND length(trim(name)) > 0
--~(when (seq (get-in params [:filters :names])) " AND name IN (:v*:filters.names)")
--~(when (seq (get-in params [:filters :ids])) " AND id IN (:v*:filters.ids)")
--~(when (seq (get-in params [:filters :descriptions])) " AND description IN (:v*:filters.descriptions)")
--~(when (seq (get-in params [:filters :iso-codes-a2])) " AND iso_code_a2 IN (:v*:filters.iso-codes-a2)")
--~(when (seq (get-in params [:filters :iso-codes-a3])) " AND iso_code_a3 IN (:v*:filters.iso-codes-a3)")
ORDER BY id;
