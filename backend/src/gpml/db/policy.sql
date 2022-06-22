-- :name new-policy :<! :1
-- :doc Insert a new policies
insert into policy(
    title,
    original_title,
    data_source,
    country,
    abstract,
    type_of_law,
    record_number,
    implementing_mea,
    first_publication_date,
    latest_amendment_date,
    status,
    geo_coverage_type,
    attachments,
    remarks,
    review_status,
    url,
    image
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :info_docs) ", info_docs")
--~ (when (contains? params :sub_content_type) ", sub_content_type")
--~ (when (contains? params :topics) ", topics")
--~ (when (contains? params :subnational_city) ", subnational_city")
--~ (when (contains? params :document_preview) ", document_preview")
)
values(
    :title,
    :original_title,
    :data_source,
    :country,
    :abstract,
    :type_of_law,
    :record_number,
    :implementing_mea,
    :v:first_publication_date::date,
    :v:latest_amendment_date::date,
    :status,
    :v:geo_coverage_type::geo_coverage_type,
    :v:attachments::jsonb,
    :remarks,
    :v:review_status::review_status,
    :url,
    :image
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :info_docs) ", :info_docs")
--~ (when (contains? params :sub_content_type) ", :sub_content_type")
--~ (when (contains? params :topics) ", :topics")
--~ (when (contains? params :subnational_city) ", :subnational_city")
--~ (when (contains? params :document_preview) ", :document_preview")
)
returning id;

-- :name policy-by-id :? :1
-- :doc returns policy data
select
    id,
    title,
    original_title,
    data_source,
    country,
    abstract,
    type_of_law,
    record_number,
    implementing_mea,
    TO_CHAR(first_publication_date, 'YYYY-MM-DD') as first_publication_date,
    TO_CHAR(latest_amendment_date, 'YYYY-MM-DD') as latest_amendment_date,
    status,
    geo_coverage_type,
    attachments,
    remarks,
    url,
    image,
    created_by,
    document_preview,
    (select json_agg(tag) from policy_tag where policy = :id) as tags,
    (select json_agg(coalesce(country, country_group))
        from policy_geo_coverage where policy = :id) as geo_coverage_value
from policy
where id = :id

-- :name pending-policy :? :1
-- :doc Returns the pending policy data
select
    id,
    title,
    original_title,
    data_source,
    country,
    abstract,
    type_of_law,
    record_number,
    implementing_mea,
    TO_CHAR(first_publication_date, 'YYYY-MM-DD') as first_publication_date,
    TO_CHAR(latest_amendment_date, 'YYYY-MM-DD') as latest_amendment_date,
    status,
    geo_coverage_type,
    geo_coverage_values as geo_coverage_value,
    attachments,
    remarks,
    url,
    image,
    document_preview,
    (select json_agg(tag)
        from policy_tag where policy = :id) as tags,
    (select created_by
        from policy where id = :id) as created_by
from v_policy_data
where id = :id

-- :name add-policy-tags :<! :1
-- :doc add policy tags
insert into policy_tag(policy, tag)
values :t*:tags RETURNING id;

-- :name add-policy-geo :<! :1
-- :doc add policy geo
insert into policy_geo_coverage(policy, country_group, country)
values :t*:geo RETURNING id;

-- :name all-policies
-- :doc List all policies
select id, title
  from policy;

-- :name add-language-to-policy :! :n
-- :doc Add language to policy
update policy
  set language = :language
  where id = :id

-- :name language-by-policy-id :? :1
-- :doc Get language by policy id
select l.* from language l
  where id = (select p.language from policy p where p.id = :id)
