-- NOTE: Postgres doesn't allow directly removing a value from an ENUM
-- type. This migration instead creates a _old ENUM type and uses that
-- for the role column in stakeholder table, and then renames it.  The
-- v_stakeholder_data view needs to be deleted to be able to change
-- the enum type, which makes this migration way bigger than needed
-- for a simple operation!

-- Remove all REVIEWER roles
UPDATE stakeholder SET
  role = 'USER'
    WHERE role = 'REVIEWER';

-- Drop views to be able to change the role TYPE
DROP VIEW IF EXISTS v_topic;
DROP VIEW IF EXISTS v_stakeholder;
DROP VIEW IF EXISTS v_stakeholder_data;

-- Change default value to NULL temporarily
ALTER TABLE stakeholder ALTER COLUMN role set DEFAULT NULL;

-- Create the old role type
CREATE TYPE stakeholder_role_old AS ENUM ('USER', 'ADMIN');

-- Use the old role type
ALTER TABLE stakeholder
  ALTER COLUMN role TYPE stakeholder_role_old
    USING (role::text::stakeholder_role_old);

-- Change default value back to 'USER'
ALTER TABLE stakeholder ALTER COLUMN role set DEFAULT 'USER';

-- Drop the type with 'REVIEWER'
DROP TYPE stakeholder_role;

-- Rename the _old type to stakeholder_role
ALTER TYPE stakeholder_role_old RENAME TO stakeholder_role;

-- Restore the views we deleted
--- v_stakeholder_data
CREATE VIEW v_stakeholder_data AS
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
            json_agg(json_build_object(t.id, t.tag)) AS tags
           FROM stakeholder_tag st
             JOIN tag t ON st.tag = t.id
          GROUP BY st.stakeholder) tag ON s.id = tag.stakeholder
     LEFT JOIN ( SELECT sg.stakeholder,
            json_agg(COALESCE(sg.country, sg.country_group, 0)) AS geo_coverage_values
           FROM stakeholder_geo_coverage sg
          GROUP BY sg.stakeholder) geo ON s.id = geo.stakeholder
     LEFT JOIN organisation o ON s.affiliation = o.id
  ORDER BY s.created;

--- v_stakeholder
CREATE VIEW v_stakeholder AS
 SELECT 'stakeholder'::text AS topic,
    geo.geo_coverage,
    st.search_text,
    row_to_json(s.*) AS json
   FROM v_stakeholder_data s
     LEFT JOIN v_stakeholder_geo geo ON s.id = geo.id
     LEFT JOIN v_stakeholder_search_text st ON s.id = st.id
  WHERE s.review_status = 'APPROVED'::review_status
  ORDER BY s.created;

--- v_topic
CREATE VIEW v_topic AS
 SELECT v_event.topic,
    v_event.geo_coverage,
    v_event.search_text,
    v_event.json
   FROM v_event
UNION ALL
 SELECT v_policy.topic,
    v_policy.geo_coverage,
    v_policy.search_text,
    v_policy.json
   FROM v_policy
UNION ALL
 SELECT v_project.topic,
    v_project.geo_coverage,
    v_project.search_text,
    v_project.json
   FROM v_project
UNION ALL
 SELECT v_resource.topic,
    v_resource.geo_coverage,
    v_resource.search_text,
    v_resource.json
   FROM v_resource
UNION ALL
 SELECT v_technology.topic,
    v_technology.geo_coverage,
    v_technology.search_text,
    v_technology.json
   FROM v_technology
UNION ALL
 SELECT v_organisation.topic,
    v_organisation.geo_coverage,
    v_organisation.search_text,
    v_organisation.json
   FROM v_organisation
UNION ALL
 SELECT v_stakeholder.topic,
    v_stakeholder.geo_coverage,
    v_stakeholder.search_text,
    v_stakeholder.json
   FROM v_stakeholder;
