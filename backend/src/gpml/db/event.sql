-- :name new-event :<!
-- :doc Insert a new event
insert into event(title, start_date, end_date, description, remarks, geo_coverage_type, country, city)
values(:title, :start_date::timestamptz, :end_date::timestamptz, :description, :remarks, :geo_coverage_type::geo_coverage_type, :country, :city) RETURNING id;

-- :name add-event-tags :<!
-- :doc Add specified tags to an event
insert into event_tag(event, tag)
values :t*:tags RETURNING id;

-- :name add-event-language-urls :<!
-- :doc Add language URLs to an event
insert into event_language_url(event, language, url)
values :t*:urls RETURNING id;
