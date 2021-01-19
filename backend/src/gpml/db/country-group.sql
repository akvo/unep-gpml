-- :name new-country-group :!
-- :doc Insert new country group
insert into country_group (name, type)
values(:name, :type::country_group_type)
