-- :name new-resource :<! :1
-- :doc Insert a new resource
insert into resource(
    title,
    type,
    publish_year,
    summary,
    image,
    valid_from,
    valid_to,
    geo_coverage_type,
--~ (when (contains? params :value) ", value")
--~ (when (contains? params :value_currency) ", value_currency")
--~ (when (contains? params :value_remarks) ", value_remarks")
--~ (when (contains? params :image) ", image")
--~ (when (contains? params :attachments) ", attachments")
--~ (when (contains? params :remarks) ", remarks")
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :review_status) ", review_status")
)
values(
    :title,
    :type,
    :publish_year,
    :summary,
    :valid_from,
    :valid_to,
    :v:geo_coverage_type::geo_coverage_type,
--~ (when (contains? params :value) ", :value")
--~ (when (contains? params :value_currency) ", :value_currency")
--~ (when (contains? params :value_remarks) ", :value_remarks")
--~ (when (contains? params :image) ", :image")
--~ (when (contains? params :attachments) ", :v:attachments::text[]")
--~ (when (contains? params :remarks) ", :remarks")
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :review_status) ", :v:review_status::review_status")
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
-- :doc Add language URLs to an resource
insert into resource_language_url(resource, language, url)
values :t*:urls RETURNING id;
