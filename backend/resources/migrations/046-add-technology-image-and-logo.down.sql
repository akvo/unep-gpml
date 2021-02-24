ALTER TABLE technology DROP COLUMN image;
ALTER TABLE technology DROP COLUMN logo;

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
    t.url,
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

-- # RECREATE TOPIC
DROP VIEW IF EXISTS v_topic;
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
