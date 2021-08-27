-- Event
CREATE OR REPLACE VIEW public.v_event AS
 SELECT 'event'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(e.*) AS json
   FROM v_event_data e
     LEFT JOIN v_event_geo geo ON e.id = geo.id
     LEFT JOIN v_event_search_text st ON e.id = st.id
  WHERE e.review_status = 'APPROVED'::review_status
  ORDER BY e.created;

-- Policy
CREATE OR REPLACE VIEW public.v_policy AS
 SELECT 'policy'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(p.*) AS json
   FROM v_policy_data p
     LEFT JOIN v_policy_geo geo ON p.id = geo.id
     LEFT JOIN v_policy_search_text st ON p.id = st.id
  WHERE p.review_status = 'APPROVED'::review_status
  ORDER BY p.created;

-- Project
CREATE OR REPLACE VIEW public.v_project AS
 SELECT pr.topic,
    pr.geo_coverage,
    pr.search_text,
    pr.json
   FROM ( SELECT 'project'::text AS topic,
            data.geo_coverage,
            data.search_text,
            data.json
           FROM ( SELECT cgc.country AS geo_coverage,
                    vst.search_text,
                    to_json(i.*) AS json
                   FROM v_initiative_data i
                     LEFT JOIN v_initiative_search_text vst ON vst.id = i.id
                     JOIN LATERAL json_array_elements(i.geo_coverage_values) gid(value) ON true
                     LEFT JOIN country_group_country cgc ON to_jsonb(gid.value)::integer = cgc.country_group
                  WHERE i.geo_coverage_type = 'regional'::text OR i.geo_coverage_type = 'global with elements in specific areas'::text
                UNION ALL
                 SELECT to_jsonb(gid.value)::integer AS geo_coverage,
                    vst.search_text,
                    to_json(i.*) AS json
                   FROM v_initiative_data i
                     JOIN LATERAL json_array_elements(i.geo_coverage_values) gid(value) ON true
                     LEFT JOIN v_initiative_search_text vst ON vst.id = i.id
                  WHERE i.geo_coverage_type = 'national'::text OR i.geo_coverage_type = 'transnational'::text OR i.geo_coverage_type = 'sub-national'::text
                UNION ALL
                 SELECT 0 AS geo_coverage,
                    st.search_text,
                    to_json(i.*) AS json
                   FROM v_initiative_data i
                     LEFT JOIN v_initiative_search_text st ON i.id = st.id
                  WHERE i.geo_coverage_type = 'global'::text) data
        UNION ALL
         SELECT 'project'::text AS topic,
            data.geo_coverage,
            data.search_text,
            data.json
           FROM ( SELECT vg.geo_coverage,
                    vt.search_text,
                    to_json(p.*) AS json
                   FROM v_project_data p
                     LEFT JOIN v_project_search_text vt ON vt.id = p.id
                     LEFT JOIN v_project_geo vg ON vg.id = p.id) data) pr
  WHERE pr.json->>'review_status' = 'APPROVED'
  ORDER BY (pr.json->>'created')::timestamptz;

-- Resource
CREATE OR REPLACE VIEW public.v_resource AS
 SELECT replace(lower(r.type), ' '::text, '_'::text) AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(r.*) AS json
   FROM v_resource_data r
     LEFT JOIN v_resource_geo geo ON r.id = geo.id
     LEFT JOIN v_resource_search_text st ON r.id = st.id
  WHERE r.type IS NOT NULL AND r.review_status = 'APPROVED'::review_status
  ORDER BY r.created;

-- Technology
CREATE OR REPLACE VIEW public.v_technology AS
 SELECT 'technology'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(t.*) AS json
   FROM v_technology_data t
     LEFT JOIN v_technology_geo geo ON t.id = geo.id
     LEFT JOIN v_technology_search_text st ON t.id = st.id
  WHERE t.review_status = 'APPROVED'::review_status
  ORDER BY t.created;

-- Organisation
CREATE OR REPLACE VIEW public.v_organisation AS
 SELECT 'organisation'::text AS topic,
    geo.geo_coverage,
    ot.search_text,
    row_to_json(o.*) AS json
   FROM v_organisation_data o
     LEFT JOIN v_organisation_geo geo ON o.id = geo.id
     LEFT JOIN v_organisation_search_text ot ON o.id = ot.id
  WHERE o.review_status = 'APPROVED'::review_status;

-- Stakeholder
CREATE OR REPLACE VIEW public.v_stakeholder AS
 SELECT 'stakeholder'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(s.*) AS json
   FROM v_stakeholder_data s
     LEFT JOIN v_stakeholder_geo geo ON s.id = geo.id
     LEFT JOIN v_stakeholder_search_text st ON s.id = st.id
  WHERE s.review_status = 'APPROVED'::review_status
  ORDER BY s.created;

DROP VIEW IF EXISTS v_topic;
ALTER VIEW IF EXISTS v_topic_all RENAME TO v_topic;
