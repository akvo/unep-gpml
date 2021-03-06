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
                e.remarks, e.created, e.modified, e.city, c.iso_code as country, e.languages as urls, e.tags, e.geo_coverage_values, e.review_status
           from v_event_data e
           left join country c on e.country = c.id) e, event pending

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
select e.id, e.title, e.start_date, e.end_date, e.description, e.image, e.geo_coverage_type,
                e.remarks, e.created, e.modified, e.city, c.iso_code as country, e.languages, e.tags, e.review_status
           from v_event_data e left join country c on e.country = c.id
where e.id = :id
