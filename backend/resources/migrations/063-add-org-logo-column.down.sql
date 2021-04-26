ALTER TABLE organisation DROP COLUMN logo;

DROP VIEW IF EXISTS v_organisation_data CASCADE;
CREATE VIEW v_organisation_data AS
 SELECT o.id,
    o.name,
    o.url,
    -- Remove the logo column
    o.type,
    o.country,
    o.geo_coverage_type,
    o.program,
    o.contribution,
    o.expertise,
    o.review_status,
    o.created_by,
    geo.geo_coverage_values
   FROM organisation o
     LEFT JOIN ( SELECT og.organisation,
            json_agg(COALESCE(c.iso_code, cg.name::bpchar)) AS geo_coverage_values
           FROM organisation_geo_coverage og
             LEFT JOIN country c ON og.country = c.id
             LEFT JOIN country_group cg ON og.country_group = cg.id
          GROUP BY og.organisation) geo ON o.id = geo.organisation;

-- Recreate the view, as before.
DROP VIEW IF EXISTS v_organisation CASCADE;
CREATE VIEW v_organisation AS
 SELECT 'organisation'::text AS topic,
    geo.geo_coverage_iso_code,
    ot.search_text,
    row_to_json(o.*) AS json
   FROM v_organisation_data o
     LEFT JOIN v_organisation_geo geo ON o.id = geo.id
     LEFT JOIN v_organisation_search_text ot ON o.id = ot.id
  WHERE o.review_status = 'APPROVED'::review_status;
-- ;;

-- # RECREATE TOPIC (no changes)
DROP VIEW IF EXISTS v_topic;
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
