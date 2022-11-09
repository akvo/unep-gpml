-- :name create-country-states :execute :affected
-- :doc bulk create country.
INSERT INTO country_state(:i*:insert-cols)
VALUES :t*:insert-values;

-- :name get-country-states :query :many
-- :doc get country states. Optionally accepts filters.
SELECT *
FROM country_state
WHERE 1=1
--~(when (seq (get-in params [:filters :names])) " AND LOWER(name) IN (:v*:filters.names)")
--~(when (seq (get-in params [:filters :codes])) " AND code IN (:v*:filters.codes)")
--~(when (seq (get-in params [:filters :types])) " AND type IN (:v*:filters.types)")
--~(when (seq (get-in params [:filters :countries_ids])) " AND country_id IN (:v*:filters.countries_ids)")
