-- V Policy Filter
CREATE OR REPLACE VIEW public.v_policy
 AS
 SELECT 'policy'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(p.*) AS json
   FROM ((v_policy_data p
     LEFT JOIN v_policy_geo geo ON ((p.id = geo.id)))
     LEFT JOIN v_policy_search_text st ON ((p.id = st.id)))
  WHERE (p.review_status = 'APPROVED'::review_status)
  ORDER BY p.created;

-- V Project Filter
CREATE OR REPLACE VIEW public.v_project
 AS
SELECT pr.* FROM (
    SELECT 'project'::text AS topic,
    data.geo_coverage,
    data.search_text,
    data.json
    FROM ( SELECT cgc.country AS geo_coverage,
        vst.search_text,
        to_json(i.*) AS json
        FROM (((v_initiative_data i
                    LEFT JOIN v_initiative_search_text vst ON ((vst.id = i.id)))
                JOIN LATERAL json_array_elements(i.geo_coverage_values) gid(value) ON (true))
            LEFT JOIN country_group_country cgc ON (((to_jsonb(gid.value))::integer = cgc.country_group)))
        WHERE ((i.geo_coverage_type = 'regional'::text) OR (i.geo_coverage_type = 'global with elements in specific areas'::text))
        UNION ALL
        SELECT (to_jsonb(gid.value))::integer AS geo_coverage,
        vst.search_text,
        to_json(i.*) AS json
        FROM ((v_initiative_data i
                JOIN LATERAL json_array_elements(i.geo_coverage_values) gid(value) ON (true))
            LEFT JOIN v_initiative_search_text vst ON ((vst.id = i.id)))
        WHERE ((i.geo_coverage_type = 'national'::text) OR (i.geo_coverage_type = 'transnational'::text) OR (i.geo_coverage_type = 'sub-national'::text))
        UNION ALL
        SELECT 0 AS geo_coverage,
        st.search_text,
        to_json(i.*) AS json
        FROM (v_initiative_data i
            LEFT JOIN v_initiative_search_text st ON ((i.id = st.id)))
        WHERE (i.geo_coverage_type = 'global'::text)) data
    UNION ALL
    SELECT 'project'::text AS topic,
    data.geo_coverage,
    data.search_text,
    data.json
    FROM ( SELECT
        vg.geo_coverage,
        vt.search_text,
        to_json(p.*) AS json
        FROM ((v_project_data p
                LEFT JOIN v_project_search_text vt ON ((vt.id = p.id)))
            LEFT JOIN v_project_geo vg ON ((vg.id = p.id)))) data
) pr WHERE (pr.json->'review_status')::text = '"APPROVED"';

-- V Resource Filter
CREATE OR REPLACE VIEW public.v_resource
 AS
 SELECT replace(lower(r.type), ' '::text, '_'::text) AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(r.*) AS json
   FROM ((v_resource_data r
     LEFT JOIN v_resource_geo geo ON ((r.id = geo.id)))
     LEFT JOIN v_resource_search_text st ON ((r.id = st.id)))
  WHERE (r.type IS NOT NULL)
  AND (r.review_status = 'APPROVED'::review_status)
  ORDER BY r.created;

-- V Technology
CREATE OR REPLACE VIEW public.v_technology
 AS
 SELECT 'technology'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(t.*) AS json
   FROM ((v_technology_data t
     LEFT JOIN v_technology_geo geo ON ((t.id = geo.id)))
     LEFT JOIN v_technology_search_text st ON ((t.id = st.id)))
  WHERE (t.review_status = 'APPROVED'::review_status)
  ORDER BY t.created;
