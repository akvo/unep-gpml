-- :name new-event :returning-execute :one
-- :doc Insert a new event
INSERT INTO event(
    title,
    start_date,
    end_date,
    description,
    remarks,
    geo_coverage_type,
    country,
    city,
    image,
    language
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :review_status) ", review_status")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :url) ", url")
--~ (when (contains? params :info_docs) ", info_docs")
--~ (when (contains? params :sub_content_type) ", sub_content_type")
--~ (when (contains? params :capacity_building) ", capacity_building")
--~ (when (contains? params :event_type) ", event_type")
--~ (when (contains? params :recording) ", recording")
--~ (when (contains? params :subnational_city) ", subnational_city")
--~ (when (contains? params :document_preview) ", document_preview")
--~ (when (contains? params :source) ", source")
)
VALUES(
    :title,
    :start_date::timestamptz,
    :end_date::timestamptz,
    :description,
    :remarks,
    :geo_coverage_type::geo_coverage_type,
    :country,
    :city,
    :image,
    :language
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :review_status) ", :v:review_status::review_status")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :url) ", :url")
--~ (when (contains? params :info_docs) ", :info_docs")
--~ (when (contains? params :sub_content_type) ", :sub_content_type")
--~ (when (contains? params :capacity_building) ", :capacity_building")
--~ (when (contains? params :event_type) ", :event_type")
--~ (when (contains? params :recording) ", :recording")
--~ (when (contains? params :subnational_city) ", :subnational_city")
--~ (when (contains? params :document_preview) ", :document_preview")
--~ (when (contains? params :source) ", :source")
) RETURNING id;

-- :name add-event-language-urls :returning-execute :one
-- :doc Add language URLs to an event
INSERT INTO event_language_url(event, language, url)
VALUES :t*:urls RETURNING id;

-- :name update-event-status :execute :affected
-- :doc Approves an event by given id
UPDATE event
   SET reviewed_at = now(),
    review_status = :v:review_status::review_status
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
 WHERE id = :id

-- :name event-by-id :query :one
-- :doc Returns the data for a given event
  WITH owners_data AS (
   SELECT COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') AS owners, authz.topic_id
 FROM  topic_stakeholder_auth authz WHERE authz.topic_type::text='event' AND authz.topic_id=:id
GROUP BY topic_id
   )
SELECT
    e.id,
    e.title,
    e.start_date,
    e.end_date,
    e.description,
    e.image,
    e.geo_coverage_type,
    e.remarks,
    e.created,
    e.modified,
    e.city,
    e.country,
    e.languages,
    e.tags,
    e.url,
    e.recording,
    e.sub_content_type,
    e.review_status,
    (SELECT json_agg(tag) FROM event_tag WHERE event = :id) AS tags,
    (SELECT json_agg(COALESCE(country, country_group))
        FROM event_geo_coverage WHERE event = :id) as geo_coverage_value,
      COALESCE(owners_data.owners, '[]') AS owners
FROM v_event_data e
LEFT JOIN owners_data ON owners_data.topic_id=:id
WHERE e.id = :id

-- :name event-image-by-id :query :one
-- :doc Get event image by id
SELECT * FROM event_image WHERE id = :id

-- :name new-event-image :returning-execute :one
-- :doc Insert new event image
INSERT INTO event_image (image)
VALUES(:image) returning id;

-- :name create-event-images :returning-execute :many
INSERT INTO event_image (image)
VALUES :t*:insert-values RETURNING id;

-- :name dummy
SELECT COUNT(*) FROM event WHERE title LIKE 'Dummy%';

-- :name create-events :insert-returning :many
-- :doc Creates multiple events
INSERT INTO event(:i*:insert-cols)
VALUES :t*:insert-values RETURNING *;

-- :name get-events :query :many
-- :doc Get events. Accepts optional filters.
SELECT *
FROM event
WHERE 1=1
--~(when (seq (get-in params [:filters :brs-api-ids])) " AND brs_api_id IN (:v*:filters.brs-api-ids)")
--~(when (seq (get-in params [:filters :ids])) " AND id IN (:v*:filters.ids)")

-- :name update-event :execute :affected
UPDATE event
SET
/*~
(str/join ","
  (for [[field _] (:updates params)]
    (str (identifier-param-quote (name field) options)
      " = :updates." (name field))))
~*/
WHERE id = :id;
