CREATE OR REPLACE VIEW public.v_organisation AS
 SELECT 'organisation'::text AS topic,
    geo.geo_coverage,
    ot.search_text,
    row_to_json(o.*) AS json
   FROM ((public.v_organisation_data o
     LEFT JOIN public.v_organisation_geo geo ON ((o.id = geo.id)))
     LEFT JOIN public.v_organisation_search_text ot ON ((o.id = ot.id)));
