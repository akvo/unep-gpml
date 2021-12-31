DROP VIEW v_event_data CASCADE;
--;;
DROP VIEW v_policy_data CASCADE;
--;;
ALTER TABLE event
DROP COLUMN event_type,
DROP COLUMN recording;
--;;
ALTER TABLE policy
DROP COLUMN info_docs,
DROP COLUMN sub_content_type;
--;;
CREATE VIEW public.v_event_data AS
 SELECT e.id,
    e.title,
    e.start_date,
    e.end_date,
    e.description,
    e.image,
    e.country,
    e.city,
    e.geo_coverage_type,
    geo.geo_coverage_values,
    e.remarks,
    e.created,
    e.modified,
    e.reviewed_at,
    e.reviewed_by,
    e.review_status,
    e.url,
    e.info_docs,
    e.sub_content_type,
    e.capacity_building,
    lang.languages,
    tag.tags
   FROM (((event e
     LEFT JOIN ( SELECT elu.event,
            json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
           FROM (event_language_url elu
             JOIN language l ON ((elu.language = l.id)))
          GROUP BY elu.event) lang ON ((e.id = lang.event)))
     LEFT JOIN ( SELECT et.event,
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM (event_tag et
             JOIN tag t ON ((et.tag = t.id)))
          GROUP BY et.event) tag ON ((e.id = tag.event)))
     LEFT JOIN ( SELECT eg.event,
            json_agg(COALESCE(eg.country, eg.country_group, 0)) AS geo_coverage_values
           FROM event_geo_coverage eg
          GROUP BY eg.event) geo ON ((e.id = geo.event)))
  ORDER BY e.created;
--;;
CREATE VIEW v_event AS
 SELECT 'event'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(e.*) AS json
   FROM ((v_event_data e
     LEFT JOIN v_event_geo geo ON ((e.id = geo.id)))
     LEFT JOIN v_event_search_text st ON ((e.id = st.id)));
--;;
CREATE VIEW v_topic AS
 SELECT v_event.topic,
    v_event.geo_coverage,
    v_event.search_text,
    v_event.json
   FROM v_event
UNION ALL
 SELECT v_policy.topic,
    v_policy.geo_coverage,
    v_policy.search_text,
    v_policy.json
   FROM v_policy
UNION ALL
 SELECT v_resource.topic,
    v_resource.geo_coverage,
    v_resource.search_text,
    v_resource.json
   FROM v_resource
UNION ALL
 SELECT v_technology.topic,
    v_technology.geo_coverage,
    v_technology.search_text,
    v_technology.json
   FROM v_technology
UNION ALL
 SELECT v_project.topic,
    v_project.geo_coverage,
    v_project.search_text,
    v_project.json
   FROM v_project
UNION ALL
 SELECT v_stakeholder.topic,
    v_stakeholder.geo_coverage,
    v_stakeholder.search_text,
    v_stakeholder.json
   FROM v_stakeholder
UNION ALL
 SELECT v_organisation.topic,
    v_organisation.geo_coverage,
    v_organisation.search_text,
    v_organisation.json
   FROM v_organisation;
--;;
CREATE VIEW v_topic_all AS
 SELECT v_event.topic,
    v_event.geo_coverage,
    v_event.search_text,
    v_event.json
   FROM v_event
UNION ALL
 SELECT v_policy.topic,
    v_policy.geo_coverage,
    v_policy.search_text,
    v_policy.json
   FROM v_policy
UNION ALL
 SELECT v_project.topic,
    v_project.geo_coverage,
    v_project.search_text,
    v_project.json
   FROM v_project
UNION ALL
 SELECT v_resource.topic,
    v_resource.geo_coverage,
    v_resource.search_text,
    v_resource.json
   FROM v_resource
UNION ALL
 SELECT v_technology.topic,
    v_technology.geo_coverage,
    v_technology.search_text,
    v_technology.json
   FROM v_technology
UNION ALL
 SELECT v_organisation.topic,
    v_organisation.geo_coverage,
    v_organisation.search_text,
    v_organisation.json
   FROM v_organisation
UNION ALL
 SELECT v_stakeholder.topic,
    v_stakeholder.geo_coverage,
    v_stakeholder.search_text,
    v_stakeholder.json
   FROM v_stakeholder;
--;;
CREATE VIEW v_capacity_building AS
 SELECT 'event'::text AS topic,
  e.id,
  e.title,
  e.description,
  e.country,
  e.remarks,
  e.created,
  e.modified,
  e.geo_coverage_type,
  e.image,
  e.url,
  e.info_docs,
  e.sub_content_type,
  e.languages,
  e.tags,
  e.geo_coverage_values,
  e.reviewed_at,
  e.reviewed_by,
  e.review_status,
  e.start_date::text,
  e.end_date::text
   FROM v_event_data e
     WHERE e.capacity_building=true
UNION ALL
  SELECT
    r.type::text AS topic,
    r.id,
    r.title,
    r.summary AS description,
    r.country,
    r.remarks,
    r.created,
    r.modified,
    r.geo_coverage_type,
    r.image,
    r.url,
    r.info_docs,
    r.sub_content_type,
    r.languages,
    r.tags,
    r.geo_coverage_values,
    r.reviewed_at,
    r.reviewed_by,
    r.review_status,
    r.valid_from::text AS start_date,
    r.valid_to::text AS end_date
   FROM v_resource_data r
     WHERE r.capacity_building=true;
