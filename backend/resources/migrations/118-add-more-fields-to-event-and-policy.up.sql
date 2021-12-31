ALTER TABLE policy
ADD COLUMN info_docs text,
ADD COLUMN sub_content_type text;
--;;
ALTER TABLE event
ADD COLUMN event_type text,
ADD COLUMN recording text;
--;;
DROP VIEW IF EXISTS v_policy_data CASCADE;
--;;
DROP VIEW IF EXISTS v_event_data CASCADE;
--;;
--;;
CREATE VIEW v_policy_data AS
 SELECT p.id,
    p.title,
    p.original_title,
    p.data_source,
    p.country,
    p.abstract,
    p.type_of_law,
    p.record_number,
    p.first_publication_date,
    p.latest_amendment_date,
    p.status,
    p.geo_coverage_type,
    p.attachments,
    p.remarks,
    p.created,
    p.modified,
    p.implementing_mea,
    p.reviewed_at,
    p.reviewed_by,
    p.review_status,
    p.url,
    p.image,
    p.created_by,
    geo.geo_coverage_values,
    lang.languages,
    tag.tags,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries
   FROM (((policy p
     LEFT JOIN ( SELECT plu.policy,
            json_agg(json_build_object('url', plu.url, 'iso_code', l.iso_code)) AS languages
           FROM (policy_language_url plu
             JOIN language l ON ((plu.language = l.id)))
          GROUP BY plu.policy) lang ON ((p.id = lang.policy)))
     LEFT JOIN ( SELECT pt.policy,
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM (policy_tag pt
             JOIN tag t ON ((pt.tag = t.id)))
          GROUP BY pt.policy) tag ON ((p.id = tag.policy)))
     LEFT JOIN ( SELECT pg.policy,
            json_agg(COALESCE(pg.country_group, 0)) FILTER (WHERE (pg.country_group IS NOT NULL)) AS geo_coverage_country_groups,
            json_agg(COALESCE(pg.country, 0)) FILTER (WHERE (pg.country IS NOT NULL)) AS geo_coverage_countries,
            json_agg(COALESCE(pg.country, pg.country_group, 0)) AS geo_coverage_values
           FROM policy_geo_coverage pg
          GROUP BY pg.policy) geo ON ((p.id = geo.policy)))
  ORDER BY p.created;
--;;
CREATE VIEW v_policy AS
 SELECT 'policy'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(p.*) AS json
   FROM ((v_policy_data p
     LEFT JOIN v_policy_geo geo ON ((p.id = geo.id)))
     LEFT JOIN v_policy_search_text st ON ((p.id = st.id)));
--;;
CREATE VIEW v_event_data AS
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
    e.event_type,
    e.recording,
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
