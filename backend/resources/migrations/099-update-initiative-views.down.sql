--- v_initiative_tag --- treat tags as an array of objects instead of arrray of texts
CREATE OR REPLACE VIEW v_initiative_tag AS
  SELECT i.id, json_agg(tag_text) AS tags
  FROM initiative i
  JOIN jsonb_array_elements(q32) tag_elements ON true
  JOIN jsonb_each_text(tag_elements) tag_text ON true
  GROUP BY i.id;

--- v_initiative_data refresh relation with v_initiative_tag
CREATE OR REPLACE VIEW v_initiative_data AS
 SELECT i.id,
    NULL::text AS uuid,
    NULL::text AS phase,
    i.q36 AS funds,
    i.q37 AS contribution,
    i.created,
    i.modified,
    btrim(i.q2::text, '"'::text) AS title,
    v_gc.geo_coverage_type,
    btrim(i.q3::text, '"'::text) AS summary,
    i.reviewed_at,
    i.reviewed_by,
    i.review_status,
    btrim(i.q41_1::text, '"'::text) AS url,
    NULL::text AS image,
    -- Changed tags to [tag, ...] from [{id: tag}, ...]
    v_t.tags,
    v_gc.geo_coverage_values
   FROM initiative i
     LEFT JOIN v_initiative_tag v_t ON i.id = v_t.id
     LEFT JOIN v_initiative_geo_coverage v_gc ON i.id = v_gc.id
  ORDER BY i.created;


--- v_initiative_geo_coverage  --- transnational values are also an array of objects
CREATE OR REPLACE VIEW public.v_initiative_geo_coverage
 AS
 SELECT i.id,
    lower(geo_cov_type.key) AS geo_coverage_type,
    NULL::json AS geo_coverage_values
   FROM (initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
  WHERE (geo_cov_type.key = 'global'::text)
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
 SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(cg.id) AS geo_coverage_values
   FROM ((((initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
     JOIN LATERAL jsonb_array_elements(i.q24_1) regions(value) ON (true))
     JOIN LATERAL jsonb_each_text(regions.value) regions_text(key, value) ON (true))
     LEFT JOIN country_group cg ON ((regions_text.value = cg.name)))
  WHERE (geo_cov_type.key = 'regional'::text)
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
 SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(cg.id) AS geo_coverage_values
   FROM ((((initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
     JOIN LATERAL jsonb_array_elements(i.q24_5) regions(value) ON (true))
     JOIN LATERAL jsonb_each_text(regions.value) regions_text(key, value) ON (true))
     LEFT JOIN country_group cg ON ((regions_text.value = cg.name)))
  WHERE (geo_cov_type.key = 'global with elements in specific areas'::text)
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
 SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(c.id) AS geo_coverage_values
   FROM (((initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
     JOIN LATERAL jsonb_each_text(i.q24_2) countries(key, value) ON (true))
     LEFT JOIN country c ON ((c.id = (countries.key)::integer)))
  WHERE (geo_cov_type.key = 'national'::text)
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
 SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(c.id) AS geo_coverage_values
   FROM (((initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
     JOIN LATERAL jsonb_each_text(i.q24_3) countries(key, value) ON (true))
     LEFT JOIN country c ON ((c.id = (countries.key)::integer)))
  WHERE (geo_cov_type.key = 'sub-national'::text)
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key
UNION ALL
 SELECT i.id,
    geo_cov_type.key AS geo_coverage_type,
    json_agg(cg.id) AS geo_coverage_values
   FROM (((initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
     JOIN LATERAL jsonb_each_text(i.q24_4) transnationals(key, value) ON (true))
     LEFT JOIN country_group cg ON ((cg.id = (transnationals.key)::integer)))
  WHERE (geo_cov_type.key = 'transnational'::text)
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key;

ALTER TABLE public.v_initiative_geo_coverage
    OWNER TO unep;



--- v_project
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
                     LEFT JOIN v_project_geo vg ON vg.id = p.id) data) pr;

--- refresh v_topic view with same relations
CREATE OR REPLACE VIEW v_topic AS
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
