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
