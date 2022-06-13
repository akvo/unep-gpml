-- :name get-topics :? :*
-- :doc Gets the list of topics. If count-only? parameter is set to true, the query will only group and count the topics.
-- :require [gpml.db.topic]
--~ (#'gpml.db.topic/generate-topic-query {} (if (seq (:topic params)) {:tables (:topic params)} gpml.db.topic/generic-cte-opts))
,
cte_results AS (
--~ (#'gpml.db.topic/generate-filter-topic-snippet params)
)
--~ (#'gpml.db.topic/generate-get-topics params)

-- :name get-flat-topics
-- :doc Get a flat list of all topics
WITH flat_topic AS (
  SELECT
    REPLACE(LOWER(type), ' ', '_') AS topic,
    id,
    0 AS version,
    NULL::json AS submitting_as,
    title,
    NULL AS original_title,
    NULL AS data_source,
    publish_year,
    NULL AS start_date,
    NULL AS end_date,
    summary,
    value,
    image,
    NULL AS logo,
    geo_coverage_type::text,
    attachments,
    remarks,
    created,
    modified,
    country::text,
    NULL AS city,
    NULL AS type_of_law,
    NULL AS organisation_type,
    NULL AS development_stage,
    NULL::boolean AS specifications_provided,
    NULL AS email,
    valid_from,
    valid_to,
    NULL::int AS implementing_mea,
    reviewed_at,
    reviewed_by,
    review_status,
    value_remarks,
    value_currency,
    created_by,
    url,
    NULL AS regulatory_approach,
    NULL AS toolkit_legislation,
    NULL AS repeals,
    NULL AS publication_reference,
    info_docs,
    sub_content_type,
    capacity_building,
    NULL AS event_type,
    NULL AS recording,
    array_remove(array_agg(related_content.related_resource_id), NULL) AS related_content,
    NULL::text[] AS topics,
    NULL AS record_number,
    first_publication_date::text,
    latest_amendment_date::text,
    NULL AS status,
    subnational_city,
    NULL AS headquarter,
    NULL::int AS language,
    document_preview,
    NULL AS reporting_to,
    NULL AS sdg_initiative,
    NULL AS q4,
    NULL AS q4_1_1,
    NULL AS q4_1_2,
    NULL AS q4_2_1,
    NULL AS q4_3_1,
    NULL AS q4_4_1,
    NULL AS q4_4_3,
    NULL AS q4_4_4,
    NULL AS q4_4_5,
    NULL AS q5,
    NULL AS q7_1_1,
    NULL AS q7_1_2,
    NULL AS q7_2,
    NULL AS q8,
    NULL AS q9,
    NULL AS q10,
    NULL AS q11,
    NULL AS q12,
    NULL AS q13,
    NULL AS q14,
    NULL AS q15,
    NULL AS q16,
    NULL AS q17,
    NULL AS q18,
    NULL AS q19,
    NULL AS q20,
    NULL AS q21,
    NULL AS q22,
    NULL AS q24_1,
    NULL AS q24_2,
    NULL AS q24_3,
    NULL AS q24_4,
    NULL AS q24_5,
    NULL AS q26,
    NULL AS q27,
    NULL AS q28,
    NULL AS q29,
    NULL AS q30,
    NULL AS q31,
    NULL AS q32,
    NULL AS q33,
    NULL AS q34,
    NULL AS q35,
    NULL AS q36,
    NULL AS q36_1,
    NULL AS q37,
    NULL AS q37_1,
    NULL AS q38,
    NULL AS q39,
    NULL AS q40,
    NULL AS q41,
    NULL AS q41_1,
    NULL AS q1_1,
    NULL AS q35_1,
    NULL AS q1_1_1
  FROM resource
  LEFT JOIN related_content ON resource.id = related_content.resource_id AND resource_table_name = 'resource'::regclass
  --~ (when (:review-status params) "WHERE review_status = (:v:review-status)::review_status")
  GROUP BY resource.id
UNION ALL
	SELECT
		'event'::text AS topic,
    id,
    0 AS version,
    NULL::json AS submitting_as,
    title,
    NULL AS original_title,
    NULL AS data_source,
    NULL AS publish_year,
    start_date,
    end_date,
    description AS summary,
    NULL AS value,
    image,
    NULL AS logo,
    geo_coverage_type::text,
    NULL AS attachments,
    remarks,
    created,
    modified,
    country::text,
    city,
    NULL AS type_of_law,
    NULL AS organisation_type,
    NULL AS development_stage,
    NULL::boolean AS specifications_provided,
    NULL AS email,
    NULL AS valid_from,
    NULL AS valid_to,
    NULL::int AS implementing_mea,
    reviewed_at,
    reviewed_by,
    review_status,
    NULL AS value_remarks,
    NULL AS value_currency,
    created_by,
    url,
    NULL AS regulatory_approach,
    NULL AS toolkit_legislation,
    NULL AS repeals,
    NULL AS publication_reference,
    info_docs,
    sub_content_type,
    capacity_building,
    event_type,
    recording,
    array_remove(array_agg(related_content.related_resource_id), NULL) AS related_content,
    NULL::text[] AS topics,
    NULL AS record_number,
    NULL AS first_publication_date,
    NULL AS latest_amendment_date,
    NULL AS status,
    subnational_city,
    NULL AS headquarter,
    NULL::int AS language,
    document_preview,
    NULL AS reporting_to,
    NULL AS sdg_initiative,
    NULL AS q4,
    NULL AS q4_1_1,
    NULL AS q4_1_2,
    NULL AS q4_2_1,
    NULL AS q4_3_1,
    NULL AS q4_4_1,
    NULL AS q4_4_3,
    NULL AS q4_4_4,
    NULL AS q4_4_5,
    NULL AS q5,
    NULL AS q7_1_1,
    NULL AS q7_1_2,
    NULL AS q7_2,
    NULL AS q8,
    NULL AS q9,
    NULL AS q10,
    NULL AS q11,
    NULL AS q12,
    NULL AS q13,
    NULL AS q14,
    NULL AS q15,
    NULL AS q16,
    NULL AS q17,
    NULL AS q18,
    NULL AS q19,
    NULL AS q20,
    NULL AS q21,
    NULL AS q22,
    NULL AS q24_1,
    NULL AS q24_2,
    NULL AS q24_3,
    NULL AS q24_4,
    NULL AS q24_5,
    NULL AS q26,
    NULL AS q27,
    NULL AS q28,
    NULL AS q29,
    NULL AS q30,
    NULL AS q31,
    NULL AS q32,
    NULL AS q33,
    NULL AS q34,
    NULL AS q35,
    NULL AS q36,
    NULL AS q36_1,
    NULL AS q37,
    NULL AS q37_1,
    NULL AS q38,
    NULL AS q39,
    NULL AS q40,
    NULL AS q41,
    NULL AS q41_1,
    NULL AS q1_1,
    NULL AS q35_1,
    NULL AS q1_1_1
    FROM event
    LEFT JOIN related_content ON event.id = related_content.resource_id AND resource_table_name = 'event'::regclass
    --~ (when (:review-status params) "WHERE review_status = (:v:review-status)::review_status")
    GROUP BY event.id
UNION ALL
	SELECT
		'initiative'::text AS topic,
    id,
    version,
    q1::json->'1-0' AS submitting_as,
    q2::text AS title,
    NULL AS original_title,
    NULL AS data_source,
    NULL AS publish_year,
    NULL AS start_date,
    NULL AS end_date,
    q3::text AS summary,
    NULL AS value,
    qimage AS image,
    NULL AS logo,
    q24::text AS geo_coverage_type,
    NULL AS attachments,
    NULL AS remarks,
    created,
    modified,
    q23::text AS country,
    NULL AS city,
    NULL AS type_of_law,
    NULL AS organisation_type,
    NULL AS development_stage,
    NULL::boolean AS specifications_provided,
    NULL AS email,
    NULL AS valid_from,
    NULL AS valid_to,
    NULL::int AS implementing_mea,
    reviewed_at,
    reviewed_by,
    review_status,
    NULL AS value_remarks,
    NULL AS value_currency,
    created_by,
    url,
    NULL AS regulatory_approach,
    NULL AS toolkit_legislation,
    NULL AS repeals,
    NULL AS publication_reference,
    info_docs,
    sub_content_type,
    NULL AS capacity_building,
    NULL AS event_type,
    NULL AS recording,
    array_remove(array_agg(related_content.related_resource_id), NULL) AS related_content,
    NULL::text[] AS topics,
    NULL AS record_number,
    NULL AS first_publication_date,
    NULL AS latest_amendment_date,
    NULL AS status,
    q24_subnational_city AS subnational_city,
    NULL AS headquarter,
    NULL::int AS language,
    document_preview,
		q7::text AS reporting_to,
		q7_1_0::text AS sdg_initiative,
    q4::text,
    q4_1_1::text,
    q4_1_2::text,
    q4_2_1::text,
    q4_3_1::text,
    q4_4_1::text,
    q4_4_3::text,
    q4_4_4::text,
    q4_4_5::text,
    q5::text,
    q7_1_1::text,
    q7_1_2::text,
    q7_2::text,
    q8::text,
    q9::text,
    q10::text,
    q11::text,
    q12::text,
    q13::text,
    q14::text,
    q15::text,
    q16::text,
    q17::text,
    q18::text,
    q19::text,
    q20::text,
    q21::text,
    q22::text,
    q24_1::text,
    q24_2::text,
    q24_3::text,
    q24_4::text,
    q24_5::text,
    q26::text,
    q27::text,
    q28::text,
    q29::text,
    q30::text,
    q31::text,
    q32::text,
    q33::text,
    q34::text,
    q35::text,
    q36::text,
    q36_1::text,
    q37::text,
    q37_1::text,
    q38::text,
    q39::text,
    q40::text,
    q41::text,
    q41_1::text,
    q1_1::text,
    q35_1::text,
    q1_1_1::text
	FROM initiative
        LEFT JOIN related_content ON initiative.id = related_content.resource_id AND resource_table_name = 'initiative'::regclass
        --~ (when (:review-status params) "WHERE review_status = (:v:review-status)::review_status")
  GROUP BY initiative.id
UNION ALL
  SELECT
  	'policy'::text AS topic,
    id,
    0 AS version,
    NULL::json AS submitting_as,
    title,
    original_title,
    data_source,
    NULL AS publish_year,
    NULL AS start_date,
    NULL AS end_date,
    abstract AS summary,
    NULL AS value,
    image,
    NULL AS logo,
    geo_coverage_type::text,
    attachments,
    remarks,
    created,
    modified,
    country::text,
    NULL AS city,
    type_of_law,
    NULL AS organisation_type,
    NULL AS development_stage,
    NULL::boolean AS specifications_provided,
    NULL AS email,
    NULL AS valid_from,
    NULL AS valid_to,
		implementing_mea,
    reviewed_at,
    reviewed_by,
    review_status,
    NULL AS value_remarks,
    NULL AS value_currency,
    created_by,
    url,
    regulatory_approach,
    toolkit_legislation,
    repeals,
    publication_reference,
    info_docs,
    sub_content_type,
    NULL AS capacity_building,
    NULL AS event_type,
    NULL AS recording,
    array_remove(array_agg(related_content.related_resource_id), NULL) AS related_content,
    topics,
    record_number,
    first_publication_date::text,
    latest_amendment_date::text,
    status,
    subnational_city,
    NULL AS headquarter,
    language,
    document_preview,
		NULL AS reporting_to,
		NULL AS sdg_initiative,
    NULL AS q4,
    NULL AS q4_1_1,
    NULL AS q4_1_2,
    NULL AS q4_2_1,
    NULL AS q4_3_1,
    NULL AS q4_4_1,
    NULL AS q4_4_3,
    NULL AS q4_4_4,
    NULL AS q4_4_5,
    NULL AS q5,
    NULL AS q7_1_1,
    NULL AS q7_1_2,
    NULL AS q7_2,
    NULL AS q8,
    NULL AS q9,
    NULL AS q10,
    NULL AS q11,
    NULL AS q12,
    NULL AS q13,
    NULL AS q14,
    NULL AS q15,
    NULL AS q16,
    NULL AS q17,
    NULL AS q18,
    NULL AS q19,
    NULL AS q20,
    NULL AS q21,
    NULL AS q22,
    NULL AS q24_1,
    NULL AS q24_2,
    NULL AS q24_3,
    NULL AS q24_4,
    NULL AS q24_5,
    NULL AS q26,
    NULL AS q27,
    NULL AS q28,
    NULL AS q29,
    NULL AS q30,
    NULL AS q31,
    NULL AS q32,
    NULL AS q33,
    NULL AS q34,
    NULL AS q35,
    NULL AS q36,
    NULL AS q36_1,
    NULL AS q37,
    NULL AS q37_1,
    NULL AS q38,
    NULL AS q39,
    NULL AS q40,
    NULL AS q41,
    NULL AS q41_1,
    NULL AS q1_1,
    NULL AS q35_1,
    NULL AS q1_1_1
  FROM policy
  LEFT JOIN related_content ON policy.id = related_content.resource_id AND resource_table_name = 'policy'::regclass
  --~ (when (:review-status params) "WHERE review_status = (:v:review-status)::review_status")
  GROUP BY policy.id
UNION ALL
  SELECT
    'technology'::text AS topic,
    id,
    0 AS version,
    NULL::json AS submitting_as,
    name AS title,
    NULL AS original_title,
    NULL AS data_source,
    year_founded AS publish_year,
    NULL AS start_date,
    NULL AS end_date,
    remarks AS summary,
    NULL AS value,
    image,
    logo,
    geo_coverage_type::text,
    attachments,
    remarks,
    created,
    modified,
    country::text,
    NULL AS city,
    NULL AS type_of_law,
    organisation_type,
    development_stage,
    specifications_provided,
    email,
    NULL AS valid_from,
    NULL AS valid_to,
		NULL::int AS implementing_mea,
    reviewed_at,
    reviewed_by,
    review_status,
    NULL AS value_remarks,
    NULL AS value_currency,
    created_by,
    url,
    NULL AS regulatory_approach,
    NULL AS toolkit_legislation,
    NULL AS repeals,
    NULL AS publication_reference,
    info_docs,
    sub_content_type,
    NULL AS capacity_building,
    NULL AS event_type,
    NULL AS recording,
    array_remove(array_agg(related_content.related_resource_id), NULL) AS related_content,
    NULL::text[] AS topics,
    NULL AS record_number,
    NULL AS first_publication_date,
    NULL AS latest_amendment_date,
    NULL AS status,
    subnational_city,
    headquarter,
    NULL::int AS language,
    document_preview,
		NULL AS reporting_to,
		NULL AS sdg_initiative,
    NULL AS q4,
    NULL AS q4_1_1,
    NULL AS q4_1_2,
    NULL AS q4_2_1,
    NULL AS q4_3_1,
    NULL AS q4_4_1,
    NULL AS q4_4_3,
    NULL AS q4_4_4,
    NULL AS q4_4_5,
    NULL AS q5,
    NULL AS q7_1_1,
    NULL AS q7_1_2,
    NULL AS q7_2,
    NULL AS q8,
    NULL AS q9,
    NULL AS q10,
    NULL AS q11,
    NULL AS q12,
    NULL AS q13,
    NULL AS q14,
    NULL AS q15,
    NULL AS q16,
    NULL AS q17,
    NULL AS q18,
    NULL AS q19,
    NULL AS q20,
    NULL AS q21,
    NULL AS q22,
    NULL AS q24_1,
    NULL AS q24_2,
    NULL AS q24_3,
    NULL AS q24_4,
    NULL AS q24_5,
    NULL AS q26,
    NULL AS q27,
    NULL AS q28,
    NULL AS q29,
    NULL AS q30,
    NULL AS q31,
    NULL AS q32,
    NULL AS q33,
    NULL AS q34,
    NULL AS q35,
    NULL AS q36,
    NULL AS q36_1,
    NULL AS q37,
    NULL AS q37_1,
    NULL AS q38,
    NULL AS q39,
    NULL AS q40,
    NULL AS q41,
    NULL AS q41_1,
    NULL AS q1_1,
    NULL AS q35_1,
    NULL AS q1_1_1
  FROM technology
  LEFT JOIN related_content ON technology.id = related_content.resource_id AND resource_table_name = 'technology'::regclass
  --~ (when (:review-status params) "WHERE review_status = (:v:review-status)::review_status")
  GROUP BY technology.id
)
SELECT * FROM flat_topic ORDER BY id;
