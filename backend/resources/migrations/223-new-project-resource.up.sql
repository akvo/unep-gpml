BEGIN;
--;;
DROP TABLE project CASCADE;
--;;
DROP TABLE project_geo_coverage;
--;;
DROP TABLE project_badge;
--;;
DROP VIEW IF EXISTS v_project CASCADE;
--;;
DROP TYPE IF EXISTS project_association;
--;;
COMMIT;
--;;

CREATE TABLE project (
  id serial NOT NULL PRIMARY KEY,
  title text,
  summary text,
  publish_year smallint,
  valid_from text,
  valid_to text,
  geo_coverage_type geo_coverage_type,
  created_by integer,
  url text,
  info_docs text,
  sub_content_type text,
  language varchar(3) NOT NULL DEFAULT 'en' REFERENCES language (iso_code) ON UPDATE CASCADE,
  source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml',
  capacity_building boolean DEFAULT false,
  videos jsonb,
  background text,
  purpose text,
  highlights jsonb,
  outcomes jsonb,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  image_id UUID REFERENCES file (id) ON DELETE SET NULL,
  thumbnail_id UUID REFERENCES file (id) ON DELETE SET NULL,
  created timestamptz DEFAULT now(),
  modified timestamptz DEFAULT now()
);
--;;
DO $$
BEGIN
    PERFORM install_update_modified('project');
END$$;
--;;

CREATE TABLE project_gallery (
  id serial NOT NULL PRIMARY KEY,
  project integer NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  image UUID NOT NULL REFERENCES file(id) ON DELETE CASCADE
);
--;;

CREATE TABLE project_tag (
  id serial NOT NULL PRIMARY KEY,
  project integer NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  tag integer NOT NULL REFERENCES tag(id) ON DELETE CASCADE
);
--;;

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
CREATE TABLE project_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  project integer NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  country_group integer REFERENCES country_group(id) ON DELETE CASCADE,
  country integer REFERENCES country(id) ON DELETE CASCADE,
  country_state integer REFERENCES country_state(id) ON DELETE CASCADE
);
-- ;;
CREATE UNIQUE INDEX IF NOT EXISTS project_geo_coverage_project_country_idx
ON project_geo_coverage (
project,
country);
-- ;;
CREATE UNIQUE INDEX IF NOT EXISTS project_geo_coverage_project_country_group_idx
ON project_geo_coverage (
project,
country_group);
-- ;;
CREATE UNIQUE INDEX IF NOT EXISTS project_geo_coverage_project_country_state_idx
ON project_geo_coverage (
project,
country_state);
-- ;;
