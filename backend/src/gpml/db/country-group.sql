-- :name new-country-group :!
-- :doc Insert new country group
insert into country_group (name, type)
values(:name, :type::country_group_type)

-- :name country-group-by-name :? :1
-- :doc Get country group by name
select * from country_group where name = :name
