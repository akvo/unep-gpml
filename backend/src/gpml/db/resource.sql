-- :name new-resource :<! :1
-- :doc Insert a new resource
insert into resource(
    title,
    type,
    publish_year,
    summary,
    valid_from,
    valid_to,
    geo_coverage_type
--~ (when (contains? params :country) ", country")
--~ (when (contains? params :value) ", value")
--~ (when (contains? params :value_currency) ", value_currency")
--~ (when (contains? params :value_remarks) ", value_remarks")
--~ (when (contains? params :image) ", image")
--~ (when (contains? params :attachments) ", attachments")
--~ (when (contains? params :remarks) ", remarks")
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :review_status) ", review_status")
--~ (when (contains? params :created_by) ", created_by")
)
values(
    :title,
    :type,
    :publish_year,
    :summary,
    :valid_from,
    :valid_to,
    :v:geo_coverage_type::geo_coverage_type
--~ (when (contains? params :country) ", :country")
--~ (when (contains? params :value) ", :value")
--~ (when (contains? params :value_currency) ", :value_currency")
--~ (when (contains? params :value_remarks) ", :value_remarks")
--~ (when (contains? params :image) ", :image")
--~ (when (contains? params :attachments) ", :v:attachments::jsonb")
--~ (when (contains? params :remarks) ", :remarks")
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :review_status) ", :v:review_status::review_status")
--~ (when (contains? params :created_by) ", :created_by")
)
returning id;

-- :name add-resource-tags :<! :1
-- :doc add resource tags
insert into resource_tag(resource, tag)
values :t*:tags RETURNING id;

-- :name add-resource-geo :<! :1
-- :doc add resource geo
insert into resource_geo_coverage(resource, country_group, country)
values :t*:geo RETURNING id;

-- :name add-resource-language-urls :<! :1
-- :doc Add language URLs to a resource
insert into resource_language_url(resource, language, url)
values :t*:urls RETURNING id;

-- :name add-resource-organisations :<! :1
-- :doc Add organisation to a resource
insert into resource_organisation(resource, organisation)
values :t*:organisations RETURNING id;

-- :name new-resource-image :<! :1
-- :doc Insert new resource image
insert into resource_image(image)
values(:image) returning id;

-- :name resource-by-id :? :1
select
    id,
    type as resource_type,
    title,
    summary,
    image,
    country,
    geo_coverage_type,
    geo_coverage_values as geo_coverage_value,
    publish_year,
    valid_from,
    valid_to,
    value,
    value_currency,
    value_remarks,
    remarks,
    (select json_build_object('id',o.id,'name',o.name)
        from resource_organisation ro
        left join organisation o on o.id = ro.organisation
        where ro.resource = :id
        limit 1) as org,
    (select json_agg(json_build_object('url',rlu.url, 'lang', l.iso_code))
        from resource_language_url rlu
        left join language l on l.id = rlu.language
        where rlu.resource = :id) as urls,
    (select json_agg(tag)
        from resource_tag where resource = :id) as tags,
    (select created_by
        from resource where id = :id) as created_by
from v_resource_data
where id = :id


-- :name pending-resource :? :*
-- :doc Returns the pending resources data

select
    id,
    type as resource_type,
    title,
    summary,
    image,
    country,
    geo_coverage_type,
    geo_coverage_values as geo_coverage_value,
    publish_year,
    valid_from,
    valid_to,
    value,
    value_currency,
    value_remarks,
    remarks,
    (select json_build_object('id',o.id,'name',o.name)
        from resource_organisation ro
        left join organisation o on o.id = ro.organisation
        where ro.resource = :id
        limit 1) as org,
    (select json_agg(json_build_object('url',rlu.url, 'lang', l.iso_code))
        from resource_language_url rlu
        left join language l on l.id = rlu.language
        where rlu.resource = :id) as urls,
    (select json_agg(tag)
        from resource_tag where resource = 'SUBMITTED') as tags,
    (select created_by
        from resource where id = :id) as created_by
from v_resource_data
where id = :id

-- :name resource-image-by-id :? :1
-- :doc Get resource image by id
select * from resource_image where id = :id

-- :name new-resource-image :<! :1
-- :doc Insert new resource image
insert into resource_image (image)
values(:image) returning id;
