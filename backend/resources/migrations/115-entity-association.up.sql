ALTER TYPE resource_association ADD VALUE 'implementor';
--;;
ALTER TYPE resource_association ADD VALUE 'partner';
--;;
ALTER TYPE resource_association ADD VALUE 'donor';
--;;
ALTER TYPE technology_association ADD VALUE 'implementor';
--;;
ALTER TYPE technology_association ADD VALUE 'partner';
--;;
ALTER TYPE technology_association ADD VALUE 'donor';
--;;
ALTER TYPE project_association ADD VALUE 'partner';
--;;
ALTER TYPE project_association ADD VALUE 'donor';
--;;
CREATE TABLE organisation_resource (
  id serial PRIMARY KEY,
  organisation integer NOT NULL REFERENCES organisation(id),
  resource integer NOT NULL REFERENCES resource(id),
  association resource_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation, resource, association)
);
-- ;;
CREATE TABLE organisation_event (
  id serial PRIMARY KEY,
  organisation integer NOT NULL REFERENCES organisation(id),
  event integer NOT NULL REFERENCES event(id),
  association event_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation, event, association)
);
-- ;;
CREATE TABLE organisation_technology (
  id serial PRIMARY KEY,
  organisation integer NOT NULL REFERENCES organisation(id),
  technology integer NOT NULL REFERENCES technology(id),
  association technology_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation, technology, association)
);
-- ;;
CREATE TABLE organisation_policy (
  id serial PRIMARY KEY,
  organisation integer NOT NULL REFERENCES organisation(id),
  policy integer NOT NULL REFERENCES policy(id),
  association policy_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation, policy, association)
);
-- ;;
CREATE TABLE organisation_project (
  id serial PRIMARY KEY,
  organisation integer NOT NULL REFERENCES organisation(id),
  project integer NOT NULL REFERENCES project(id),
  association project_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation, project, association)
);
-- ;;
CREATE VIEW v_organisation_association AS
SELECT 'resource' AS topic, organisation, resource AS id, association::text AS association, remarks
 FROM organisation_resource
UNION ALL
SELECT 'event' AS topic, organisation, event AS id, association::text AS association, remarks
 FROM organisation_event
UNION ALL
SELECT 'technology' AS topic, organisation, technology AS id, association::text AS association, remarks
 FROM organisation_technology
UNION ALL
SELECT 'policy' AS topic, organisation, policy AS id, association::text AS association, remarks
 FROM organisation_policy
UNION ALL
SELECT 'project' AS topic, organisation, project AS id, association::text AS association, remarks
 FROM organisation_project;