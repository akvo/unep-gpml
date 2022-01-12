CREATE VIEW v_organisation AS
SELECT 'organisation'::text AS topic,
    geo.geo_coverage,
    ot.search_text,
    row_to_json(o.*) AS json
FROM ((v_organisation_data o
    LEFT JOIN v_organisation_geo geo ON ((o.id = geo.id)))
    LEFT JOIN v_organisation_search_text ot ON ((o.id = ot.id)))
WHERE (o.review_status = 'APPROVED'::review_status);