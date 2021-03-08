--:name get-stakeholder-info :? :*
SELECT
    s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
    s.email,
    s.public_email,
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
    sr.email as reviewed_by,
    s.review_status,
    c.iso_code AS country,
    geo.geo_coverage_values,
    row_to_json(o.*) AS affiliation,
    tag.tags,
    association.associations
    FROM ((((
        stakeholder s
        LEFT JOIN (
            SELECT vsa.stakeholder, json_agg(vsa.*) AS associations
            FROM v_stakeholder_association vsa
            GROUP BY vsa.stakeholder
        ) association ON ((s.id = association.stakeholder))
        LEFT JOIN (
             SELECT st.stakeholder,
                    json_agg(t.*) AS tags
             FROM (stakeholder_tag st JOIN (
                 SELECT tg.id,
                        tg.tag,
                        tc.category FROM tag tg
                 LEFT JOIN tag_category tc
                 ON tg.tag_category = tc.id) t ON ((st.tag = t.id)))
             GROUP BY st.stakeholder) tag ON ((s.id = tag.stakeholder)))
        LEFT JOIN (
            SELECT sg.stakeholder,
            json_agg(COALESCE(c_1.iso_code, (cg.name)::bpchar)) AS geo_coverage_values
            FROM ((stakeholder_geo_coverage sg
                   LEFT JOIN country c_1 ON ((sg.country = c_1.id)))
                  LEFT JOIN country_group cg ON ((sg.country_group = cg.id)))
            GROUP BY sg.stakeholder) geo ON ((s.id = geo.stakeholder)))
    LEFT JOIN country c ON ((s.country = c.id)))
    LEFT JOIN organisation o ON ((s.affiliation = o.id)))
LEFT JOIN stakeholder sr ON s.reviewed_by = sr.id
ORDER BY s.created;


--:name get-topic-by-id :? :1
SELECT row_to_json(t.*) AS json FROM :i:v_topic_data t WHERE id = :id
