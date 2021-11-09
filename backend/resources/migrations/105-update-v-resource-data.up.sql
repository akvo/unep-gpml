CREATE OR REPLACE VIEW public.v_technology_data AS
 SELECT t.id,
    t.name,
    t.year_founded,
    t.country,
    t.organisation_type,
    t.development_stage,
    t.specifications_provided,
    t.email,
    t.geo_coverage_type,
    t.attachments,
    t.remarks,
    t.created,
    t.modified,
    t.reviewed_at,
    t.reviewed_by,
    t.review_status,
    t.url,
    t.image,
    t.logo,
    t.created_by,
    geo.geo_coverage_values,
    lang.languages,
    tag.tags,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries
   FROM (((public.technology t
     LEFT JOIN ( SELECT tlu.technology,
            json_agg(json_build_object('url', tlu.url, 'iso_code', l.iso_code)) AS languages
           FROM (public.technology_language_url tlu
             JOIN public.language l ON ((tlu.language = l.id)))
          GROUP BY tlu.technology) lang ON ((t.id = lang.technology)))
     LEFT JOIN ( SELECT tt.technology,
            json_agg(json_build_object(t_1.id, t_1.tag)) AS tags
           FROM (public.technology_tag tt
             JOIN public.tag t_1 ON ((tt.tag = t_1.id)))
          GROUP BY tt.technology) tag ON ((t.id = tag.technology)))
     LEFT JOIN ( SELECT tg.technology,
            json_agg(COALESCE(tg.country_group, 0)) FILTER (WHERE tg.country_group IS NOT NULL) AS geo_coverage_country_groups,
            json_agg(COALESCE(tg.country, 0)) FILTER (WHERE tg.country IS NOT NULL) AS geo_coverage_countries,
            json_agg(COALESCE(tg.country, tg.country_group, 0)) AS geo_coverage_values
           FROM public.technology_geo_coverage tg
          GROUP BY tg.technology) geo ON ((t.id = geo.technology)))
  ORDER BY t.created;


CREATE OR REPLACE VIEW public.v_policy_data AS
 SELECT p.id,
    p.title,
    p.original_title,
    p.data_source,
    p.country,
    p.abstract,
    p.type_of_law,
    p.record_number,
    p.first_publication_date,
    p.latest_amendment_date,
    p.status,
    p.geo_coverage_type,
    p.attachments,
    p.remarks,
    p.created,
    p.modified,
    p.implementing_mea,
    p.reviewed_at,
    p.reviewed_by,
    p.review_status,
    p.url,
    p.image,
    p.created_by,
    geo.geo_coverage_values,
    lang.languages,
    tag.tags,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries
   FROM (((public.policy p
     LEFT JOIN ( SELECT plu.policy,
            json_agg(json_build_object('url', plu.url, 'iso_code', l.iso_code)) AS languages
           FROM (public.policy_language_url plu
             JOIN public.language l ON ((plu.language = l.id)))
          GROUP BY plu.policy) lang ON ((p.id = lang.policy)))
     LEFT JOIN ( SELECT pt.policy,
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM (public.policy_tag pt
             JOIN public.tag t ON ((pt.tag = t.id)))
          GROUP BY pt.policy) tag ON ((p.id = tag.policy)))
     LEFT JOIN ( SELECT pg.policy,
            json_agg(COALESCE(pg.country_group, 0)) FILTER (WHERE pg.country_group IS NOT NULL) AS geo_coverage_country_groups,
            json_agg(COALESCE(pg.country, 0)) FILTER (WHERE pg.country IS NOT NULL) AS geo_coverage_countries,
            json_agg(COALESCE(pg.country, pg.country_group, 0)) AS geo_coverage_values
           FROM public.policy_geo_coverage pg
          GROUP BY pg.policy) geo ON ((p.id = geo.policy)))
  ORDER BY p.created;



CREATE OR REPLACE VIEW public.v_event_data AS
 SELECT e.id,
    e.title,
    e.start_date,
    e.end_date,
    e.description,
    e.image,
    e.country,
    e.city,
    e.geo_coverage_type,
    geo.geo_coverage_values,
    e.remarks,
    e.created,
    e.modified,
    e.reviewed_at,
    e.reviewed_by,
    e.review_status,
    lang.languages,
    tag.tags,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries
   FROM (((public.event e
     LEFT JOIN ( SELECT elu.event,
            json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
           FROM (public.event_language_url elu
             JOIN public.language l ON ((elu.language = l.id)))
          GROUP BY elu.event) lang ON ((e.id = lang.event)))
     LEFT JOIN ( SELECT et.event,
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM (public.event_tag et
             JOIN public.tag t ON ((et.tag = t.id)))
          GROUP BY et.event) tag ON ((e.id = tag.event)))
     LEFT JOIN ( SELECT eg.event,
             json_agg(COALESCE(eg.country_group, 0)) FILTER (WHERE eg.country_group IS NOT NULL) AS geo_coverage_country_groups,
             json_agg(COALESCE(eg.country, 0)) FILTER (WHERE eg.country IS NOT NULL) AS geo_coverage_countries,
             json_agg(COALESCE(eg.country, eg.country_group, 0)) AS geo_coverage_values
           FROM public.event_geo_coverage eg
          GROUP BY eg.event) geo ON ((e.id = geo.event)))
  ORDER BY e.created;


CREATE OR REPLACE VIEW public.v_resource_data AS
SELECT r.id,
   r.title,
   r.type,
   r.publish_year,
   r.summary,
   r.value,
   r.image,
   r.geo_coverage_type,
   r.attachments,
   r.remarks,
   r.created,
   r.modified,
   r.country,
   r.valid_from,
   r.valid_to,
   r.reviewed_at,
   r.reviewed_by,
   r.review_status,
   r.value_remarks,
   r.value_currency,
   r.created_by,
   geo.geo_coverage_values,
   lang.languages,
   tag.tags,
   orgs.organisations,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries
   FROM ((((public.resource r
     LEFT JOIN ( SELECT rlu.resource,
            json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
           FROM (public.resource_language_url rlu
             JOIN public.language l ON ((rlu.language = l.id)))
          GROUP BY rlu.resource) lang ON ((r.id = lang.resource)))
     LEFT JOIN ( SELECT rt.resource,
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM (public.resource_tag rt
             JOIN public.tag t ON ((rt.tag = t.id)))
          GROUP BY rt.resource) tag ON ((r.id = tag.resource)))
     LEFT JOIN ( SELECT rg.resource,
              json_agg(COALESCE(rg.country_group, 0)) FILTER (WHERE rg.country_group IS NOT NULL) AS geo_coverage_country_groups,
              json_agg(COALESCE(rg.country, 0)) FILTER (WHERE rg.country IS NOT NULL) AS geo_coverage_countries,
              json_agg(COALESCE(rg.country, rg.country_group, 0)) AS geo_coverage_values
           FROM public.resource_geo_coverage rg
          GROUP BY rg.resource) geo ON ((r.id = geo.resource)))
     LEFT JOIN ( SELECT ro.resource,
            json_agg(json_build_object('id', o.id, 'name', o.name)) AS organisations
           FROM (public.resource_organisation ro
             LEFT JOIN public.organisation o ON ((ro.organisation = o.id)))
          GROUP BY ro.resource) orgs ON ((r.id = orgs.resource)))
  ORDER BY r.created;



CREATE OR REPLACE VIEW public.v_stakeholder_data AS
 SELECT s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
        CASE
            WHEN (s.public_email = true) THEN s.email
            ELSE ''::text
        END AS email,
    s.linked_in,
    s.twitter,
    s.url,
    s.representation,
    s.about,
    s.geo_coverage_type,
    s.created,
    s.modified,
    s.reviewed_at,
    s.role,
    s.cv,
    s.reviewed_by,
    s.review_status,
    s.public_email,
    s.country,
    s.organisation_role,
    geo.geo_coverage_values,
    row_to_json(o.*) AS affiliation,
    tag.tags,
    geo.geo_coverage_country_groups,
     geo.geo_coverage_countries
   FROM (((public.stakeholder s
     LEFT JOIN ( SELECT st.stakeholder,
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM (public.stakeholder_tag st
             JOIN public.tag t ON ((st.tag = t.id)))
          GROUP BY st.stakeholder) tag ON ((s.id = tag.stakeholder)))
     LEFT JOIN ( SELECT sg.stakeholder,
               json_agg(COALESCE(sg.country_group, 0)) FILTER (WHERE sg.country_group IS NOT NULL) AS geo_coverage_country_groups,
               json_agg(COALESCE(sg.country, 0)) FILTER (WHERE sg.country IS NOT NULL) AS geo_coverage_countries,
               json_agg(COALESCE(sg.country, sg.country_group, 0)) AS geo_coverage_values
           FROM public.stakeholder_geo_coverage sg
          GROUP BY sg.stakeholder) geo ON ((s.id = geo.stakeholder)))
     LEFT JOIN public.organisation o ON ((s.affiliation = o.id)))
  ORDER BY s.created;


CREATE OR REPLACE VIEW public.v_organisation_data AS
 SELECT o.id,
    o.name,
    o.url,
    o.logo,
    o.type,
    o.country,
    o.geo_coverage_type,
    o.program,
    o.contribution,
    o.expertise,
    o.review_status,
    o.created_by,
    geo.geo_coverage_values,
    geo.geo_coverage_country_groups,
    geo.geo_coverage_countries

   FROM (public.organisation o
     LEFT JOIN ( SELECT og.organisation,
                json_agg(COALESCE(og.country_group, 0)) FILTER (WHERE og.country_group IS NOT NULL) AS geo_coverage_country_groups,
                json_agg(COALESCE(og.country, 0)) FILTER (WHERE og.country IS NOT NULL) AS geo_coverage_countries,
                json_agg(COALESCE(og.country, og.country_group, 0)) AS geo_coverage_values
           FROM public.organisation_geo_coverage og
          GROUP BY og.organisation) geo ON ((o.id = geo.organisation)));
