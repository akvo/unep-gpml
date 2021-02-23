--- # Organisation
CREATE VIEW v_organisation_geo AS
SELECT o.id, country.iso_code AS geo_coverage_iso_code
    FROM organisation o LEFT JOIN organisation_geo_coverage geo ON o.id = geo.organisation
    LEFT JOIN country_group_country cgc ON geo.country_group = cgc.country_group
    LEFT JOIN country ON cgc.country = country.id
WHERE (
    o.geo_coverage_type = 'regional' OR o.geo_coverage_type = 'global with elements in specific areas'
    AND o.review_status = 'APPROVED'
)
UNION ALL
SELECT o.id, country.iso_code AS geo_coverage_iso_code
    FROM organisation o LEFT JOIN organisation_geo_coverage geo ON o.id = geo.organisation
    LEFT join country ON geo.country = country.id
WHERE (
    o.geo_coverage_type = 'national'
    OR o.geo_coverage_type = 'transnational'
    OR o.geo_coverage_type = 'sub-national'
    AND o.review_status = 'APPROVED'
)
UNION ALL
SELECT id, '***' AS geo_coverage_iso_code
FROM organisation o
WHERE geo_coverage_type = 'global'
AND o.review_status = 'APPROVED';
-- ;;

CREATE VIEW v_organisation_search_text AS
SELECT id, to_tsvector('english', coalesce(name, '')    || ' ' || coalesce(program, '') || '' || coalesce(contribution, '')  || '' || coalesce(expertise, ''))
AS search_text
FROM organisation
WHERE review_status = 'APPROVED';
-- ;;

CREATE VIEW v_organisation_data AS
SELECT
    o.id,
    o.name,
    o.url,
    o.type,
    o.country,
    o.program,
    o.contribution,
    o.expertise,
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
