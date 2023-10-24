BEGIN;
--;;
CREATE TYPE BADGE_TYPE AS ENUM ('country-verified');
--;; Check also if we need to add country ref. We use a serial id to make easier rbac-related future integration if needed.
--;;
CREATE TABLE IF NOT EXISTS badge (
  id SERIAL,
  name TEXT UNIQUE NOT NULL,
  type BADGE_TYPE NOT NULL,
  content_file_id UUID REFERENCES file (id),
  CONSTRAINT badge_pkey PRIMARY KEY (id)
);
--;; Badge-assignment related tables.
--;;
CREATE TABLE IF NOT EXISTS stakeholder_badge (
  stakeholder_id INTEGER REFERENCES stakeholder(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT stakeholder_badge_pkey PRIMARY KEY (stakeholder_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS organisation_badge (
  organisation_id INTEGER REFERENCES organisation(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT organisation_badge_pkey PRIMARY KEY (organisation_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS event_badge (
  event_id INTEGER REFERENCES event(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT event_badge_pkey PRIMARY KEY (event_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS policy_badge (
  policy_id INTEGER REFERENCES policy(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT policy_badge_pkey PRIMARY KEY (policy_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS technology_badge (
  technology_id INTEGER REFERENCES technology(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT technology_badge_pkey PRIMARY KEY (technology_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS resource_badge (
  resource_id INTEGER REFERENCES resource(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT resource_badge_pkey PRIMARY KEY (resource_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS project_badge (
  project_id INTEGER REFERENCES project(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT project_badge_pkey PRIMARY KEY (project_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS case_study_badge (
  case_study_id INTEGER REFERENCES case_study(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT case_study_badge_pkey PRIMARY KEY (case_study_id, badge_id)
);
--;;
CREATE TABLE IF NOT EXISTS initiative_badge (
  initiative_id INTEGER REFERENCES initiative(id),
  badge_id INTEGER REFERENCES badge(id),
  assigned_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  assigned_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT initiative_badge_pkey PRIMARY KEY (initiative_id, badge_id)
);
--;; RBAC-permissions related additions.
--;;
INSERT INTO rbac_context_type (
    name,
    description)
VALUES (
    'badge',
    'Badge-level context type');
--;;
INSERT INTO rbac_permission (
    id,
    name,
    description,
    context_type_name)
VALUES (
    '7a6b7a1e-7907-4769-a443-ccc81b570fe6',
    'badge/assign',
    'Allows assigning a badge to some entity',
    'badge'),
(
    '64a7bb86-b652-425e-ba55-c2f974c7712b',
    'badge/unassign',
    'Allows unassigning a badge from any entity',
    'badge');
--;;
INSERT INTO rbac_role (
    id,
    name,
    description)
VALUES (
    'dc4f43ed-f28c-4864-a81f-706ca99a5737',
    'badge-assigner',
    'Role to assign and unassign badges');
--;;
INSERT INTO rbac_role_permission (
    role_id,
    permission_id,
    permission_value)
VALUES (
    'dc4f43ed-f28c-4864-a81f-706ca99a5737',
    '7a6b7a1e-7907-4769-a443-ccc81b570fe6',
    1),
(
    'dc4f43ed-f28c-4864-a81f-706ca99a5737',
    '64a7bb86-b652-425e-ba55-c2f974c7712b',
    1);
--;;
COMMIT;