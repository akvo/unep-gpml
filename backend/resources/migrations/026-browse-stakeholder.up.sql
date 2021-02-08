DROP VIEW IF EXISTS v_stakeholder_data CASCADE;
CREATE OR REPLACE VIEW v_stakeholder_data AS
 SELECT s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
    s.affiliation,
    s.email,
    s.linked_in,
    s.twitter,
    s.url,
    s.country,
    s.representation,
    s.about,
    s.geo_coverage_type,
    s.created,
    s.modified,
    s.reviewed_at,
    s.role,
    s.cv,
    s.reviewed_by,
    s.review_status,
    geo.geo_coverage_values,
    tag.tags
   FROM stakeholder s
     LEFT JOIN ( SELECT st.stakeholder,
            json_agg(t.tag) AS tags
           FROM stakeholder_tag st
             JOIN tag t ON st.tag = t.id
          GROUP BY st.stakeholder) tag ON s.id = tag.stakeholder
     LEFT JOIN ( SELECT sg.stakeholder,
            json_agg(COALESCE(c.iso_code, cg.name::bpchar)) AS geo_coverage_values
           FROM stakeholder_geo_coverage sg
             LEFT JOIN country c ON sg.country = c.id
             LEFT JOIN country_group cg ON sg.country_group = cg.id
          GROUP BY sg.stakeholder) geo ON s.id = geo.stakeholder
  ORDER BY s.created;
-- ;;

CREATE OR REPLACE VIEW v_stakeholder AS
SELECT 'stakeholder' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(s) AS json
  FROM v_stakeholder_data s LEFT JOIN v_stakeholder_geo AS geo ON s.id = geo.id
  LEFT JOIN v_stakeholder_search_text st ON s.id = st.id
 WHERE s.review_status = 'APPROVED'
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
SELECT * FROM v_project
UNION ALL
SELECT * FROM v_stakeholder;
--;;
