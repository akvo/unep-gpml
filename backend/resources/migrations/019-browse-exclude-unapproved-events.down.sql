DROP VIEW IF EXISTS v_event_data CASCADE;
CREATE OR REPLACE VIEW v_event_data AS
 SELECT e.id,
    e.title,
    e.start_date,
    e.end_date,
    e.description,
    e.image,
    e.geo_coverage_type,
    e.remarks,
    e.created,
    e.modified,
    e.country,
    e.city,
    e.approved_by,
    lang.languages,
    tag.tags
   FROM event e
     LEFT JOIN ( SELECT elu.event,
            json_agg(json_build_object('url', elu.url, 'iso_code', l.iso_code)) AS languages
           FROM event_language_url elu
             JOIN language l ON elu.language = l.id
          GROUP BY elu.event) lang ON e.id = lang.event
     LEFT JOIN ( SELECT et.event,
            json_agg(t.tag) AS tags
           FROM event_tag et
             JOIN tag t ON et.tag = t.id
          GROUP BY et.event) tag ON e.id = tag.event
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
SELECT * FROM v_technology
UNION ALL
SELECT * FROM v_project;
--;;
