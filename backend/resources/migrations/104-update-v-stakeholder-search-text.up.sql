 CREATE OR REPLACE VIEW public.v_stakeholder_search_text AS
  SELECT stakeholder.id,
    to_tsvector('english'::regconfig, ((COALESCE(stakeholder.first_name, ''::text) || ' '::text) || (COALESCE(stakeholder.last_name, ''::text)) || ' '::text) || (COALESCE(stakeholder.about, ''::text) || ' '::text)) AS search_text
    FROM public.stakeholder
   ORDER BY stakeholder.created;
ALTER TABLE public.v_stakeholder_search_text OWNER TO unep;
