-- v_event_data
CREATE OR REPLACE VIEW v_event_data AS
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
    tag.tags
   FROM event e
     LEFT JOIN ( SELECT elu.event,
            json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
           FROM event_language_url elu
             JOIN language l ON elu.language = l.id
          GROUP BY elu.event) lang ON e.id = lang.event
     LEFT JOIN ( SELECT et.event,
            -- Changed tags to [tag, ...] from [{id: tag}, ...]
            json_agg(t.tag) AS tags
           FROM event_tag et
             JOIN tag t ON et.tag = t.id
          GROUP BY et.event) tag ON e.id = tag.event
     LEFT JOIN ( SELECT eg.event,
            json_agg(COALESCE(eg.country, eg.country_group, 0)) AS geo_coverage_values
           FROM event_geo_coverage eg
          GROUP BY eg.event) geo ON e.id = geo.event
  ORDER BY e.created;

-- v_policy_data
CREATE OR REPLACE VIEW v_policy_data AS
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
    tag.tags
   FROM policy p
     LEFT JOIN ( SELECT plu.policy,
            json_agg(json_build_object('url', plu.url, 'iso_code', l.iso_code)) AS languages
           FROM policy_language_url plu
             JOIN language l ON plu.language = l.id
          GROUP BY plu.policy) lang ON p.id = lang.policy
     LEFT JOIN ( SELECT pt.policy,
            -- Changed tags to [tag, ...] from [{id: tag}, ...]
            json_agg(t.tag) AS tags
           FROM policy_tag pt
             JOIN tag t ON pt.tag = t.id
          GROUP BY pt.policy) tag ON p.id = tag.policy
     LEFT JOIN ( SELECT pg.policy,
            json_agg(COALESCE(pg.country, pg.country_group, 0)) AS geo_coverage_values
           FROM policy_geo_coverage pg
          GROUP BY pg.policy) geo ON p.id = geo.policy
  ORDER BY p.created;

-- v_project_data
CREATE OR REPLACE VIEW v_project_data AS
 SELECT p.id,
    p.uuid,
    p.phase,
    p.funds,
    p.contribution,
    p.created,
    p.modified,
    p.title,
    p.geo_coverage_type,
    p.summary,
    p.reviewed_at,
    p.reviewed_by,
    p.review_status,
    p.url,
    p.image,
    tag.tags,
    geo.geo_coverage_values
   FROM project p
     LEFT JOIN ( SELECT pt.project,
            -- Changed tags to [tag, ...] from [{id: tag}, ...]
            json_agg(t.tag) AS tags
           FROM project_tag pt
             JOIN tag t ON pt.tag = t.id
          GROUP BY pt.project) tag ON p.id = tag.project
     LEFT JOIN ( SELECT pg.id,
            json_agg(pg.geo_coverage) AS geo_coverage_values
           FROM v_project_geo pg
          GROUP BY pg.id) geo ON p.id = geo.id
  ORDER BY p.created;

-- v_initiative_data
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



-- v_resource_data
CREATE OR REPLACE VIEW v_resource_data AS
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
    orgs.organisations
   FROM resource r
     LEFT JOIN ( SELECT rlu.resource,
            json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
           FROM resource_language_url rlu
             JOIN language l ON rlu.language = l.id
          GROUP BY rlu.resource) lang ON r.id = lang.resource
     LEFT JOIN ( SELECT rt.resource,
            -- Changed tags to [tag, ...] from [{id: tag}, ...]
            json_agg(t.tag) AS tags
           FROM resource_tag rt
             JOIN tag t ON rt.tag = t.id
          GROUP BY rt.resource) tag ON r.id = tag.resource
     LEFT JOIN ( SELECT rg.resource,
            json_agg(COALESCE(rg.country, rg.country_group, 0)) AS geo_coverage_values
           FROM resource_geo_coverage rg
          GROUP BY rg.resource) geo ON r.id = geo.resource
     LEFT JOIN ( SELECT ro.resource,
            json_agg(json_build_object('id', o.id, 'name', o.name)) AS organisations
           FROM resource_organisation ro
             LEFT JOIN organisation o ON ro.organisation = o.id
          GROUP BY ro.resource) orgs ON r.id = orgs.resource
  ORDER BY r.created;

-- v_technology_data
CREATE OR REPLACE VIEW v_technology_data AS
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
    tag.tags
   FROM technology t
     LEFT JOIN ( SELECT tlu.technology,
            json_agg(json_build_object('url', tlu.url, 'iso_code', l.iso_code)) AS languages
           FROM technology_language_url tlu
             JOIN language l ON tlu.language = l.id
          GROUP BY tlu.technology) lang ON t.id = lang.technology
     LEFT JOIN ( SELECT tt.technology,
            -- Changed tags to [tag, ...] from [{id: tag}, ...]
            json_agg(t_1.tag) AS tags
           FROM technology_tag tt
             JOIN tag t_1 ON tt.tag = t_1.id
          GROUP BY tt.technology) tag ON t.id = tag.technology
     LEFT JOIN ( SELECT tg.technology,
            json_agg(COALESCE(tg.country, tg.country_group, 0)) AS geo_coverage_values
           FROM technology_geo_coverage tg
          GROUP BY tg.technology) geo ON t.id = geo.technology
  ORDER BY t.created;

-- v_stakeholder_data
CREATE OR REPLACE VIEW v_stakeholder_data AS
 SELECT s.id,
    s.picture,
    s.title,
    s.first_name,
    s.last_name,
        CASE
            WHEN s.public_email = true THEN s.email
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
    tag.tags
   FROM stakeholder s
     LEFT JOIN ( SELECT st.stakeholder,
            -- Changed tags to [tag, ...] from [{id: tag}, ...]
            json_agg(t.tag) AS tags
           FROM stakeholder_tag st
             JOIN tag t ON st.tag = t.id
          GROUP BY st.stakeholder) tag ON s.id = tag.stakeholder
     LEFT JOIN ( SELECT sg.stakeholder,
            json_agg(COALESCE(sg.country, sg.country_group, 0)) AS geo_coverage_values
           FROM stakeholder_geo_coverage sg
          GROUP BY sg.stakeholder) geo ON s.id = geo.stakeholder
     LEFT JOIN organisation o ON s.affiliation = o.id
  ORDER BY s.created;
