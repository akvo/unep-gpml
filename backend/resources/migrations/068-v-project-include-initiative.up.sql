-- Tags
CREATE OR REPLACE VIEW v_initiative_tag AS
  SELECT i.id, json_agg(tag_text.value) AS tags
  FROM initiative i
  JOIN jsonb_array_elements(q32) tag_elements ON true
  JOIN jsonb_each_text(tag_elements) tag_text ON true
  GROUP BY i.id;
--;; ----------------------------------------------

-- Search Text
CREATE VIEW v_initiative_search_text AS
SELECT id,
   to_tsvector('english'::regconfig, (COALESCE(TRIM('"' FROM i.q2::text), ''::text) || ' '::text) || COALESCE(TRIM('"' FROM q3::text), ''::text)) AS search_text
  FROM initiative i
 ORDER BY i.created;
--;; ----------------------------------------------

-- Geo coverage type and value
CREATE OR REPLACE VIEW v_initiative_geo_coverage AS
  SELECT
  i.id,
  lower(geo_cov_type.key) AS geo_coverage_type,
  null AS geo_coverage_values
  FROM initiative i
  JOIN jsonb_each_text(q24) geo_cov_type ON true
  WHERE geo_cov_type.key = 'Global'
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key

  UNION ALL

  SELECT
  i.id,
  geo_cov_type.key AS geo_coverage_type,
  json_agg(regions_text.value) AS geo_coverage_values
  FROM initiative i
  JOIN jsonb_each_text(q24) geo_cov_type ON true
  JOIN jsonb_array_elements(q24_1) regions ON true
  JOIN jsonb_each_text(regions) regions_text ON true
  WHERE geo_cov_type.key = 'regional'
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key

  UNION ALL

  SELECT
  i.id,
  geo_cov_type.key AS geo_coverage_type,
  json_agg(c.iso_code) AS geo_coverage_value
  FROM initiative i
  JOIN jsonb_each_text(q24) geo_cov_type ON true
  JOIN jsonb_each_text(q24_2) countries ON true
  LEFT JOIN country c ON c.id = countries.key::int
  WHERE geo_cov_type.key = 'national' OR geo_cov_type.key = 'sub-national'
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key

  UNION ALL

  SELECT
  i.id,
  geo_cov_type.key AS geo_coverage_type,
  json_agg(c.iso_code) AS geo_coverage_value
  FROM initiative i
  JOIN jsonb_each_text(q24) geo_cov_type ON true
  JOIN jsonb_array_elements(q24_4) countries ON true
  JOIN jsonb_each_text(countries) countries_text ON true
  LEFT JOIN country c ON c.id = countries_text.key::int
  WHERE geo_cov_type.key = 'transnational'
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key;
--;; ----------------------------------------------

-- Data
CREATE VIEW v_initiative_data AS
  SELECT i.id,
      null AS uuid,
      null AS phase,
      i.q36 AS funds,
      i.q37 AS contribution,
      i.created,
      i.modified,
      TRIM('"' FROM q2::text) AS title,
      v_gc.geo_coverage_type,
      TRIM('"' FROM q3::text) AS summary,
      i.reviewed_at,
      i.reviewed_by,
      i.review_status,
      TRIM('"' FROM q41_1::text) AS url,
      null AS image,
      v_t.tags,
      v_gc.geo_coverage_values
  FROM initiative i
  LEFT JOIN v_initiative_tag as v_t ON i.id = v_t.id
  LEFT JOIN v_initiative_geo_coverage as v_gc ON i.id = v_gc.id
  ORDER BY i.created;
--;; ----------------------------------------------

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
