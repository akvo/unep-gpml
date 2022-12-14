-- :name new-country-group :? :1
-- :doc Insert new country group
insert into country_group (
    name,
    type
--~ (when (contains? params :id) ", id")
)
values(
    :name,
    :v:type::country_group_type
--~ (when (contains? params :id) ", :id")
) RETURNING id;

-- :name all-country-groups :? :*
-- :doc Get all country groups
SELECT cg.*, json_agg(json_build_object('id', c.id, 'name', c.name)) AS countries
FROM country_group cg
JOIN country_group_country cgc
ON cgc.country_group = cg.id
JOIN country c
ON cgc.country_group = cg.id
AND cgc.country = c.id
GROUP BY cg.id
ORDER BY name;

-- :name country-group-detail :? :*
-- :doc Get country of country group
SELECT cg.*, json_agg(json_build_object('id', c.id, 'name', c.name)) AS countries
FROM country_group cg
JOIN country_group_country cgc
ON cgc.country_group = cg.id
JOIN country c
ON cgc.country_group = cg.id
AND cgc.country = c.id
WHERE cg.id = :id
GROUP BY cg.id
ORDER BY name;

-- :name country-group-by-name :? :1
-- :doc Get country group by name
select * from country_group where name = :name

-- :name country-group-by-names :? :*
-- :doc Get country group by names
select * from country_group where name in (:v*:names)

-- :name country-group-by-id :? :1
-- :doc Get country group by id
select * from country_group where id = :id

-- :name get-country-groups-by-type :query :many
-- :doc Get country groups by type
select * from country_group where type = :type

-- :name new-country-group-country :! :1
-- :doc Insert new country group <-> country
insert into country_group_country (country_group, country)
values(:country_group, :country)

-- :name get-country-groups-countries :query :many
-- :doc Get country groups countries by country groups ids.
SELECT cgc.country AS id
FROM country_group_country cgc
LEFT JOIN country_group cg ON cgc.country_group = cg.id
WHERE cg.id IN (:v*:filters.country-groups)

-- :name get-country-groups-by-countries
-- :doc Get country-group countries by countries ids.
SELECT cg.id, cg.name
FROM country_group cg
LEFT JOIN country_group_country cgc ON cgc.country_group= cg.id
WHERE cgc.country IN (:v*:filters.countries-ids);

-- :name get-country-groups :query :many
-- :doc Get countries applying optional filters.
SELECT *
FROM country_group
WHERE 1=1
--~(when (seq (get-in params [:filters :names])) " AND name IN (:v*:filters.names)")
--~(when (seq (get-in params [:filters :ids])) " AND id IN (:v*:filters.ids)")
--~(when (seq (get-in params [:filters :types])) " AND type IN (:v*:filters.types)")
ORDER BY id;
