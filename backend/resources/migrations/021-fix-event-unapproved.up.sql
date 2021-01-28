CREATE OR REPLACE VIEW v_event AS
SELECT 'event' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(e) AS json
  FROM v_event_data e LEFT JOIN v_event_geo AS geo ON e.id = geo.id
  LEFT JOIN v_event_search_text st ON e.id = st.id
 WHERE e.approved_at IS NOT NULL
 ORDER BY e.created;
-- ;;
