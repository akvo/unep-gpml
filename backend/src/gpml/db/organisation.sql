-- :name all-organisation :? :*
-- :doc Get all organisations
select id, name from organisation order by id

-- :name organisation-by-id :? :1
-- :doc Get organisation by id
select * from organisation where id = :id

-- :name organisation-by-name :? :1
-- :doc Get organisation by name
select id from organisation where lower(name) = lower(:name)

-- :name organisation-by-names :? :*
-- :doc Get organisation by names
select * from organisation where name in (:v*:names)


-- :name new-organisation :<! :1
insert into organisation (
    name
--~ (when (contains? params :type) ", type")
--~ (when (contains? params :country) ", country")
--~ (when (contains? params :country_group) ", country_group")
--~ (when (contains? params :url) ", url")
)
values (
    :name
--~ (when (contains? params :type) ", :type")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :country_group) ", :country_group::integer")
--~ (when (contains? params :url) ", :url")
) returning id;
