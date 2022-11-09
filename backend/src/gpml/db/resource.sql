-- :name new-resource :returning-execute :one
-- :doc Insert a new resource
INSERT INTO resource(
    title,
    type,
    publish_year,
    summary,
    valid_from,
    valid_to,
    geo_coverage_type,
    language
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
--~ (when (contains? params :capacity_building) ", capacity_building")
--~ (when (contains? params :subnational_city) ", subnational_city")
--~ (when (contains? params :document_preview) ", document_preview")
--~ (when (contains? params :source) ", source")
)
VALUES(
    :title,
    :type,
    :publish_year,
    :summary,
    :valid_from,
    :valid_to,
    :v:geo_coverage_type::geo_coverage_type,
    :language
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
--~ (when (contains? params :capacity_building) ", :capacity_building")
--~ (when (contains? params :subnational_city) ", :subnational_city")
--~ (when (contains? params :document_preview) ", :document_preview")
--~ (when (contains? params :source) ", :source")
)
returning id;

-- :name add-resource-language-urls :returning-execute :one
-- :doc Add language URLs to a resource
INSERT INTO resource_language_url(resource, language, url)
VALUES :t*:urls RETURNING id;

-- :name resource-by-id :query :one
SELECT
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
    language,
    (select json_agg(json_build_object('url',rlu.url, 'lang', l.iso_code))
        from resource_language_url rlu
        left join language l on l.id = rlu.language
        where rlu.resource = :id) as urls,
    (select json_agg(coalesce(country, country_group))
        from resource_geo_coverage where resource = :id) as geo_coverage_value,
    (select json_agg(tag)
        from resource_tag where resource = :id) as tags
FROM resource r
WHERE id = :id

-- :name create-resources :insert-returning :many
-- :doc Creates multiple resources
INSERT INTO resource(:i*:insert-cols)
VALUES :t*:insert-values RETURNING *;

-- :name get-resources :query :many
-- :doc Get resources. Accepts optional filters.
SELECT *
FROM resource
WHERE 1=1
--~(when (seq (get-in params [:filters :brs-api-ids])) " AND brs_api_id IN (:v*:filters.brs-api-ids)")
--~(when (seq (get-in params [:filters :ids])) " AND id IN (:v*:filters.ids)")
--~(when (seq (get-in params [:filters :types])) " AND type IN (:v*:filters.types)")

-- :name update-resource :execute :affected
UPDATE resource
SET
/*~
(str/join ","
  (for [[field _] (:updates params)]
    (str (identifier-param-quote (name field) options)
      " = :updates." (name field))))
~*/
WHERE id = :id;
