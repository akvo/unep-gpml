DROP VIEW v_event_data CASCADE;
--;;
DROP VIEW v_initiative_data CASCADE;
--;;
DROP VIEW v_resource_data CASCADE;
--;;
ALTER TABLE event
DROP COLUMN capacity_building;
--;;
ALTER TABLE resource
DROP COLUMN capacity_building;
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
CREATE VIEW v_resource_data AS
 SELECT r.id,
    r.title,
    r.type,
    r.publish_year,
    r.summary,
    r.value,
    r.image,
    r.geo_coverage_type,
    r.attachments,
    r.remarks,
    r.created,
    r.modified,
    r.country,
    r.valid_from,
    r.valid_to,
    r.reviewed_at,
    r.reviewed_by,
    r.review_status,
    r.value_remarks,
    r.value_currency,
    r.created_by,
    r.url,
    r.info_docs,
    r.sub_content_type,
    geo.geo_coverage_values,
    lang.languages,
    tag.tags,
    orgs.organisations,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries
   FROM ((((resource r
     LEFT JOIN ( SELECT rlu.resource,
            json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
           FROM (resource_language_url rlu
             JOIN language l ON ((rlu.language = l.id)))
          GROUP BY rlu.resource) lang ON ((r.id = lang.resource)))
     LEFT JOIN ( SELECT rt.resource,
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM (resource_tag rt
             JOIN tag t ON ((rt.tag = t.id)))
          GROUP BY rt.resource) tag ON ((r.id = tag.resource)))
     LEFT JOIN ( SELECT rg.resource,
            json_agg(COALESCE(rg.country_group, 0)) FILTER (WHERE (rg.country_group IS NOT NULL)) AS geo_coverage_country_groups,
            json_agg(COALESCE(rg.country, 0)) FILTER (WHERE (rg.country IS NOT NULL)) AS geo_coverage_countries,
            json_agg(COALESCE(rg.country, rg.country_group, 0)) AS geo_coverage_values
           FROM resource_geo_coverage rg
          GROUP BY rg.resource) geo ON ((r.id = geo.resource)))
     LEFT JOIN ( SELECT ro.resource,
            json_agg(json_build_object('id', o.id, 'name', o.name)) AS organisations
           FROM (resource_organisation ro
             LEFT JOIN organisation o ON ((ro.organisation = o.id)))
          GROUP BY ro.resource) orgs ON ((r.id = orgs.resource)))
  ORDER BY r.created;
--;;
CREATE VIEW v_resource AS
 SELECT replace(lower(r.type), ' '::text, '_'::text) AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(r.*) AS json
   FROM ((v_resource_data r
     LEFT JOIN v_resource_geo geo ON ((r.id = geo.id)))
     LEFT JOIN v_resource_search_text st ON ((r.id = st.id)));
--;;
CREATE OR REPLACE VIEW v_initiative_data AS
 SELECT i.id,
    NULL::text AS uuid,
    NULL::text AS phase,
    i.q36 AS funds,
    i.q37 AS contribution,
    i.created,
    i.modified,
    btrim((i.q2)::text, '"'::text) AS title,
    jsonb_object_keys(i.q24) AS geo_coverage_type,
    btrim((i.q3)::text, '"'::text) AS summary,
    i.reviewed_at,
    i.reviewed_by,
    i.review_status,
    i.url AS initiative_url,
    i.info_docs,
    i.sub_content_type,
    btrim((i.q41_1)::text, '"'::text) AS url,
    NULL::text AS image,
    v_t.tags,
    geo.geo_coverage_values,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries
   FROM ((initiative i
     LEFT JOIN v_initiative_tag v_t ON ((i.id = v_t.id)))
     LEFT JOIN ( SELECT ig.initiative,
            json_agg(COALESCE(ig.country_group, 0)) FILTER (WHERE (ig.country_group IS NOT NULL)) AS geo_coverage_country_groups,
            json_agg(COALESCE(ig.country, 0)) FILTER (WHERE (ig.country IS NOT NULL)) AS geo_coverage_countries,
            json_agg(COALESCE(ig.country, ig.country_group, 0)) AS geo_coverage_values
           FROM initiative_geo_coverage ig
          GROUP BY ig.initiative) geo ON ((i.id = geo.initiative)))
  ORDER BY i.created;
  --;;
CREATE OR REPLACE VIEW v_project AS
 SELECT 'project'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(i.*) AS json
   FROM ((v_initiative_data i
     LEFT JOIN v_initiative_geo geo ON ((i.id = geo.id)))
     LEFT JOIN v_initiative_search_text st ON ((i.id = st.id)));
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
