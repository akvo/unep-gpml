-- Uniform the data for q24
UPDATE initiative i SET
q24 = to_jsonb(d.json)
FROM (
    SELECT id, json_build_object(LOWER(geo_cov_type.key),geo_cov_type.value) as json
    FROM initiative ii
    JOIN LATERAL jsonb_each_text(ii.q24) geo_cov_type(key, value) ON (true)) d
WHERE i.id = d.id;

-- Fix View Table
CREATE OR REPLACE VIEW public.v_initiative_geo_coverage
 AS
 SELECT i.id,
    lower(geo_cov_type.key) AS geo_coverage_type,
    NULL::json AS geo_coverage_values
   FROM (initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
  WHERE (geo_cov_type.key = 'Global'::text)
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
    json_agg(c.id) AS geo_coverage_values
   FROM ((((initiative i
     JOIN LATERAL jsonb_each_text(i.q24) geo_cov_type(key, value) ON (true))
     JOIN LATERAL jsonb_array_elements(i.q24_4) countries(value) ON (true))
     JOIN LATERAL jsonb_each_text(countries.value) countries_text(key, value) ON (true))
     LEFT JOIN country c ON ((c.id = (countries_text.key)::integer)))
  WHERE (geo_cov_type.key = 'transnational'::text)
  GROUP BY i.id, geo_cov_type.value, geo_cov_type.key;

ALTER TABLE public.v_initiative_geo_coverage
    OWNER TO unep;
