-- :name all-organisation :? :*
-- :doc Get all organisations
select id, name from organisation order by id

-- :name organisation-by-id :? :1
-- :doc Get organisation by id
select o.id, o.name, o.type, o.geo_coverage_type, c.iso_code as country
from organisation o
left join country c on o.country = c.id
where o.id = :id;

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
--~ (when (contains? params :geo_coverage_type) ", geo_coverage_type")
--~ (when (contains? params :url) ", url")
)
values (
    :name
--~ (when (contains? params :type) ", :type")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :geo_coverage_type) ", :geo_coverage_type::geo_coverage_type")
--~ (when (contains? params :url) ", :url")
) returning id;

-- :name geo-coverage :? :*
-- :doc Get geo coverage by organisation id
select cg.id, c.iso_code, cg.name from organisation_geo_coverage o
left join country c on c.id = o.country
left join country_group cg on cg.id = o.country_group
where o.organisation = :id
