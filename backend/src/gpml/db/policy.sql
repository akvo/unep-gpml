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
--~ (when (contains? params :related_content) ", related_content")
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
    :v:first_publication_date::timestamptz,
    :v:latest_amendment_date::timestamptz,
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
--~ (when (contains? params :related_content) ", :related_content")
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
    (select json_agg(json_build_object('url',plu.url, 'lang', l.iso_code))
        from policy_language_url plu
        left join language l on l.id = plu.language
        where plu.policy = :id) as urls,
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
    (select json_agg(json_build_object('url',plu.url, 'lang', l.iso_code))
        from policy_language_url plu
        left join language l on l.id = plu.language
        where plu.policy = :id) as urls,
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

-- :name add-policy-language-urls :<! :1
-- :doc Add language URLs to a policy
insert into policy_language_url(policy, language, url)
values :t*:urls RETURNING id;

-- :name entity-connections-by-id
-- :doc Get entity connections by id
select orgpol.id, orgpol.association as role, org.id as entity_id, org.name as entity, org.logo as image
 from organisation_policy orgpol
 left join organisation org
 on orgpol.organisation = org.id
 where orgpol.policy = :id

-- :name stakeholder-connections-by-id
-- :doc Get stakeholder connections by id
select sp.id, sp.association as role, s.id as stakeholder_id, concat_ws(' ', s.first_name, s.last_name) as stakeholder,
 s.picture as image, s.role as stakeholder_role
  from stakeholder_policy sp
  left join stakeholder s
  on sp.stakeholder = s.id
  where sp.policy = :id

-- :name all-policies
-- :doc List all policies
select id, title
  from policy;

-- :name related-content-by-id
-- :doc Get related content by id
select pol.id, pol.title, pol.abstract as description from policy p
  left join policy pol
  on pol.id = ANY(p.related_content)
  where p.id = :id

-- :name tags-by-id
-- :doc Get tags by id
select t.id, t.tag from policy_tag pt
  left join tag t
  on pt.tag = t.id
  where pt.policy = :id

-- :name add-language-to-policy :! :n
-- :doc Add language to policy
update policy
  set language = :language
  where id = :id

-- :name language-by-policy-id :? :1
-- :doc Get language by policy id
select l.* from language l
  where id = (select p.language from policy p where p.id = :id)

