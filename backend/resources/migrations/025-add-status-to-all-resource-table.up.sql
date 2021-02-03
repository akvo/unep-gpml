CREATE TYPE review_status AS
ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

ALTER TABLE stakeholder RENAME COLUMN approved_at TO reviewed_at;
ALTER TABLE stakeholder ADD COLUMN reviewed_by integer REFERENCES stakeholder(id);
ALTER TABLE stakeholder ADD COLUMN review_status review_status DEFAULT 'SUBMITTED';

ALTER TABLE event RENAME COLUMN approved_at TO reviewed_at;
ALTER TABLE event RENAME COLUMN approved_by TO reviewed_by;
ALTER TABLE event ADD COLUMN review_status review_status DEFAULT 'SUBMITTED';

ALTER TABLE resource ADD COLUMN reviewed_at timestamptz;
ALTER TABLE resource ADD COLUMN reviewed_by integer REFERENCES stakeholder(id);
ALTER TABLE resource ADD COLUMN review_status review_status DEFAULT 'SUBMITTED';

ALTER TABLE policy ADD COLUMN reviewed_at timestamptz;
ALTER TABLE policy ADD COLUMN reviewed_by integer REFERENCES stakeholder(id);
ALTER TABLE policy ADD COLUMN review_status review_status DEFAULT 'SUBMITTED';

ALTER TABLE project ADD COLUMN reviewed_at timestamptz;
ALTER TABLE project ADD COLUMN reviewed_by integer REFERENCES stakeholder(id);
ALTER TABLE project ADD COLUMN review_status review_status DEFAULT 'SUBMITTED';

ALTER TABLE technology ADD COLUMN reviewed_at timestamptz;
ALTER TABLE technology ADD COLUMN reviewed_by integer REFERENCES stakeholder(id);
ALTER TABLE technology ADD COLUMN review_status review_status DEFAULT 'SUBMITTED';
-- ;;

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
    e.reviewed_at,
    e.reviewed_by,
    e.review_status,
    geo.geo_coverage_values,
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
     LEFT JOIN (
           SELECT eg.event,
            json_agg(coalesce(c.iso_code, cg.name)) AS geo_coverage_values
           FROM event_geo_coverage eg
             LEFT JOIN country c ON eg.country = c.id
             LEFT JOIN country_group cg ON eg.country_group = cg.id
          GROUP BY eg.event) geo ON e.id = geo.event
  ORDER BY e.created;
-- ;;

CREATE OR REPLACE VIEW v_event AS
SELECT 'event' AS topic, geo.geo_coverage_iso_code, st.search_text, row_to_json(e) AS json
  FROM v_event_data e LEFT JOIN v_event_geo AS geo ON e.id = geo.id
  LEFT JOIN v_event_search_text st ON e.id = st.id
 WHERE e.review_status = 'APPROVED'
 ORDER BY e.created;
-- ;;

--- # RECREATE ALL TOPIC
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
