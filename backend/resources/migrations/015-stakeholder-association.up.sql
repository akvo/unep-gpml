CREATE TYPE resource_association AS
ENUM('owner', 'reviewer', 'user', 'interested in', 'other');
-- ;;

CREATE TABLE stakeholder_resource (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  resource integer NOT NULL REFERENCES resource(id),
  association resource_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, resource, association)
);
-- ;;

CREATE TYPE event_association AS
ENUM ('resource person', 'organiser', 'participant', 'sponsor',
      'host', 'interested in', 'other');
-- ;;

CREATE TABLE stakeholder_event (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  event integer NOT NULL REFERENCES event(id),
  association event_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, event, association)
);
-- ;;

CREATE TYPE technology_association AS
ENUM ('owner', 'user', 'reviewer', 'interested in', 'other');
-- ;;

CREATE TABLE stakeholder_technology (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  technology integer NOT NULL REFERENCES technology(id),
  association technology_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, technology, association)
);
-- ;;

CREATE TYPE policy_association AS
ENUM('regulator', 'implementor', 'reviewer', 'interested in', 'other');
-- ;;

CREATE TABLE stakeholder_policy (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  policy integer NOT NULL REFERENCES policy(id),
  association policy_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, policy, association)
);
-- ;;

CREATE TYPE project_association AS
ENUM('owner', 'implementor', 'reviewer', 'user', 'interested in', 'other');
-- ;;

CREATE TABLE stakeholder_project (
  id serial PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  project integer NOT NULL REFERENCES project(id),
  association project_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, project, association)
);
-- ;;

CREATE VIEW v_stakeholder_association AS
SELECT 'resource' AS topic, stakeholder, resource AS id, association::text AS association, remarks
 FROM stakeholder_resource
UNION ALL
SELECT 'event' AS topic, stakeholder, event AS id, association::text AS association, remarks
 FROM stakeholder_event
UNION ALL
SELECT 'technology' AS topic, stakeholder, technology AS id, association::text AS association, remarks
 FROM stakeholder_technology
UNION ALL
SELECT 'policy' AS topic, stakeholder, policy AS id, association::text AS association, remarks
 FROM stakeholder_policy
UNION ALL
SELECT 'project' AS topic, stakeholder, project AS id, association::text AS association, remarks
 FROM stakeholder_project;
-- ;;
