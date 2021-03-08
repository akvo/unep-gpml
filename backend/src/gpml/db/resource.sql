-- :name new-resource :<! :1
-- :doc Insert a new resource
insert into resource(
    title,
    type,
    publish_year,
    summary,
    value,
    value_currency,
    value_remarks,
    image,
    valid_from,
    valid_to,
    geo_coverage_type,
    attachments,
    remarks
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :review_status) ", review_status")
)
values(
    :title,
    :type,
    :publish_year,
    :summary,
    :value,
    :value_currency,
    :value_remarks,
    :image,
    :valid_from,
    :valid_to,
    :v:geo_coverage_type::geo_coverage_type,
    :v:attachments::text[],
    :remarks
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :review_status) ", :v:review_status::review_status")
)
returning id;
