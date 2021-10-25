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

-- :name all-country-group :? :*
-- :doc Get all country groups
select * from country_group
order by name;

-- :name country-group-detail :? :*
-- :doc Get country of country group
select cg.*,
case when count(c) = 0 then '[]' else json_agg(json_build_object('id',c.id,'name',c.name)) end as countries
from country_group cg
left join (
    select c.name, c.id, cgc.country_group
    from country_group_country cgc
    left join country c on c.id = cgc.country
    where c is not null
) as c
on c.country_group = cg.id
where cg.id = :id
group by cg.id

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

-- :name new-country-group-country :! :1
-- :doc Insert new country group <-> country
insert into country_group_country (country_group, country)
values(:country_group, :country)



-- :name get-country-groups-by-country :? :*
-- :doc get country groups by country-id
select country_group.id, country_group.name from country_group
left join country_group_country on country_group_country.country_group= country_group.id
where country_group_country.country= :id
