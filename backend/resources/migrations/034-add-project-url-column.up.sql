ALTER TABLE project ADD COLUMN url text;

DROP VIEW IF EXISTS v_topic;
DROP VIEW IF EXISTS v_project CASCADE;
DROP VIEW IF EXISTS v_project_data CASCADE;
DROP VIEW IF EXISTS v_project_geo CASCADE;
DROP VIEW IF EXISTS v_project_search_text CASCADE;

-- # views for /browse

CREATE VIEW v_project_geo AS
SELECT p.id, country.iso_code AS geo_coverage_iso_code
  FROM project p LEFT JOIN project_country geo ON p.id = geo.project
  LEFT JOIN country ON geo.country = country.id
-- FIXME: Can remove the is NULL check when we actually populate the field
WHERE (p.geo_coverage_type = 'national' OR p.geo_coverage_type = 'transnational' OR p.geo_coverage_type = 'sub-national')
UNION ALL
SELECT id, '***' AS geo_coverage_iso_code
 FROM project p WHERE geo_coverage_type = 'global';
--;;

-- # views for /browse
CREATE VIEW v_project_data AS
SELECT p.*, tag.tags
  FROM project p
  LEFT JOIN (
       SELECT pt.project, json_agg(t.tag) AS tags
         FROM project_tag pt JOIN tag t ON pt.tag = t.id
        GROUP BY pt.project
  ) tag on p.id = tag.project
ORDER BY p.created;
-- ;;

CREATE VIEW v_project_search_text AS
SELECT id, to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '')) AS search_text
  FROM project
 ORDER BY created;
-- ;;

CREATE VIEW v_project AS
SELECT 'project' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(p) AS json
  FROM v_project_data p LEFT JOIN v_project_geo AS geo ON p.id = geo.id
  LEFT JOIN v_project_search_text st ON p.id = st.id
 ORDER BY p.created;
-- ;;

CREATE VIEW v_topic AS
SELECT * FROM v_event
UNION ALL
SELECT * FROM v_policy
UNION ALL
SELECT * FROM v_resource
UNION ALL
SELECT * FROM v_technology
UNION ALL
SELECT * FROM v_project
UNION ALL
SELECT * FROM v_stakeholder;
--;;
