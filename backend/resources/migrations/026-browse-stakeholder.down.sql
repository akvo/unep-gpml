DROP VIEW IF EXISTS v_stakeholder_data CASCADE;
DROP VIEW IF EXISTS v_stakeholder CASCADE;
CREATE VIEW v_stakeholder AS
SELECT 'stakeholder' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(s) AS json
  FROM stakeholder s LEFT JOIN v_stakeholder_geo AS geo ON s.id = geo.id
  LEFT JOIN v_stakeholder_search_text st ON s.id = st.id
 ORDER BY s.created;
-- ;;

--- # ALL
CREATE OR REPLACE VIEW v_topic AS
SELECT * FROM v_event
UNION ALL
SELECT * FROM v_policy
UNION ALL
SELECT * FROM v_resource
UNION ALL
SELECT * FROM v_technology
UNION ALL
SELECT * FROM v_project;
--;;
