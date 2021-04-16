DROP VIEW IF EXISTS v_topic;
DROP VIEW IF EXISTS v_stakeholder;
DROP VIEW IF EXISTS v_stakeholder_data;
DROP VIEW IF EXISTS v_organisation;
DROP VIEW IF EXISTS v_organisation_data;

CREATE VIEW v_organisation_data AS
SELECT
    o.*,
    geo.geo_coverage_values
FROM (organisation o
    LEFT JOIN ( SELECT og.organisation,
        json_agg(COALESCE(c.iso_code, (cg.name)::bpchar)) AS geo_coverage_values
        FROM ((organisation_geo_coverage og
                LEFT JOIN country c ON ((og.country = c.id)))
            LEFT JOIN country_group cg ON ((og.country_group = cg.id)))
        GROUP BY og.organisation) geo ON ((o.id = geo.organisation)));
-- ;;

CREATE VIEW v_organisation AS
SELECT 'organisation'::text AS topic,
    geo.geo_coverage_iso_code,
    ot.search_text,
    row_to_json(o) AS json
FROM (v_organisation_data o
        LEFT JOIN v_organisation_geo AS geo ON ((o.id = geo.id))
        LEFT JOIN v_organisation_search_text ot ON ((o.id = ot.id)))
WHERE o.review_status = 'APPROVED';
-- ;;

CREATE VIEW v_stakeholder_data AS
SELECT s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
    (CASE WHEN s.public_email=true THEN s.email ELSE ''  END) AS email,
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
    s.public_email,
    c.iso_code AS country,
    geo.geo_coverage_values,
    row_to_json(o.*) AS affiliation,
    tag.tags
FROM ((((stakeholder s
    LEFT JOIN (
        SELECT st.stakeholder, json_agg(t.tag) AS tags
        FROM (stakeholder_tag st
            JOIN tag t ON ((st.tag = t.id)))
        GROUP BY st.stakeholder) tag ON ((s.id = tag.stakeholder)))
    LEFT JOIN (
        SELECT sg.stakeholder, json_agg(COALESCE(c_1.iso_code, (cg.name)::bpchar)) AS geo_coverage_values
       FROM ((stakeholder_geo_coverage sg
         LEFT JOIN country c_1 ON ((sg.country = c_1.id)))
         LEFT JOIN country_group cg ON ((sg.country_group = cg.id)))
      GROUP BY sg.stakeholder) geo ON ((s.id = geo.stakeholder)))
    LEFT JOIN country c ON ((s.country = c.id)))
    LEFT JOIN organisation o ON ((s.affiliation = o.id)))
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
