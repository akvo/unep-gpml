ALTER TABLE policy DROP COLUMN image;

DROP VIEW IF EXISTS v_topic;

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
    p.url,
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
