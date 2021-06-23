DROP VIEW IF EXISTS v_topic;
DROP VIEW IF EXISTS v_stakeholder;
DROP VIEW IF EXISTS v_stakeholder_data;

-- v_stakeholder_data
CREATE VIEW v_stakeholder_data AS
 SELECT s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
        CASE
            WHEN s.public_email = true THEN s.email
            ELSE ''::text
        END AS email,
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
    s.country,
    -- ADDED organisation_role
    s.organisation_role,
    geo.geo_coverage_values,
    row_to_json(o.*) AS affiliation,
    tag.tags
   FROM stakeholder s
     LEFT JOIN ( SELECT st.stakeholder,
            json_agg(t.tag) AS tags
           FROM stakeholder_tag st
             JOIN tag t ON st.tag = t.id
          GROUP BY st.stakeholder) tag ON s.id = tag.stakeholder
     LEFT JOIN ( SELECT sg.stakeholder,
            json_agg(COALESCE(sg.country, sg.country_group, 0)) AS geo_coverage_values
           FROM stakeholder_geo_coverage sg
          GROUP BY sg.stakeholder) geo ON s.id = geo.stakeholder
     LEFT JOIN organisation o ON s.affiliation = o.id
  ORDER BY s.created;


-- v_stakeholder
CREATE VIEW v_stakeholder AS
SELECT 'stakeholder'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(s.*) AS json
FROM ((v_stakeholder_data s
    LEFT JOIN v_stakeholder_geo geo ON ((s.id = geo.id)))
    LEFT JOIN v_stakeholder_search_text st ON ((s.id = st.id)))
WHERE (s.review_status = 'APPROVED'::review_status)
ORDER BY s.created;


-- v_topic
CREATE VIEW v_topic AS
SELECT * FROM v_event
UNION ALL
SELECT * FROM v_policy
UNION ALL
SELECT * FROM v_project
UNION ALL
SELECT * FROM v_resource
UNION ALL
SELECT * FROM v_technology
UNION ALL
SELECT * FROM v_organisation
UNION ALL
SELECT * FROM v_stakeholder;
