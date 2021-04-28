DROP VIEW IF EXISTS v_project CASCADE;
-- v_project
CREATE VIEW v_project AS
SELECT * FROM (
  SELECT 'project'::text AS topic,
     geo.geo_coverage_iso_code,
     st.search_text,
     row_to_json(p.*) AS json
    FROM v_project_data p
      LEFT JOIN v_project_geo geo ON p.id = geo.id
      LEFT JOIN v_project_search_text st ON p.id = st.id

 UNION ALL

   SELECT 'project'::text AS topic,
       '***' AS iso_code,
       st.search_text,
       row_to_json(i.*) AS json
       FROM v_initiative_data i
       LEFT JOIN v_initiative_search_text st ON i.id = st.id
       WHERE i.geo_coverage_type = 'global'

   UNION ALL

 SELECT 'project'::text AS topic,
     null AS iso_code,
     st.search_text,
     row_to_json(i.*) AS json
     FROM v_initiative_data i
     LEFT JOIN v_initiative_search_text st ON i.id = st.id
     WHERE i.geo_coverage_type = 'regional'

 UNION ALL

   SELECT 'project'::text AS topic,
       TRIM('"' FROM iso_code::text),
       st.search_text,
       row_to_json(i.*) AS json
       FROM v_initiative_data i
       LEFT JOIN json_array_elements(i.geo_coverage_values) iso_code ON true
       LEFT JOIN v_initiative_search_text st ON i.id = st.id
       WHERE i.geo_coverage_type = 'national' OR i.geo_coverage_type = 'transnational' OR i.geo_coverage_type = 'sub-national'
  ) data
  ORDER BY json->>'created';
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
