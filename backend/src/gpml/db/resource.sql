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
--~ (when (contains? params :url) ", url")
--~ (when (contains? params :info_docs) ", info_docs")
--~ (when (contains? params :sub_content_type) ", sub_content_type")
--~ (when (contains? params :first_publication_date) ", first_publication_date")
--~ (when (contains? params :latest_amendment_date) ", latest_amendment_date")
--~ (when (contains? params :related_content) ", related_content")
--~ (when (contains? params :capacity_building) ", capacity_building")
--~ (when (contains? params :subnational_city) ", subnational_city")
--~ (when (contains? params :document_preview) ", document_preview")
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
--~ (when (contains? params :url) ", :url")
--~ (when (contains? params :info_docs) ", :info_docs")
--~ (when (contains? params :sub_content_type) ", :sub_content_type")
--~ (when (contains? params :first_publication_date) ", :first_publication_date")
--~ (when (contains? params :latest_amendment_date) ", :latest_amendment_date")
--~ (when (contains? params :related_content) ", :related_content")
--~ (when (contains? params :capacity_building) ", :capacity_building")
--~ (when (contains? params :subnational_city) ", :subnational_city")
--~ (when (contains? params :document_preview) ", :document_preview")
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
    publish_year,
    valid_from,
    valid_to,
    value,
    value_currency,
    value_remarks,
    remarks,
    url,
    created_by,
    document_preview,
    (select json_agg(json_build_object('url',rlu.url, 'lang', l.iso_code))
        from resource_language_url rlu
        left join language l on l.id = rlu.language
        where rlu.resource = :id) as urls,
    (select json_agg(coalesce(country, country_group))
        from resource_geo_coverage where resource = :id) as geo_coverage_value,
    (select json_agg(tag)
        from resource_tag where resource = :id) as tags
from resource r
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
    document_preview,
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

-- :name entity-connections-by-id
-- :doc Get entity connections by id
select orgrsc.id, orgrsc.association as role, org.id as entity_id, org.name as entity, org.logo as image
 from organisation_resource orgrsc
 left join organisation org
 on orgrsc.organisation = org.id
 where orgrsc.resource = :id

-- :name stakeholder-connections-by-id
-- :doc Get stakeholder connections by id
select sr.id, sr.association as role, s.id as stakeholder_id, concat_ws(' ', s.first_name, s.last_name) as stakeholder,
 s.picture as image, s.role as stakeholder_role
  from stakeholder_resource sr
  left join stakeholder s
  on sr.stakeholder = s.id
  where sr.resource = :id
  and sr.is_bookmark = false;

-- :name all-resources
-- :doc List all resources
select id, title
  from resource;

-- :name all-technical-resources
-- :doc List all technical resources
select id, title
  from resource
  where type = 'Technical Resource';

-- :name all-financing-resources
-- :doc List all financing resources
select id, title
  from resource
  where type = 'Financing Resource';

-- :name all-action-plans
-- :doc List all action plans
select id, title
  from resource
  where type = 'Action Plan';

-- :name related-content-by-id
-- :doc Get related content by id
select res.id, res.title, res.summary as description from resource r
  left join resource res
  on res.id = ANY(r.related_content)
  where r.id = :id
