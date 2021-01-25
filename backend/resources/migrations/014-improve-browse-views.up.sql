DROP VIEW IF EXISTS v_resource_language CASCADE;
CREATE OR REPLACE VIEW v_resource_data AS
SELECT r.*, lang.languages, tag.tags
  FROM resource r
  LEFT JOIN (
       SELECT rlu.resource, json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
         FROM resource_language_url rlu JOIN language l ON rlu.language = l.id
        GROUP BY rlu.resource
  ) lang on r.id = lang.resource
  LEFT JOIN (
       SELECT rt.resource, json_agg(t.tag) AS tags
         FROM resource_tag rt JOIN tag t ON rt.tag = t.id
        GROUP BY rt.resource
  ) tag on r.id = tag.resource
ORDER BY r.created;
--;;

CREATE OR REPLACE VIEW v_resource AS
SELECT 'resource' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(r) AS json
  FROM v_resource_data r LEFT JOIN v_resource_geo AS geo ON r.id = geo.id
  LEFT JOIN v_resource_search_text st ON r.id = st.id
 ORDER BY r.created;
--;;

DROP VIEW IF EXISTS v_policy_language CASCADE;
CREATE OR REPLACE VIEW v_policy_data AS
SELECT p.*, lang.languages, tag.tags
  FROM policy p
  LEFT JOIN (
       SELECT plu.policy, json_agg(json_build_object('url', plu.url, 'iso_code', l.iso_code)) AS languages
         FROM policy_language_url plu JOIN language l ON plu.language = l.id
        GROUP BY plu.policy
  ) lang on p.id = lang.policy
  LEFT JOIN (
       SELECT pt.policy, json_agg(t.tag) AS tags
         FROM policy_tag pt JOIN tag t ON pt.tag = t.id
        GROUP BY pt.policy
  ) tag on p.id = tag.policy
ORDER BY p.created;
--;;

CREATE OR REPLACE VIEW v_policy AS
SELECT 'policy' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(p) AS json
  FROM v_policy_data p LEFT JOIN v_policy_geo AS geo ON p.id = geo.id
  LEFT JOIN v_policy_search_text st ON p.id = st.id
 ORDER BY p.created;
-- ;;

DROP VIEW IF EXISTS v_technology_language CASCADE;
CREATE OR REPLACE VIEW v_technology_data AS
SELECT t.*, lang.languages, tag.tags
  FROM technology t
  LEFT JOIN (
       SELECT tlu.technology, json_agg(json_build_object('url', tlu.url, 'iso_code', l.iso_code)) AS languages
         FROM technology_language_url tlu JOIN language l ON tlu.language = l.id
        GROUP BY tlu.technology
  ) lang ON t.id = lang.technology
  LEFT JOIN (
       SELECT tt.technology, json_agg(t.tag) AS tags
         FROM technology_tag tt JOIN tag t ON tt.tag = t.id
        GROUP BY tt.technology
  ) tag on t.id = tag.technology
ORDER BY t.created;
-- ;;

CREATE OR REPLACE VIEW v_technology AS
SELECT 'technology' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(t) AS json
  FROM v_technology_data t LEFT JOIN v_technology_geo AS geo ON t.id = geo.id
  LEFT JOIN v_technology_search_text st ON t.id = st.id
 ORDER BY t.created;
-- ;;

DROP VIEW IF EXISTS v_event_language CASCADE;
CREATE OR REPLACE VIEW v_event_data AS
SELECT e.*, lang.languages, tag.tags
  FROM event e
  LEFT JOIN (
       SELECT elu.event, json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
         FROM event_language_url elu JOIN language l ON elu.language = l.id
        GROUP BY elu.event
  ) lang ON e.id = lang.event
  LEFT JOIN (
       SELECT et.event, json_agg(t.tag) AS tags
         FROM event_tag et JOIN tag t ON et.tag = t.id
        GROUP BY et.event
  ) tag on e.id = tag.event
ORDER BY e.created;
-- ;;

CREATE OR REPLACE VIEW v_event AS
SELECT 'event' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(e) AS json
  FROM v_event_data e LEFT JOIN v_event_geo AS geo ON e.id = geo.id
  LEFT JOIN v_event_search_text st ON e.id = st.id
 ORDER BY e.created;
-- ;;

--- # ALL
CREATE OR REPLACE VIEW v_topic AS
SELECT * FROM v_event
UNION ALL
SELECT * FROM v_policy
UNION ALL
SELECT * FROM v_resource
UNION ALL
SELECT * FROM v_technology;
-- ;;
