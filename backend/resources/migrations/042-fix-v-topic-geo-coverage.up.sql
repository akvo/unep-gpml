DROP VIEW IF EXISTS v_topic;
DROP VIEW IF EXISTS v_project;
DROP VIEW IF EXISTS v_project_data;
DROP VIEW IF EXISTS v_stakeholder;
DROP VIEW IF EXISTS v_stakeholder_data;

-- # PROJECT
CREATE VIEW v_project_data AS
SELECT
  p.*,
  tag.tags,
  geo.geo_coverage_values
  FROM project p
  LEFT JOIN (
    SELECT pt.project, json_agg(t.tag) AS tags
    FROM project_tag pt JOIN tag t ON pt.tag = t.id
    GROUP BY pt.project
  ) tag on p.id = tag.project
  LEFT JOIN (
    SELECT pg.id,
    json_agg(pg.geo_coverage_iso_code) as geo_coverage_values
    FROM v_project_geo pg
    GROUP BY pg.id
  ) geo on p.id = geo.id
ORDER BY p.created;
-- ;;

CREATE VIEW v_project AS
SELECT 'project' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(p) AS json
FROM v_project_data p
LEFT JOIN v_project_geo AS geo ON p.id = geo.id
LEFT JOIN v_project_search_text st ON p.id = st.id
 ORDER BY p.created;
-- ;;

-- # STAKEHOLDER
CREATE VIEW v_stakeholder_data AS
SELECT
    s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
    s.email,
    s.linked_in,
    s.twitter,
    s.url,
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
    c.iso_code as country,
    geo.geo_coverage_values,
    row_to_json(o) as affiliation,
    tag.tags
    FROM stakeholder s
    LEFT JOIN (
        SELECT st.stakeholder, json_agg(t.tag) AS tags
        FROM stakeholder_tag st
        JOIN tag t ON st.tag = t.id
        GROUP BY st.stakeholder) tag ON s.id = tag.stakeholder
    LEFT JOIN (
        SELECT sg.stakeholder, json_agg(COALESCE(c.iso_code, cg.name::bpchar)) AS geo_coverage_values
        FROM stakeholder_geo_coverage sg
        LEFT JOIN country c ON sg.country = c.id
        LEFT JOIN country_group cg ON sg.country_group = cg.id
        GROUP BY sg.stakeholder) geo ON s.id = geo.stakeholder
    LEFT JOIN country c ON s.country = c.id
    LEFT JOIN organisation o ON s.affiliation = o.id
    ORDER BY s.created;
-- ;;

CREATE VIEW v_stakeholder AS
SELECT 'stakeholder' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(s) AS json
  FROM v_stakeholder_data s LEFT JOIN v_stakeholder_geo AS geo ON s.id = geo.id
  LEFT JOIN v_stakeholder_search_text st ON s.id = st.id
 WHERE s.review_status = 'APPROVED'
 ORDER BY s.created;
-- ;;

-- # RECREATE TOPIC

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
SELECT * FROM v_stakeholder
UNION ALL
SELECT * FROM v_organisation;
--;;
