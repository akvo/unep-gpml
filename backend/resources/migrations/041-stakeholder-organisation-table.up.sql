CREATE TYPE organisation_association AS
ENUM ('interested in', 'other');
-- ;;

CREATE TABLE stakeholder_organisation (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  organisation integer NOT NULL REFERENCES organisation(id),
  association organisation_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, organisation, association)
);
-- ;;

CREATE OR REPLACE VIEW v_stakeholder_association AS
SELECT 'resource' AS topic, stakeholder, resource AS id, association::text AS association, remarks
 FROM stakeholder_resource
UNION ALL
SELECT 'event' AS topic, stakeholder, event AS id, association::text AS association, remarks
 FROM stakeholder_event
UNION ALL
SELECT 'technology' AS topic, stakeholder, technology AS id, association::text AS association, remarks
 FROM stakeholder_technology
UNION ALL
SELECT 'stakeholder' AS topic, stakeholder, other_stakeholder AS id, association::text AS association, remarks
 FROM stakeholder_stakeholder
UNION ALL
SELECT 'policy' AS topic, stakeholder, policy AS id, association::text AS association, remarks
 FROM stakeholder_policy
UNION ALL
SELECT 'project' AS topic, stakeholder, project AS id, association::text AS association, remarks
 FROM stakeholder_project
UNION ALL
SELECT 'organisation' AS topic, stakeholder, organisation AS id, association::text AS association, remarks
 FROM stakeholder_organisation;
-- ;;
