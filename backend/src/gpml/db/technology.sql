-- :name new-technology :<! :1
-- :doc Insert a new technology
insert into technology(
    name,
    year_founded,
    country,
    organisation_type,
    development_stage,
    specifications_provided,
    email,
    geo_coverage_type,
    attachments,
    remarks,
    review_status,
    url,
    image,
    logo
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :info_docs) ", info_docs")
--~ (when (contains? params :sub_content_type) ", sub_content_type")
--~ (when (contains? params :related_content) ", related_content")
--~ (when (contains? params :subnational_city) ", subnational_city")
--~ (when (contains? params :headquarter) ", headquarter")
--~ (when (contains? params :document_preview) ", document_preview")
)
values(
    :name,
    :year_founded,
    :country,
    :organisation_type,
    :development_stage,
    :v:specifications_provided::boolean,
    :email,
    :v:geo_coverage_type::geo_coverage_type,
    :v:attachments::jsonb,
    :remarks,
    :v:review_status::review_status,
    :url,
    :image,
    :logo
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :info_docs) ", :info_docs")
--~ (when (contains? params :sub_content_type) ", :sub_content_type")
--~ (when (contains? params :related_content) ", :related_content")
--~ (when (contains? params :subnational_city) ", :subnational_city")
--~ (when (contains? params :headquarter) ", :headquarter")
--~ (when (contains? params :document_preview) ", :document_preview")
)
returning id;

-- :name technology-by-id :? :1
-- :doc returns technology data
select
    technology.id,
    name,
    year_founded,
    country,
    organisation_type,
    development_stage,
    specifications_provided,
    email,
    geo_coverage_type,
    attachments,
    remarks,
    url,
    image,
    logo,
    info_docs,
    sub_content_type,
    subnational_city,
    headquarter,
    related_content,
    created_by,
    document_preview,
    COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') as owners,
    (select json_agg(json_build_object('url',plu.url, 'lang', l.iso_code))
        from technology_language_url plu
        left join language l on l.id = plu.language
        where plu.technology = :id) as urls,
    (select json_agg(tag) from technology_tag where technology = :id) as tags,
    (select json_agg(coalesce(country, country_group))
        from technology_geo_coverage where technology = :id) as geo_coverage_value
from technology
left join topic_stakeholder_auth authz ON authz.topic_type::text='technology' AND authz.topic_id=technology.id
where technology.id = :id
GROUP BY technology.id

-- :name pending-technology :? :1
-- :doc Returns the pending technology data
select
    id,
    name,
    year_founded,
    country,
    organisation_type,
    development_stage,
    specifications_provided,
    email,
    geo_coverage_type,
    geo_coverage_values as geo_coverage_value,
    attachments,
    remarks,
    url,
    image,
    logo,
    info_docs,
    sub_content_type,
    subnational_city,
    headquarter,
    document_preview,
    (select json_agg(json_build_object('url',plu.url, 'lang', l.iso_code))
        from technology_language_url plu
        left join language l on l.id = plu.language
        where plu.technology = :id) as urls,
    (select json_agg(tag)
        from technology_tag where technology = :id) as tags,
    (select created_by
        from technology where id = :id) as created_by
from v_technology_data
where id = :id

-- :name add-technology-tags :<! :1
-- :doc add technology tags
insert into technology_tag(technology, tag)
values :t*:tags RETURNING id;

-- :name add-technology-geo :<! :1
-- :doc add technology geo
insert into technology_geo_coverage(technology, country_group, country)
values :t*:geo RETURNING id;

-- :name add-technology-language-urls :<! :1
-- :doc Add language URLs to a technology
insert into technology_language_url(technology, language, url)
values :t*:urls RETURNING id;

-- :name update-technology :! :n
-- :doc Update technology column
update technology set
--~ (when (contains? params :name) "name = :name,")
--~ (when (contains? params :year_founded) "year_founded = :year_founded,")
--~ (when (contains? params :country) "country = :country,")
--~ (when (contains? params :organisation_type) "organisation_type = :organisation_type,")
--~ (when (contains? params :development_stage) "development_stage = :development_stage,")
--~ (when (contains? params :specifications_provided) "specifications_provided = :specifications_provided,")
--~ (when (contains? params :email) "email = :email,")
--~ (when (contains? params :geo_coverage_type) "geo_coverage_type = :v:geo_coverage_type::geo_coverage_type,")
--~ (when (contains? params :attachments) "attachments = :attachments,")
--~ (when (contains? params :remarks) "remarks = :remarks,")
--~ (when (contains? params :reviewed_at) "reviewed_at = :reviewed_at,")
--~ (when (contains? params :reviewed_by) "reviewed_by = :reviewed_by,")
--~ (when (contains? params :review_status) "review_status = :review_status,")
--~ (when (contains? params :url) "url = :url,")
--~ (when (contains? params :image) "image = :image,")
--~ (when (contains? params :logo) "logo = :logo,")
--~ (when (contains? params :info_docs) "info_docs = :info_docs,")
--~ (when (contains? params :sub_content_type) "sub_content_type = :sub_content_type,")
--~ (when (contains? params :subnational_city) "subnational_city = :subnational_city,")
--~ (when (contains? params :headquarter) "headquarter = :headquarter,")
--~ (when (contains? params :document_preview) "document_preview = :document_preview,")
--~ (when (contains? params :created_by) "created_by = :created_by,")
modified = now()
where id = :id;

-- :name entity-connections-by-id
-- :doc Get entity connections by id
select ot.id, ot.association as role, org.id as entity_id, org.name as entity, org.logo as image
 from organisation_technology ot
 left join organisation org
 on ot.organisation = org.id
 where ot.technology = :id

-- :name stakeholder-connections-by-id
-- :doc Get stakeholder connections by id
select st.id, st.association as role, s.id as stakeholder_id, concat_ws(' ', s.first_name, s.last_name) as stakeholder,
 s.picture as image, s.role as stakeholder_role
  from stakeholder_technology st
  left join stakeholder s
  on st.stakeholder = s.id
  where st.technology = :id

-- :name all-technologies
-- :doc List all technologies
select id, title
  from technology;

-- :name related-content-by-id
-- :doc Get related content by id
select tech.id, tech.name as title, tech.remarks as description from technology t
  left join technology tech
  on tech.id = ANY(t.related_content)
  where t.id = :id

-- :name tags-by-id
-- :doc Get tags by id
select t.id, t.tag from technology_tag tt
  left join tag t
  on tt.tag = t.id
  where tt.technology = :id
