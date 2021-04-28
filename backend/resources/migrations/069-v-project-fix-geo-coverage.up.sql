DROP VIEW IF EXISTS v_project CASCADE;
-- v_project
CREATE OR REPLACE VIEW v_project
 AS
SELECT data.topic,
       data.geo_coverage_iso_code,
       data.search_text,
       to_json(data.json) as json
FROM
  (SELECT 'project'::text AS topic,
          geo.geo_coverage_iso_code,
          st.search_text,
          to_jsonb(p.*) AS JSON
   FROM ((v_project_data p
          LEFT JOIN v_project_geo geo ON ((p.id = geo.id)))
         LEFT JOIN v_project_search_text st ON ((p.id = st.id)))
   UNION ALL SELECT DISTINCT 'project' AS topic,
                             c.iso_code AS geo_coverage_iso_code,
                             vst.search_text,
                             to_jsonb(i.*) AS JSON
   FROM v_initiative_data i
   JOIN json_array_elements(i.geo_coverage_values) gname ON TRUE
   LEFT JOIN country_group cg ON cg.name = replace(gname::text, '"', '')
   JOIN country_group_country cgc ON cgc.country_group = cg.id
   LEFT JOIN country c ON c.id = cgc.country
   LEFT JOIN v_initiative_search_text vst ON vst.id = i.id
   WHERE i.geo_coverage_type = 'regional'
   UNION ALL SELECT 'project'::text AS topic,
                    '***'::bpchar AS iso_code,
                    st.search_text,
                    to_jsonb(i.*) AS JSON
   FROM (v_initiative_data i
         LEFT JOIN v_initiative_search_text st ON ((i.id = st.id)))
   WHERE (i.geo_coverage_type = 'global'::text)
   UNION ALL SELECT 'project'::text AS topic,
                    btrim((iso_code.value)::text, '"'::text) AS btrim,
                    st.search_text,
                    to_jsonb(i.*) AS JSON
   FROM ((v_initiative_data i
          LEFT JOIN LATERAL json_array_elements(i.geo_coverage_values) iso_code(value) ON (TRUE))
         LEFT JOIN v_initiative_search_text st ON ((i.id = st.id)))
   WHERE ((i.geo_coverage_type = 'national'::text)
          OR (i.geo_coverage_type = 'transnational'::text)
          OR (i.geo_coverage_type = 'sub-national'::text)) ) DATA
ORDER BY (data.json ->> 'created')::date ASC;
--;; ----------------------------------------------

-- Restore topic view
CREATE VIEW v_topic AS
 SELECT v_event.topic,
    v_event.geo_coverage_iso_code,
    v_event.search_text,
    v_event.json
   FROM v_event
UNION ALL
 SELECT v_policy.topic,
    v_policy.geo_coverage_iso_code,
    v_policy.search_text,
    v_policy.json
   FROM v_policy
UNION ALL
 SELECT v_resource.topic,
    v_resource.geo_coverage_iso_code,
    v_resource.search_text,
    v_resource.json
   FROM v_resource
UNION ALL
 SELECT v_technology.topic,
    v_technology.geo_coverage_iso_code,
    v_technology.search_text,
    v_technology.json
   FROM v_technology
UNION ALL
 SELECT v_project.topic,
    v_project.geo_coverage_iso_code,
    v_project.search_text,
    v_project.json
   FROM v_project
UNION ALL
 SELECT v_stakeholder.topic,
    v_stakeholder.geo_coverage_iso_code,
    v_stakeholder.search_text,
    v_stakeholder.json
   FROM v_stakeholder
UNION ALL
 SELECT v_organisation.topic,
    v_organisation.geo_coverage_iso_code,
    v_organisation.search_text,
    v_organisation.json
   FROM v_organisation;
--;; ----------------------------------------------
