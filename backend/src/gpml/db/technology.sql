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
)
returning id;

-- :name technology-by-id :? :1
-- :doc returns technology data
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
    attachments,
    remarks,
    url,
    image,
    logo,
    created_by,
    (select json_agg(json_build_object('url',plu.url, 'lang', l.iso_code))
        from technology_language_url plu
        left join language l on l.id = plu.language
        where plu.technology = :id) as urls,
    (select json_agg(tag) from technology_tag where technology = :id) as tags,
    (select json_agg(coalesce(country, country_group))
        from technology_geo_coverage where technology = :id) as geo_coverage_value
from technology
where id = :id

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
