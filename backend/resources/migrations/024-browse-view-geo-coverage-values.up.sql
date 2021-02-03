-- # Resource
DROP VIEW IF EXISTS v_resource_data CASCADE;
CREATE OR REPLACE VIEW v_resource_data AS
 SELECT r.id,
    r.title,
    r.type,
    r.publish_year,
    r.summary,
    r.value,
    r.value_currency,
    r.image,
    r.geo_coverage_type,
    r.attachments,
    r.remarks,
    r.created,
    r.modified,
    r.country,
    r.valid_from,
    r.valid_to,
    geo.geo_coverage_values,
    lang.languages,
    tag.tags
   FROM resource r
     LEFT JOIN ( SELECT rlu.resource,
            json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
           FROM resource_language_url rlu
             JOIN language l ON rlu.language = l.id
          GROUP BY rlu.resource) lang ON r.id = lang.resource
     LEFT JOIN ( SELECT rt.resource,
            json_agg(t.tag) AS tags
           FROM resource_tag rt
             JOIN tag t ON rt.tag = t.id
          GROUP BY rt.resource) tag ON r.id = tag.resource
     LEFT JOIN (
           SELECT rg.resource,
            json_agg(coalesce(c.iso_code, cg.name)) AS geo_coverage_values
           FROM resource_geo_coverage rg
             LEFT JOIN country c ON rg.country = c.id
             LEFT JOIN country_group cg ON rg.country_group = cg.id
          GROUP BY rg.resource) geo ON r.id = geo.resource
  ORDER BY r.created;
-- ;;

DROP VIEW IF EXISTS v_resource;
CREATE OR REPLACE VIEW v_resource AS
 SELECT replace(lower(r.type), ' '::text, '_'::text) AS topic,
    geo.geo_coverage_iso_code,
    st.search_text,
    row_to_json(r.*) AS json
   FROM v_resource_data r
     LEFT JOIN v_resource_geo geo ON r.id = geo.id
     LEFT JOIN v_resource_search_text st ON r.id = st.id
  WHERE r.type IS NOT NULL
  ORDER BY r.created;
-- ;;

-- # Policy
DROP VIEW IF EXISTS v_policy_data CASCADE;
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
            json_agg(t.tag) AS tags
           FROM policy_tag pt
             JOIN tag t ON pt.tag = t.id
          GROUP BY pt.policy) tag ON p.id = tag.policy
     LEFT JOIN (
           SELECT pg.policy,
            json_agg(coalesce(c.iso_code, cg.name)) AS geo_coverage_values
           FROM policy_geo_coverage pg
             LEFT JOIN country c ON pg.country = c.id
             LEFT JOIN country_group cg ON pg.country_group = cg.id
          GROUP BY pg.policy) geo ON p.id = geo.policy
  ORDER BY p.created;
-- ;;

DROP VIEW IF EXISTS v_policy;
CREATE OR REPLACE VIEW v_policy AS
 SELECT 'policy'::text AS topic,
    geo.geo_coverage_iso_code,
    st.search_text,
    row_to_json(p.*) AS json
   FROM v_policy_data p
     LEFT JOIN v_policy_geo geo ON p.id = geo.id
     LEFT JOIN v_policy_search_text st ON p.id = st.id
  ORDER BY p.created;
-- ;;

-- # Technology
DROP VIEW IF EXISTS v_technology_data CASCADE;
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
            json_agg(t_1.tag) AS tags
           FROM technology_tag tt
             JOIN tag t_1 ON tt.tag = t_1.id
          GROUP BY tt.technology) tag ON t.id = tag.technology
     LEFT JOIN (
           SELECT tg.technology,
            json_agg(coalesce(c.iso_code, cg.name)) AS geo_coverage_values
           FROM technology_geo_coverage tg
             LEFT JOIN country c ON tg.country = c.id
             LEFT JOIN country_group cg ON tg.country_group = cg.id
          GROUP BY tg.technology) geo ON t.id = geo.technology
  ORDER BY t.created;
-- ;;

DROP VIEW IF EXISTS v_technology CASCADE;
CREATE OR REPLACE VIEW v_technology AS
SELECT 'technology' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(t) AS json
  FROM v_technology_data t LEFT JOIN v_technology_geo AS geo ON t.id = geo.id
  LEFT JOIN v_technology_search_text st ON t.id = st.id
 ORDER BY t.created;
-- ;;

-- # Event was already changed in a previous migration-20

-- # Project
DROP VIEW IF EXISTS v_project_data CASCADE;
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
    geo.geo_coverage_values,
    tag.tags
   FROM project p
     LEFT JOIN ( SELECT pt.project,
            json_agg(t.tag) AS tags
           FROM project_tag pt
             JOIN tag t ON pt.tag = t.id
          GROUP BY pt.project) tag ON p.id = tag.project
     LEFT JOIN (
           SELECT pc.project, json_agg(c.iso_code) AS geo_coverage_values
           FROM project_country pc
             LEFT JOIN country c ON pc.country = c.id
          GROUP BY pc.project) geo ON p.id = geo.project
  ORDER BY p.created;
-- ;;

DROP VIEW IF EXISTS v_project CASCADE;
CREATE OR REPLACE VIEW v_project AS
 SELECT 'project'::text AS topic,
    geo.geo_coverage_iso_code,
    st.search_text,
    row_to_json(p.*) AS json
   FROM v_project_data p
     LEFT JOIN v_project_geo geo ON p.id = geo.id
     LEFT JOIN v_project_search_text st ON p.id = st.id
  ORDER BY p.created;
-- ;;


-- # All
CREATE OR REPLACE VIEW v_topic AS
SELECT * FROM v_event
UNION ALL
SELECT * FROM v_policy
UNION ALL
SELECT * FROM v_resource
UNION ALL
SELECT * FROM v_technology
UNION ALL
SELECT * FROM v_project;
--;;
