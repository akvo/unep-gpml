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

-- :name country-group-by-ids :? :*
-- :doc Get country group by names
select names from country_group where name in (:v*:ids)

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

-- :name get-country-groups-by-country :? :*
-- :doc get country groups by country-id
select country_group.id, country_group.name from country_group
left join country_group_country on country_group_country.country_group= country_group.id
where country_group_country.country= :id

-- :name get-country-group-countries :? :*
-- :doc get country group countries by country group id
select cgc.country as id from country_group_country cgc
left join country_group cg on cgc.country_group = cg.id
where cg.id = :id
