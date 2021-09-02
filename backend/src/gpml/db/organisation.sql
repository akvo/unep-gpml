-- :name all-organisation :? :*
-- :doc Get all organisations
select id, name from organisation order by id

-- :name organisation-by-id :? :1
-- :doc Get organisation by id
select id, name, url, type, geo_coverage_type, country
from organisation
where id = :id;

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
--~ (when (contains? params :logo) ", logo")
--~ (when (contains? params :program) ", program")
--~ (when (contains? params :contribution) ", contribution")
--~ (when (contains? params :expertise) ", expertise")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :second_contact) ", second_contact")
--~ (when (contains? params :review_status) ", review_status")
)
values (
    :name
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :type) ", :type")
--~ (when (contains? params :country) ", :country::integer")
--~ (when (contains? params :geo_coverage_type) ", :geo_coverage_type::geo_coverage_type")
--~ (when (contains? params :url) ", :url")
--~ (when (contains? params :logo) ", :logo")
--~ (when (contains? params :program) ", :program")
--~ (when (contains? params :contribution) ", :contribution")
--~ (when (contains? params :expertise) ", :expertise")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :second_contact) ", :second_contact")
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
select id, coalesce(country, country_group) as geo_coverage_values from organisation_geo_coverage
where organisation = :id

-- :name add-geo-coverage :<! :1
-- :doc add organisation geo coverage
insert into organisation_geo_coverage(organisation, country_group, country)
values :t*:geo RETURNING id;

-- :name delete-geo-coverage :! :n
-- :doc remove geo coverage
delete from organisation_geo_coverage where organisation = :id


-- :name organisation-tags :? :*
-- :doc get organisation tags
select json_agg(st.tag) as tags, tc.category from organisation_tag st
left join tag t on t.id = st.tag
left join tag_category tc on t.tag_category = tc.id
where st.organisation = :id
group by tc.category;

-- :name add-organisation-tags :<! :1
-- :doc add organisation tags
insert into organisation_tag(organisation, tag)
values :t*:tags RETURNING id;

-- :name delete-organisation-tags :! :n
-- :doc remove organisation-tags
delete from organisation_tag where organisation = :id
