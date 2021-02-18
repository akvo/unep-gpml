SELECT
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
    r.email as reviewed_by,
    s.review_status,
    s.geo_coverage_values,
    s.tags,
    o.name as organisation,
    c.name as country,
    sa.associations
FROM (v_stakeholder_data s
    LEFT JOIN country c ON s.country = c.id
    LEFT JOIN organisation o ON s.affiliation = o.id
    LEFT JOIN stakeholder r ON s.id = r.id
    LEFT JOIN (
        SELECT sa.stakeholder, json_agg(sa.*) AS associations
        FROM v_stakeholder_association sa
        GROUP BY sa.stakeholder) sa ON (s.id = sa.stakeholder)
)
