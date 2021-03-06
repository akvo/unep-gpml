-- :name new-country-group :! :1
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
)

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
