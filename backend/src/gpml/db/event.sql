-- :name new-event :<! :1
-- :doc Insert a new event
insert into event(
    title,
    start_date,
    end_date,
    description,
    remarks,
    geo_coverage_type,
    country,
    city,
    image
--~ (when (contains? params :id) ", id")
--~ (when (contains? params :review_status) ", review_status")
--~ (when (contains? params :created_by) ", created_by")
--~ (when (contains? params :url) ", url")
--~ (when (contains? params :info_docs) ", info_docs")
--~ (when (contains? params :sub_content_type) ", sub_content_type")
--~ (when (contains? params :related_content) ", related_content")
--~ (when (contains? params :capacity_building) ", capacity_building")
--~ (when (contains? params :event_type) ", event_type")
--~ (when (contains? params :recording) ", recording")
--~ (when (contains? params :subnational_city) ", subnational_city")
--~ (when (contains? params :document_preview) ", document_preview")
)
values(
    :title,
    :start_date::timestamptz,
    :end_date::timestamptz,
    :description,
    :remarks,
    :geo_coverage_type::geo_coverage_type,
    :country,
    :city,
    :image
--~ (when (contains? params :id) ", :id")
--~ (when (contains? params :review_status) ", :v:review_status::review_status")
--~ (when (contains? params :created_by) ", :created_by")
--~ (when (contains? params :url) ", :url")
--~ (when (contains? params :info_docs) ", :info_docs")
--~ (when (contains? params :sub_content_type) ", :sub_content_type")
--~ (when (contains? params :related_content) ", :related_content")
--~ (when (contains? params :capacity_building) ", :capacity_building")
--~ (when (contains? params :event_type) ", :event_type")
--~ (when (contains? params :recording) ", :recording")
--~ (when (contains? params :subnational_city) ", :subnational_city")
--~ (when (contains? params :document_preview) ", :document_preview")
) RETURNING id;

-- :name add-event-tags :<! :1
-- :doc Add specified tags to an event
insert into event_tag(event, tag)
values :t*:tags RETURNING id;

-- :name add-event-language-urls :<! :1
-- :doc Add language URLs to an event
insert into event_language_url(event, language, url)
values :t*:urls RETURNING id;

-- :name add-event-geo-coverage :<! :1
-- :doc Add specified countries or country groups to an event
insert into event_geo_coverage(event, country_group, country)
values :t*:geo RETURNING id;


-- :name pending-events :? :*
-- :doc Returns the list of pending events
select e.*
  from ( select e.id, e.title, e.start_date, e.end_date, e.description, e.image, e.geo_coverage_type,
                e.remarks, e.created, e.modified, e.city, e.document_preview, c.iso_code as country,
                e.languages as urls, e.tags, e.geo_coverage_values, e.review_status, s.email as submitter
                from v_event_data e
                left join country c on e.country = c.id
                left join event ev on ev.id = e.id
                left join stakeholder s on ev.created_by = s.id
    ) e, event pending

where pending.review_status = 'SUBMITTED'
  and e.id = pending.id


-- :name pending-event-by-id :? :1
-- :doc Return the id of an event pending for approval
select id from event where review_status = 'SUBMITTED' and id = :id

-- :name update-event-status :! :n
-- :doc Approves an event by given id
update event
   set reviewed_at = now(),
    review_status = :v:review_status::review_status
--~ (when (contains? params :reviewed_by) ",reviewed_by = :reviewed_by::integer")
 where id = :id

-- :name event-by-id :? :1
-- :doc Returns the data for a given event
  WITH owners_data as (
   select COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') as owners, authz.topic_id
 from  topic_stakeholder_auth authz where authz.topic_type::text='event' AND authz.topic_id=:id
group by topic_id
   )
select
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
    (select json_agg(tag) from event_tag where event = :id) as tags,
    (select json_agg(coalesce(country, country_group))
        from event_geo_coverage where event = :id) as geo_coverage_value,
      COALESCE(owners_data.owners, '[]') as owners
from v_event_data e
LEFT JOIN owners_data ON owners_data.topic_id=:id
where e.id = :id

-- :name event-image-by-id :? :1
-- :doc Get event image by id
select * from event_image where id = :id

-- :name new-event-image :<! :1
-- :doc Insert new event image
insert into event_image (image)
values(:image) returning id;

-- :name dummy
select count(*) from event where title like 'Dummy%';

-- :name entity-connections-by-id
-- :doc Get entity connections by id
select oe.id, oe.association as role, org.id as entity_id, org.name as entity, org.logo as image
 from organisation_event oe
 left join organisation org
 on oe.organisation = org.id
 where oe.event = :id

-- :name stakeholder-connections-by-id
-- :doc Get stakeholder connections by id
select se.id, se.association as role, s.id as stakeholder_id, concat_ws(' ', s.first_name, s.last_name) as stakeholder,
 s.picture as image, s.role as stakeholder_role
  from stakeholder_event se
  left join stakeholder s
  on se.stakeholder = s.id
  where se.event = :id
  and se.is_bookmark = false;

-- :name all-events
-- :doc List all events
select id, title
  from event;

-- :name related-content-by-id
-- :doc Get related content by id
select ev.id, ev.title, ev.description from event e
  left join event ev
  on ev.id = any(e.related_content)
where e.id = :id
