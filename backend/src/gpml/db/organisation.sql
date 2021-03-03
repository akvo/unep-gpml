-- :name all-organisation :? :*
-- :doc Get all organisations
select id, name from organisation order by id

-- :name organisation-by-id :? :1
-- :doc Get organisation by id
select o.id, o.name, o.url, o.type, o.geo_coverage_type, c.iso_code as country
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
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :type) ", type")
--~ (when (contains? params :country) ", country")
--~ (when (contains? params :geo_coverage_type) ", geo_coverage_type")
--~ (when (contains? params :url) ", url")
--~ (when (contains? params :program) ", program")
--~ (when (contains? params :contribution) ", contribution")
--~ (when (contains? params :expertise) ", expertise")
--~ (when (contains? params :review_status) ", review_status")
)
values (
    :name
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :type) ", :type")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :geo_coverage_type) ", :geo_coverage_type::geo_coverage_type")
--~ (when (contains? params :url) ", :url")
--~ (when (contains? params :program) ", :program")
--~ (when (contains? params :contribution) ", :contribution")
--~ (when (contains? params :expertise) ", :expertise")
--~ (when (contains? params :review_status) ", :v:review_status::review_status")
) returning id;

-- :name update-organisation :! :n
-- :doc Update organisation column
update organisation set
--~ (when (contains? params :url) ",url= :url")
--~ (when (contains? params :type) ",type= :type")
--~ (when (contains? params :country) ",geo_coverage_type= :country")
--~ (when (contains? params :geo_coverage_type) ",geo_coverage_type= :geo_coverage_type")
where id = :id

-- :name geo-coverage :? :*
-- :doc Get geo coverage by organisation id
select cg.id, c.iso_code, cg.name from organisation_geo_coverage o
left join country c on c.id = o.country
left join country_group cg on cg.id = o.country_group
where o.organisation = :id

-- :name add-geo-coverage :<! :1
-- :doc add organisation geo coverage
insert into organisation_geo_coverage(organisation, country_group, country)
values :t*:geo RETURNING id;

-- :name delete-geo-coverage :! :n
-- :doc remove geo coverage
delete from organisation_geo_coverage where organisation = :id
