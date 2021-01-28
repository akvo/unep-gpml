CREATE OR REPLACE VIEW v_resource AS
 SELECT 'resource' AS topic,
    geo.geo_coverage_iso_code,
    st.search_text,
    row_to_json(r.*) AS json
   FROM v_resource_data r
     LEFT JOIN v_resource_geo geo ON r.id = geo.id
     LEFT JOIN v_resource_search_text st ON r.id = st.id
  WHERE r.type IS NOT NULL
  ORDER BY r.created;
