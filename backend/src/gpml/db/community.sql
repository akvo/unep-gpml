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
	o.logo_id AS picture_id,
	o.created,
	NULL AS affiliation,
	o.type AS representative_group,
	json_agg(json_build_object(t.id, t.tag)) FILTER (WHERE t.id IS NOT NULL) AS tags,
	o.review_status,
	TRIM(LOWER(CONCAT_WS(' ', COALESCE(o.name, ''), COALESCE(o.program, ''), COALESCE(o.contribution, ''), COALESCE(o.expertise, '')))) AS search_text,
	o.is_member,
	NULL AS job_title,
	json_agg(COALESCE(ogc.country, cgc.country)) AS geo_coverage_values,
	jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL) AS files,
	COALESCE(jsonb_agg(
	  DISTINCT jsonb_build_object(
	    'badge_id', ob.badge_id,
	    'badge_name', b.name,
	    'organisation_id', ob.organisation_id,
	    'assigned_by', ob.assigned_by,
	    'assigned_at', ob.assigned_at)
	) FILTER (WHERE ob.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM
	organisation o
	LEFT JOIN organisation_tag ot ON o.id = ot.organisation
	LEFT JOIN tag t ON ot.tag = t.id
	LEFT JOIN organisation_geo_coverage ogc ON o.id = ogc.organisation
	LEFT JOIN country_group_country cgc ON ogc.country_group = cgc.country_group
	LEFT JOIN file f ON o.logo_id = f.id
	LEFT JOIN organisation_badge ob ON ob.organisation_id = o.id
	LEFT JOIN badge b ON b.id = ob.badge_id
    GROUP BY
	o.id
    UNION ALL
    SELECT
	s.id,
	s.first_name || ' ' || last_name AS name,
	'stakeholder' AS type,
	s.country,
	s.geo_coverage_type,
	s.picture_id,
	s.created,
	row_to_json(a.*) AS affiliation,
	NULL AS representative_group,
	json_agg(json_build_object(t.id, t.tag)) FILTER (WHERE t.id IS NOT NULL) AS tags,
	s.review_status,
	TRIM(LOWER(CONCAT_WS(' ', COALESCE(s.first_name, ''), COALESCE(s.last_name, '')))) AS search_text,
	NULL as is_member,
	s.job_title,
	array_to_json(array[s.country]) as geo_coverage_values,
	jsonb_agg(DISTINCT jsonb_build_object('id', f.id, 'object-key', f.object_key, 'visibility', f.visibility)) FILTER (WHERE f.id IS NOT NULL) AS files,
	COALESCE(jsonb_agg(
	  DISTINCT jsonb_build_object(
	    'badge_id', sb.badge_id,
	    'badge_name', b.name,
	    'stakeholder_id', sb.stakeholder_id,
	    'assigned_by', sb.assigned_by,
	    'assigned_at', sb.assigned_at)
	) FILTER (WHERE sb.badge_id IS NOT NULL), '[]'::jsonb) AS assigned_badges
    FROM
	stakeholder s
	LEFT JOIN organisation a ON s.affiliation = a.id
	LEFT JOIN stakeholder_tag st ON s.id = st.stakeholder
	LEFT JOIN tag t ON st.tag = t.id
	LEFT JOIN file f ON s.picture_id = f.id
	LEFT JOIN stakeholder_badge sb ON sb.stakeholder_id = s.id
	LEFT JOIN badge b ON b.id = sb.badge_id
    GROUP BY
	s.id,
	a.*
)
--~ (#'gpml.db.community/get-community-members-query-and-filters params)
