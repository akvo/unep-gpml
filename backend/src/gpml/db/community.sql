-- :name get-community-members :? :*
/* :require [clojure.string :as s]
            [gpml.db.community]
*/
WITH
community_members AS (
    SELECT
        o.id,
        o.name,
        'organisation' AS type,
        o.country,
        o.geo_coverage_type,
        o.logo AS picture,
        o.created,
        NULL AS affiliation,
        o.type AS representative_group,
        json_agg(json_build_object(COALESCE(t.id, 0), t.tag)) AS tags,
        o.review_status,
        to_tsvector('english'::regconfig, COALESCE(o.name, '') || ' ' || COALESCE(o.program, '') || ' ' || COALESCE(o.contribution, '') || ' ' || COALESCE(o.expertise, '')) AS search_text,
        o.is_member,
        NULL AS job_title,
        json_agg(COALESCE(ogc.country, cgc.country)) AS geo_coverage_values
    FROM
        organisation o
        LEFT JOIN organisation_tag ot ON o.id = ot.organisation
        LEFT JOIN tag t ON ot.tag = t.id
        LEFT JOIN organisation_geo_coverage ogc ON o.id = ogc.organisation
        LEFT JOIN country_group_country cgc ON ogc.country_group = cgc.country_group
    GROUP BY
        o.id
    UNION ALL
    SELECT
        s.id,
        s.first_name || ' ' || last_name AS name,
        'stakeholder' AS type,
        s.country,
        s.geo_coverage_type,
        s.picture,
        s.created,
        row_to_json(a.*) AS affiliation,
        s.representation AS representative_group,
        json_agg(json_build_object(COALESCE(t.id, 0), t.tag)) AS tags,
        s.review_status,
        to_tsvector('english'::regconfig, COALESCE(s.first_name, '') || ' ' || COALESCE(s.last_name, '') || ' ' || COALESCE(s.about, '')) AS search_text,
        NULL as is_member,
        s.job_title,
        array_to_json(array[s.country]) as geo_coverage_values
    FROM
        stakeholder s
        LEFT JOIN organisation a ON s.affiliation = a.id
        LEFT JOIN stakeholder_tag st ON s.id = st.stakeholder
        LEFT JOIN tag t ON st.tag = t.id
    GROUP BY
        s.id,
        a.*
)
--~ (#'gpml.db.community/get-community-members-query-and-filters params)
