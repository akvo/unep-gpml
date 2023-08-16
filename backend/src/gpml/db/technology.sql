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
    language
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :info_docs) ", info_docs")
--~ (when (contains? params :sub_content_type) ", sub_content_type")
--~ (when (contains? params :subnational_city) ", subnational_city")
--~ (when (contains? params :headquarter) ", headquarter")
--~ (when (contains? params :document_preview) ", document_preview")
--~ (when (contains? params :source) ", source")
--~ (when (contains? params :image_id) ", image_id")
--~ (when (contains? params :thumbnail_id) ", thumbnail_id")
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
    :language
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :info_docs) ", :info_docs")
--~ (when (contains? params :sub_content_type) ", :sub_content_type")
--~ (when (contains? params :subnational_city) ", :subnational_city")
--~ (when (contains? params :headquarter) ", :headquarter")
--~ (when (contains? params :document_preview) ", :document_preview")
--~ (when (contains? params :source) ", :source")
--~ (when (contains? params :image_id) ", :image_id")
--~ (when (contains? params :thumbnail_id) ", :thumbnail_id")
)
returning id;

-- :name technology-by-id :? :1
-- :doc returns technology data
SELECT
    t.id,
    t.name,
    t.year_founded,
    t.country,
    t.organisation_type,
    t.development_stage,
    t.specifications_provided,
    t.email,
    t.geo_coverage_type,
    t.attachments,
    t.remarks,
    t.url,
    t.image,
    t.logo,
    t.info_docs,
    t.sub_content_type,
    t.subnational_city,
    t.headquarter,
    t.created_by,
    t.document_preview,
    t.language,
    COALESCE(json_agg(acs.stakeholder) FILTER (WHERE acs.stakeholder IS NOT NULL), '[]') as owners,
    (SELECT json_agg(json_build_object('url',plu.url, 'lang', l.iso_code))
	FROM technology_language_url plu
	LEFT JOIN language l ON l.id = plu.language
	WHERE plu.technology = :id) AS urls,
    (SELECT json_agg(tag) FROM technology_tag WHERE technology = :id) AS tags,
    (SELECT json_agg(coalesce(country, country_group))
	FROM technology_geo_coverage WHERE technology = :id) AS geo_coverage_value
FROM technology t
LEFT JOIN stakeholder_technology acs ON acs.technology = t.id AND acs.association = 'owner'
WHERE t.id = :id
GROUP BY t.id;

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

-- :name all-technologies
-- :doc List all technologies
select id, name
  from technology;
