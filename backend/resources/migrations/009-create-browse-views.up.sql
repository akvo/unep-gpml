--- # Resource
CREATE VIEW v_resource_geo AS
SELECT r.id, country.iso_code AS geo_coverage_iso_code
  FROM resource r LEFT JOIN resource_geo_coverage geo ON r.id = geo.resource
  LEFT JOIN country_group_country cgc ON geo.country_group = cgc.country_group
  LEFT JOIN country ON cgc.country = country.id
WHERE (r.geo_coverage_type = 'regional' OR r.geo_coverage_type = 'global with elements in specific areas')
UNION ALL
SELECT r.id, country.iso_code AS geo_coverage_iso_code
  FROM resource r LEFT JOIN resource_geo_coverage geo ON r.id = geo.resource
  LEFT join country ON geo.country = country.id
WHERE (r.geo_coverage_type = 'national' OR r.geo_coverage_type = 'transnational' OR r.geo_coverage_type = 'sub-national')
UNION ALL
SELECT id, '***' AS geo_coverage_iso_code
 FROM resource r
WHERE geo_coverage_type = 'global';
-- ;;

CREATE VIEW v_resource_language AS
SELECT r.*, lang.languages
  FROM resource r LEFT JOIN (
       SELECT rlu.resource, json_agg(json_build_object('url', rlu.url, 'iso_code', l.iso_code)) AS languages
         FROM resource_language_url rlu JOIN language l ON rlu.language = l.id
        GROUP BY rlu.resource) lang on r.id = lang.resource
ORDER BY r.created;
-- ;;

CREATE VIEW v_resource_search_text AS
SELECT id, to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' '|| coalesce(remarks, '')) AS search_text
  FROM resource
 ORDER BY created;
-- ;;

CREATE VIEW v_resource AS
SELECT 'resource' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(r) AS json
  FROM v_resource_language r LEFT JOIN v_resource_geo AS geo ON r.id = geo.id
  LEFT JOIN v_resource_search_text st ON r.id = st.id
 ORDER BY r.created;
--;;

--- # Policy

CREATE VIEW v_policy_geo AS
SELECT p.id, country.iso_code AS geo_coverage_iso_code
  FROM policy p LEFT JOIN policy_geo_coverage geo on p.id = geo.policy
  LEFT JOIN country_group_country cgc ON geo.country_group = cgc.country_group
  LEFT JOIN country ON cgc.country = country.id
where (p.geo_coverage_type = 'regional' OR p.geo_coverage_type = 'global with elements in specific areas')
UNION ALL
SELECT p.id, country.iso_code AS geo_coverage_iso_code
  FROM policy p LEFT JOIN policy_geo_coverage geo ON p.id = geo.policy
  LEFT JOIN country on geo.country = country.id
where (p.geo_coverage_type = 'national' OR p.geo_coverage_type = 'transnational' OR p.geo_coverage_type = 'sub-national')
UNION ALL
SELECT id, '***' AS geo_coverage_iso_code
 FROM policy p where geo_coverage_type = 'global';
-- ;;

CREATE OR REPLACE VIEW v_policy_language AS
SELECT p.*, lang.languages
  FROM policy p LEFT JOIN (
       SELECT plu.policy, json_agg(json_build_object('url', plu.url, 'iso_code', l.iso_code)) AS languages
         FROM policy_language_url plu JOIN language l ON plu.language = l.id
        GROUP BY plu.policy) lang on p.id = lang.policy
ORDER BY p.created;
-- ;;

CREATE VIEW v_policy_search_text AS
SELECT id, to_tsvector('english', coalesce(title, '')    || ' ' || coalesce(original_title, '') || '' ||
                      coalesce(abstract, '') || ' ' || coalesce(remarks, '')) AS search_text
FROM policy
ORDER BY created;
-- ;;

CREATE VIEW v_policy AS
SELECT 'policy' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(p) AS json
  FROM v_policy_language p LEFT JOIN v_policy_geo AS geo ON p.id = geo.id
  LEFT JOIN v_policy_search_text st ON p.id = st.id
 ORDER BY p.created;
-- ;;


--- # Technology

CREATE VIEW v_technology_geo AS
SELECT t.id, country.iso_code AS geo_coverage_iso_code
  FROM technology t LEFT JOIN technology_geo_coverage geo on t.id = geo.technology
  LEFT JOIN country_group_country cgc ON geo.country_group = cgc.country_group
  LEFT JOIN country ON cgc.country = country.id
WHERE (t.geo_coverage_type = 'regional' OR t.geo_coverage_type = 'global with elements in specific areas')
UNION ALL
SELECT t.id, country.iso_code AS geo_coverage_iso_code
  FROM technology t LEFT JOIN technology_geo_coverage geo ON t.id = geo.technology
  LEFT JOIN country ON geo.country = country.id
where (t.geo_coverage_type = 'national' OR t.geo_coverage_type = 'transnational' OR t.geo_coverage_type = 'sub-national')
UNION ALL
SELECT id, '***' AS geo_coverage_iso_code
 FROM technology t WHERE geo_coverage_type = 'global';
-- ;;

CREATE VIEW v_technology_language AS
SELECT t.*, lang.languages
  FROM technology t LEFT JOIN (
       SELECT tlu.technology, json_agg(json_build_object('url', tlu.url, 'iso_code', l.iso_code)) AS languages
         FROM technology_language_url tlu JOIN language l ON tlu.language = l.id
        GROUP BY tlu.technology) lang ON t.id = lang.technology
ORDER BY t.created;
-- ;;

CREATE VIEW v_technology_search_text AS
SELECT id, to_tsvector('english', coalesce(name, '')) AS search_text
  FROM technology
 ORDER BY created;
-- ;;

CREATE OR REPLACE VIEW v_technology AS
SELECT 'technology' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(t) AS json
  FROM v_technology_language t LEFT JOIN v_technology_geo AS geo ON t.id = geo.id
  LEFT JOIN v_technology_search_text st ON t.id = st.id
 ORDER BY t.created;
-- ;;

--- # Event

CREATE VIEW v_event_geo AS
SELECT e.id, country.iso_code AS geo_coverage_iso_code
  FROM event e LEFT JOIN event_geo_coverage geo on e.id = geo.event
  LEFT JOIN country_group_country cgc ON geo.country_group = cgc.country_group
  LEFT JOIN country ON cgc.country = country.id
WHERE (e.geo_coverage_type = 'regional' OR e.geo_coverage_type = 'global with elements in specific areas')
UNION ALL
SELECT e.id, country.iso_code AS geo_coverage_iso_code
  FROM event e LEFT JOIN event_geo_coverage geo ON e.id = geo.event
  LEFT JOIN country ON geo.country = country.id
WHERE (e.geo_coverage_type = 'national' OR e.geo_coverage_type = 'transnational' OR e.geo_coverage_type = 'sub-national')
UNION ALL
SELECT id, '***' AS geo_coverage_iso_code
 FROM event e WHERE geo_coverage_type = 'global';
-- ;;

CREATE VIEW v_event_language AS
SELECT e.*, lang.languages
  FROM event e LEFT JOIN (
       SELECT elu.event, json_agg(json_build_object('iso_code', l.iso_code)) AS languages
         FROM event_language_url elu JOIN language l ON elu.language = l.id
        GROUP BY elu.event) lang ON e.id = lang.event
ORDER BY e.created;
-- ;;

CREATE VIEW v_event_search_text AS
SELECT id, to_tsvector('english', coalesce(title, '')    || ' ' || coalesce(description, '') || '' ||
                      coalesce(remarks, '')) AS search_text
FROM event
ORDER BY created;
-- ;;

CREATE OR REPLACE VIEW v_event AS
SELECT 'event' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(e) AS json
  FROM v_event_language e LEFT JOIN v_event_geo AS geo ON e.id = geo.id
  LEFT JOIN v_event_search_text st ON e.id = st.id
 ORDER BY e.created;
-- ;;

--- # Stakeholder

CREATE VIEW v_stakeholder_geo AS
SELECT s.id, country.iso_code AS geo_coverage_iso_code
  FROM stakeholder s LEFT JOIN stakeholder_geo_coverage geo on s.id = geo.stakeholder
  LEFT JOIN country_group_country cgc ON geo.country_group = cgc.country_group
  LEFT JOIN country ON cgc.country = country.id
WHERE (s.geo_coverage_type = 'regional' OR s.geo_coverage_type = 'global with elements in specific areas')
UNION ALL
SELECT s.id, country.iso_code AS geo_coverage_iso_code
  FROM stakeholder s LEFT JOIN stakeholder_geo_coverage geo ON s.id = geo.stakeholder
  LEFT JOIN country ON geo.country = country.id
WHERE (s.geo_coverage_type = 'national' OR s.geo_coverage_type = 'transnational' OR s.geo_coverage_type = 'sub-national')
UNION ALL
SELECT id, '***' AS geo_coverage_iso_code
 FROM stakeholder s WHERE geo_coverage_type = 'global';
-- ;;

CREATE VIEW v_stakeholder_search_text AS
SELECT id, to_tsvector('english', coalesce(summary, '')) AS search_text
FROM stakeholder
ORDER BY created;
-- ;;

CREATE VIEW v_stakeholder AS
SELECT 'stakeholder' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(s) AS json
  FROM stakeholder s LEFT JOIN v_stakeholder_geo AS geo ON s.id = geo.id
  LEFT JOIN v_stakeholder_search_text st ON s.id = st.id
 ORDER BY s.created;
-- ;;

--- # ALL

CREATE VIEW v_topic AS
SELECT * FROM v_event
UNION ALL
SELECT * FROM v_policy
UNION ALL
SELECT * FROM v_resource
UNION ALL
SELECT * FROM v_technology;
-- ;;
