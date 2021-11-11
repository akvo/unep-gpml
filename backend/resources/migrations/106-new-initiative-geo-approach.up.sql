-- follow same external geo table for initiatives
CREATE TABLE initiative_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  initiative integer NOT NULL REFERENCES initiative(id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE initiative_geo_coverage
ADD CONSTRAINT check_country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);


-- update v_initative_data to use initiative_geo_coverage

 CREATE OR REPLACE VIEW public.v_initiative_data AS
  SELECT i.id,
     NULL::text AS uuid,
     NULL::text AS phase,
     i.q36 AS funds,
     i.q37 AS contribution,
     i.created,
     i.modified,
     btrim((i.q2)::text, '"'::text) AS title,
     jsonb_object_keys(i.q24) AS geo_coverage_type,
     btrim((i.q3)::text, '"'::text) AS summary,
     i.reviewed_at,
     i.reviewed_by,
     i.review_status,
     btrim((i.q41_1)::text, '"'::text) AS url,
     NULL::text AS image,
     v_t.tags,
     geo.geo_coverage_values,
     geo.geo_coverage_country_groups,
     geo.geo_coverage_countries

    FROM (((public.initiative i
      LEFT JOIN public.v_initiative_tag v_t ON ((i.id = v_t.id)))

      LEFT JOIN ( SELECT ig.initiative,
               json_agg(COALESCE(ig.country_group, 0)) FILTER (WHERE ig.country_group IS NOT NULL) AS geo_coverage_country_groups,
               json_agg(COALESCE(ig.country, 0)) FILTER (WHERE ig.country IS NOT NULL) AS geo_coverage_countries,
               json_agg(COALESCE(ig.country, ig.country_group, 0)) AS geo_coverage_values
            FROM public.initiative_geo_coverage ig
           GROUP BY ig.initiative) geo ON ((i.id = geo.initiative)))


 )
   ORDER BY i.created;


-- follow same approach to extract countries based on initiative geo values

 CREATE OR REPLACE VIEW public.v_initiative_geo AS
  SELECT i.id,
     COALESCE(cgc.country, igc.country) AS geo_coverage
    FROM ((public.initiative i
      LEFT JOIN public.initiative_geo_coverage igc ON ((i.id = igc.initiative)))
      LEFT JOIN public.country_group_country cgc ON ((cgc.country_group = igc.country_group)))
   WHERE (i.q24->>'global' IS NULL)
 UNION ALL
  SELECT i.id,
     0 AS geo_coverage
    FROM public.initiative i
   WHERE (i.q24->>'global' IS NOT NULL);


--- update v_project view
 CREATE OR REPLACE VIEW public.v_project AS
  SELECT 'project'::text AS topic,
     geo.geo_coverage,
     st.search_text,
     row_to_json(i.*) AS json
    FROM ((public.v_initiative_data i
      LEFT JOIN public.v_initiative_geo geo ON ((i.id = geo.id)))
      LEFT JOIN public.v_initiative_search_text st ON ((i.id = st.id)));
