-- :name new-country-group :! :1
-- :doc Insert new country group
insert into country_group (name, type)
values(:name, :v:type::country_group_type)

-- :name country-group-by-name :? :1
-- :doc Get country group by name
select * from country_group where name = :name

-- :name country-group-by-names :? :*
-- :doc Get country group by names
select * from country_group where name in (:v*:names)

-- :name country-group-by-ids :? :*
-- :doc Get country group by names
select names from country_group where name in (:v*:ids)

-- :name new-country-group-country :! :1
-- :doc Insert new country group <-> country
insert into country_group_country (country_group, country)
values(:country_group, :country)
