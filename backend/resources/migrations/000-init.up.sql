CREATE OR REPLACE FUNCTION public.update_modified() RETURNS TRIGGER AS $$
    BEGIN
        NEW.modified = now();
        RETURN NEW;
    END
$$ LANGUAGE plpgsql;
-- ;;

CREATE OR REPLACE FUNCTION public.install_update_modified(t text)
  RETURNS void AS
$$
BEGIN
EXECUTE format('
        CREATE TRIGGER %I_modified
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE PROCEDURE update_modified();
        ', t, t);
END
$$ LANGUAGE plpgsql;
-- ;;

CREATE TABLE country (
  id serial NOT NULL PRIMARY KEY,
  name text NOT NULL UNIQUE,
  iso_code char(3) NULL
);

CREATE TYPE country_group_type AS
ENUM ('region', 'mea');

CREATE TABLE country_group (
  id serial NOT NULL PRIMARY KEY,
  name text NOT NULL UNIQUE,
  type country_group_type
);

CREATE TABLE country_group_countries (
  id serial NOT NULL PRIMARY KEY,
  country_group integer NOT NULL REFERENCES country_group(id),
  country integer NOT NULL REFERENCES country(id)
);

CREATE TABLE organisation (
   id serial NOT NULL PRIMARY KEY,
   name text NOT NULL UNIQUE,
   url text
);

CREATE TYPE geo_coverage_type AS
ENUM ('global', 'regional', 'national', 'transnational', 'sub-national', 'global with elements in specific areas');

CREATE TABLE currency (
   id serial NOT NULL PRIMARY KEY,
   name text NOT NULL UNIQUE,
   iso_code char(3) NOT NULL UNIQUE
);

CREATE TABLE resource (
  id serial NOT NULL PRIMARY KEY,
  title text,
  type text,
  publish_year smallint,
  summary text,
  value float,
  value_currency integer REFERENCES currency(id),
  image text,
  valid_from timestamptz,
  valid_to timestamptz,
  geo_coverage_type geo_coverage_type,
  attachments text[],
  remarks text,
  created timestamptz DEFAULT now(),
  modified timestamptz DEFAULT now()
);
-- ;;

DO $$
BEGIN
    PERFORM install_update_modified('resource');
END$$;
--;;


CREATE TABLE resource_organisation (
  id serial NOT NULL PRIMARY KEY,
  resource integer NOT NULL REFERENCES resource(id),
  organisation integer NOT NULL REFERENCES organisation(id),
  remarks text
);

CREATE TABLE tag_category (
  id serial NOT NULL PRIMARY KEY,
  category text NOT NULL UNIQUE
);

CREATE TABLE tag (
  id serial NOT NULL PRIMARY KEY,
  tag_category integer NOT NULL REFERENCES tag_category(id),
  tag text NOT NULL
);

CREATE TABLE resource_tag (
  id serial NOT NULL PRIMARY KEY,
  resource integer NOT NULL REFERENCES resource(id),
  tag integer NOT NULL REFERENCES tag(id)
);

CREATE TABLE language (
  id serial NOT NULL PRIMARY KEY,
  english_name text NOT NULL UNIQUE,
  native_name text NOT NULL,
  iso_code varchar(3) NOT NULL UNIQUE
);

CREATE TABLE resource_language_url (
  id serial NOT NULL PRIMARY KEY,
  resource integer NOT NULL REFERENCES resource(id),
  language integer NOT NULL REFERENCES language(id),
  url text
);

CREATE TABLE resource_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  resource integer NOT NULL REFERENCES resource(id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE resource_geo_coverage
ADD CONSTRAINT country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);

CREATE TABLE stakeholder (
  id serial NOT NULL PRIMARY KEY,
  picture text,
  title text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  affiliation integer REFERENCES organisation(id),
  email text NOT NULL UNIQUE,
  linkedin text,
  twitter text,
  url text,
  country integer REFERENCES country(id),
  representation text NOT NULL,  -- FIXME: Should this be another table/type?
  summary text,
  geo_coverage_type geo_coverage_type,
  created timestamptz DEFAULT now(),
  modified timestamptz DEFAULT now()
);
-- ;;

DO $$
BEGIN
    PERFORM install_update_modified('stakeholder');
END$$;
--;;

CREATE TABLE stakeholder_tag (
  id serial NOT NULL PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  tag integer NOT NULL REFERENCES tag(id)
);

CREATE TABLE stakeholder_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  stakeholder integer NOT NULL REFERENCES stakeholder(id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE stakeholder_geo_coverage
ADD CONSTRAINT check_country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);


CREATE TABLE event (
  id serial NOT NULL PRIMARY KEY,
  title text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  description text NOT NULL,
  image text,
  geo_coverage_type geo_coverage_type,
  remarks text,
  created timestamptz DEFAULT now(),
  modified timestamptz DEFAULT now()
);
-- ;;

DO $$
BEGIN
    PERFORM install_update_modified('event');
END$$;
--;;


CREATE TABLE event_tag (
  id serial NOT NULL PRIMARY KEY,
  event integer NOT NULL REFERENCES event(id),
  tag integer NOT NULL REFERENCES tag(id)
);

CREATE TABLE event_language_url (
  id serial NOT NULL PRIMARY KEY,
  event integer NOT NULL REFERENCES event(id),
  language integer NOT NULL REFERENCES language(id),
  url text
);

CREATE TABLE event_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  event integer NOT NULL REFERENCES event(id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE event_geo_coverage
ADD CONSTRAINT check_country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);

CREATE TABLE policy (
  id serial NOT NULL PRIMARY KEY,
  title text,
  original_title text,
  data_source text,
  country integer REFERENCES country(id),
  abstract text,
  type_of_law text,
  record_number text,
  implementing_mea integer NOT NULL REFERENCES country_group(id),
  first_publication_date timestamptz,
  latest_amendment_date timestamptz,
  status text,
  geo_coverage_type geo_coverage_type,
  attachments text[],
  remarks text,
  created timestamptz DEFAULT now(),
  modified timestamptz DEFAULT now()
);
-- ;;

DO $$
BEGIN
    PERFORM install_update_modified('policy');
END$$;
--;;


CREATE TABLE policy_tag (
  id serial NOT NULL PRIMARY KEY,
  policy integer NOT NULL REFERENCES policy(id),
  tag integer NOT NULL REFERENCES tag(id)
);

CREATE TABLE policy_language_url (
  id serial NOT NULL PRIMARY KEY,
  policy integer NOT NULL REFERENCES policy(id),
  language integer NOT NULL REFERENCES language(id),
  url text
);

CREATE TABLE policy_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  policy integer NOT NULL REFERENCES policy(id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE policy_geo_coverage
ADD CONSTRAINT check_country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);

CREATE TABLE technology (
  id serial NOT NULL PRIMARY KEY,
  name text,
  year_founded smallint,
  country integer REFERENCES country(id),
  organisation_type text,
  development_stage text,
  specifications_provided boolean,
  email text,
  geo_coverage_type geo_coverage_type,
  attachments text[],
  remarks text,
  created timestamptz DEFAULT now(),
  modified timestamptz DEFAULT now()
);
-- ;;

DO $$
BEGIN
    PERFORM install_update_modified('technology');
END$$;
--;;

CREATE TABLE technology_tag (
  id serial NOT NULL PRIMARY KEY,
  technology integer NOT NULL REFERENCES technology(id),
  tag integer NOT NULL REFERENCES tag(id)
);

CREATE TABLE technology_language_url (
  id serial NOT NULL PRIMARY KEY,
  technology integer NOT NULL REFERENCES technology(id),
  language integer NOT NULL REFERENCES language(id),
  url text
);

CREATE TABLE technology_geo_coverage (
  id serial NOT NULL PRIMARY KEY,
  technology integer NOT NULL REFERENCES technology (id),
  country_group integer REFERENCES country_group(id),
  country integer REFERENCES country(id)
);
ALTER TABLE technology_geo_coverage
ADD CONSTRAINT check_country_or_group_not_null CHECK (num_nonnulls(country_group, country) = 1);
