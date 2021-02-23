DROP VIEW IF EXISTS v_topic;
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
        GROUP BY og.organisation) geo ON ((o.id = geo.organisation)))
WHERE o.review_status = 'APPROVED';
-- ;;

CREATE VIEW v_organisation AS
SELECT 'organisation'::text AS topic,
    geo.geo_coverage_iso_code,
    ot.search_text,
    row_to_json(o) AS json
FROM (v_organisation_data o
        LEFT JOIN v_organisation_geo AS geo ON ((o.id = geo.id))
        LEFT JOIN v_organisation_search_text ot ON ((o.id = ot.id)));
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
SELECT * FROM v_stakeholder
UNION ALL
SELECT * FROM v_organisation;
--;;
