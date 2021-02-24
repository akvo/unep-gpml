DROP VIEW IF EXISTS v_topic;
DROP VIEW IF EXISTS v_resource_data CASCADE;
DROP VIEW IF EXISTS v_resource;

-- # Resource
CREATE OR REPLACE VIEW v_resource_data AS
 SELECT r.id,
    r.title,
    r.type,
    r.publish_year,
    r.summary,
    r.value,
    r.value_currency,
    r.value_remarks,
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
    tag.tags,
    orgs.organisations
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
     LEFT JOIN (
           SELECT ro.resource,
            json_agg(json_build_object('id', o.id, 'name', o.name)) AS organisations
           FROM resource_organisation ro
             LEFT JOIN organisation o ON ro.organisation = o.id
           GROUP BY ro.resource) orgs ON r.id = orgs.resource
  ORDER BY r.created;
-- ;;

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

CREATE VIEW v_topic AS
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
--;;
