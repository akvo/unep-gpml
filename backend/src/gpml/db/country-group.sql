-- :name new-country-group :!
-- :doc Insert new country group
insert into country_group (name, type)
values(:name, :v:type::country_group_type)

-- :name country-group-by-name :? :1
-- :doc Get country group by name
select * from country_group where name = :name

-- :name country-group-by-names :? :*
-- :doc Get country group by names
select * from country_group where name in (:v*:names)

-- :name new-country-group-country :!
-- :doc Insert new country group <-> country
insert into country_group_country (country_group, country)
values(:country_group, :country)
