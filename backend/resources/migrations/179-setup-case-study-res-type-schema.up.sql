BEGIN;
--;; Base entity definition
--;;
CREATE TABLE IF NOT EXISTS case_study (
  id SERIAL NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  geo_coverage_type GEO_COVERAGE_TYPE NOT NULL,
  source RESOURCE_SOURCE NOT NULL DEFAULT 'gpml',
  publish_year SMALLINT,
  created TIMESTAMP NOT NULL DEFAULT NOW(),
  last_modified_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES stakeholder(id) ON UPDATE CASCADE,
  review_status REVIEW_STATUS DEFAULT 'SUBMITTED' NOT NULL,
  created_by INTEGER NOT NULL REFERENCES stakeholder(id) ON UPDATE CASCADE,
  image TEXT,
  thumbnail TEXT,
  language VARCHAR(3) NOT NULL REFERENCES language (iso_code) ON UPDATE CASCADE,
  featured BOOLEAN DEFAULT FALSE,
  capacity_building BOOLEAN NOT NULL DEFAULT FALSE
);
--;;
--;; Geo-coverage related schema
CREATE TABLE IF NOT EXISTS case_study_geo_coverage (
  id SERIAL NOT NULL PRIMARY KEY,
  case_study INTEGER NOT NULL REFERENCES case_study(id) ON DELETE CASCADE,
  country INTEGER REFERENCES country(id) ON DELETE CASCADE ON UPDATE CASCADE,
  country_group INTEGER REFERENCES country_group(id) ON DELETE CASCADE ON UPDATE CASCADE
);
--;;
ALTER TABLE IF EXISTS case_study_geo_coverage
  ADD CONSTRAINT case_study_geo_coverage_unique UNIQUE (case_study, country, country_group);
--;;
CREATE UNIQUE INDEX IF NOT EXISTS case_study_geo_coverage_case_study_country_idx
  ON case_study_geo_coverage (
    case_study,
    country)
  WHERE country IS NULL;
--;;
CREATE UNIQUE INDEX IF NOT EXISTS case_study_geo_coverage_case_study_country_group_idx
  ON case_study_geo_coverage (
    case_study,
    country_group)
  WHERE country_group IS NULL;
--;;
--;; Tags related schema
--;;
CREATE TABLE IF NOT EXISTS case_study_tag (
  id serial NOT NULL PRIMARY KEY,
  case_study INTEGER NOT NULL REFERENCES case_study(id) ON DELETE CASCADE,
  tag integer NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  CONSTRAINT case_study_tag_unique UNIQUE(case_study, tag)
);
--;;
--;; Stakeholder relationship
CREATE TYPE case_study_association AS
  ENUM ('implementor', 'owner', 'donor', 'partner', 'interested in', 'resource_editor');
-- ;;
CREATE TABLE IF NOT EXISTS stakeholder_case_study (
  id serial PRIMARY KEY,
  stakeholder INTEGER NOT NULL REFERENCES stakeholder(id) ON DELETE CASCADE,
  case_study INTEGER NOT NULL REFERENCES case_study(id) ON DELETE CASCADE,
  association case_study_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(stakeholder, case_study, association)
);
--;;
--;; Organisation relationship
--;;
CREATE TABLE IF NOT EXISTS organisation_case_study (
  id serial PRIMARY KEY,
  organisation INTEGER NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
  case_study INTEGER NOT NULL REFERENCES case_study(id) ON DELETE CASCADE,
  association case_study_association NOT NULL,
  remarks text,
  created timestamptz NOT NULL DEFAULT now(),
  modified timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organisation, case_study, association)
);
--;; Translations schema
--;;
CREATE TABLE IF NOT EXISTS case_study_translation (
  case_study_id INTEGER,
  translatable_field TEXT,
  language VARCHAR(3),
  value TEXT NOT NULL,
  PRIMARY KEY (case_study_id, translatable_field, language),
  FOREIGN KEY (case_study_id) REFERENCES case_study(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (language) REFERENCES language(iso_code) ON UPDATE CASCADE ON DELETE CASCADE
);
--;;
--;; Add additional topic type
ALTER TYPE topic_type
  ADD VALUE 'case_study';
--;;
COMMIT;