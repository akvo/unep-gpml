BEGIN;
--;;
ALTER TABLE country_group_country
DROP COLUMN id,
DROP CONSTRAINT country_group_country_country_fkey,
DROP CONSTRAINT country_group_country_country_group_fkey;
--;;
ALTER TABLE country_group_country
ADD CONSTRAINT country_group_country_pkey PRIMARY KEY (country, country_group),
ADD CONSTRAINT country_group_country_country_fkey FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
ADD CONSTRAINT country_group_country_country_group_fkey FOREIGN KEY (country_group) REFERENCES country_group(id) ON DELETE CASCADE;
--;;
ALTER TABLE organisation_geo_coverage
DROP COLUMN id,
DROP CONSTRAINT organisation_geo_coverage_country_fkey,
DROP CONSTRAINT organisation_geo_coverage_country_group_fkey,
DROP CONSTRAINT organisation_geo_coverage_organisation_fkey;
--;;
ALTER TABLE organisation_geo_coverage
ADD CONSTRAINT organisation_geo_coverage_pkey UNIQUE (organisation, country, country_group),
ADD CONSTRAINT organisation_geo_coverage_organisation_fkey FOREIGN KEY (organisation) REFERENCES organisation(id) ON DELETE CASCADE,
ADD CONSTRAINT organisation_geo_coverage_country_fkey FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
ADD CONSTRAINT organisation_geo_coverage_country_group_fkey FOREIGN KEY (country_group) REFERENCES country_group(id) ON DELETE CASCADE;
--;;
CREATE UNIQUE INDEX organisation_geo_coverage_organisation_country_idx ON organisation_geo_coverage (organisation, country) WHERE country_group IS NULL;
--;;
CREATE UNIQUE INDEX organisation_geo_coverage_organisation_country_group_idx ON organisation_geo_coverage (organisation, country_group) WHERE country IS NULL;
--;;
ALTER TABLE event_geo_coverage
DROP COLUMN id,
DROP CONSTRAINT event_geo_coverage_country_fkey,
DROP CONSTRAINT event_geo_coverage_country_group_fkey,
DROP CONSTRAINT event_geo_coverage_event_fkey;
--;;
ALTER TABLE event_geo_coverage
ADD CONSTRAINT event_geo_coverage_pkey UNIQUE (event, country, country_group),
ADD CONSTRAINT event_geo_coverage_country_fkey FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
ADD CONSTRAINT event_geo_coverage_country_group_fkey FOREIGN KEY (country_group) REFERENCES country_group(id) ON DELETE CASCADE,
ADD CONSTRAINT event_geo_coverage_event_fkey FOREIGN KEY (event) REFERENCES event(id) ON DELETE CASCADE;
--;;
CREATE UNIQUE INDEX event_geo_coverage_event_country_idx ON event_geo_coverage (event, country) WHERE country_group IS NULL;
--;;
CREATE UNIQUE INDEX event_geo_coverage_event_country_group_idx ON event_geo_coverage (event, country_group) WHERE country IS NULL;
--;;
ALTER TABLE initiative_geo_coverage
DROP COLUMN id,
DROP CONSTRAINT initiative_geo_coverage_country_fkey,
DROP CONSTRAINT initiative_geo_coverage_country_group_fkey,
DROP CONSTRAINT initiative_geo_coverage_initiative_fkey;
--;;
ALTER TABLE initiative_geo_coverage
ADD CONSTRAINT initiative_geo_coverage_pkey UNIQUE (initiative, country, country_group),
ADD CONSTRAINT initiative_geo_coverage_country_fkey FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
ADD CONSTRAINT initiative_geo_coverage_country_group_fkey FOREIGN KEY (country_group) REFERENCES country_group(id) ON DELETE CASCADE,
ADD CONSTRAINT initiative_geo_coverage_initiative_fkey FOREIGN KEY (initiative) REFERENCES initiative(id) ON DELETE CASCADE;
--;;
CREATE UNIQUE INDEX initiative_geo_coverage_initiative_country_idx ON initiative_geo_coverage (initiative, country) WHERE country_group IS NULL;
--;;
CREATE UNIQUE INDEX initiative_geo_coverage_initiative_country_group_idx ON initiative_geo_coverage (initiative, country_group) WHERE country IS NULL;
--;;
ALTER TABLE policy_geo_coverage
DROP COLUMN id,
DROP CONSTRAINT policy_geo_coverage_country_fkey,
DROP CONSTRAINT policy_geo_coverage_country_group_fkey,
DROP CONSTRAINT policy_geo_coverage_policy_fkey;
--;;
ALTER TABLE policy_geo_coverage
ADD CONSTRAINT policy_geo_coverage_pkey UNIQUE (policy, country, country_group),
ADD CONSTRAINT policy_geo_coverage_country_fkey FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
ADD CONSTRAINT policy_geo_coverage_country_group_fkey FOREIGN KEY (country_group) REFERENCES country_group(id) ON DELETE CASCADE,
ADD CONSTRAINT policy_geo_coverage_policy_fkey FOREIGN KEY (policy) REFERENCES policy(id) ON DELETE CASCADE;
--;;
CREATE UNIQUE INDEX policy_geo_coverage_policy_country_idx ON policy_geo_coverage (policy, country) WHERE country_group IS NULL;
--;;
CREATE UNIQUE INDEX policy_geo_coverage_policy_country_group_idx ON policy_geo_coverage (policy, country_group) WHERE country IS NULL;
--;;
ALTER TABLE resource_geo_coverage
DROP COLUMN id,
DROP CONSTRAINT resource_geo_coverage_country_fkey,
DROP CONSTRAINT resource_geo_coverage_country_group_fkey,
DROP CONSTRAINT resource_geo_coverage_resource_fkey;
--;;
ALTER TABLE resource_geo_coverage
ADD CONSTRAINT resource_geo_coverage_pkey UNIQUE (resource, country, country_group),
ADD CONSTRAINT resource_geo_coverage_country_fkey FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
ADD CONSTRAINT resource_geo_coverage_country_group_fkey FOREIGN KEY (country_group) REFERENCES country_group(id) ON DELETE CASCADE,
ADD CONSTRAINT resource_geo_coverage_resource_fkey FOREIGN KEY (resource) REFERENCES resource(id) ON DELETE CASCADE;
--;;
CREATE UNIQUE INDEX resource_geo_coverage_resource_country_idx ON resource_geo_coverage (resource, country) WHERE country_group IS NULL;
--;;
CREATE UNIQUE INDEX resource_geo_coverage_resource_country_group_idx ON resource_geo_coverage (resource, country_group) WHERE country IS NULL;
--;;
ALTER TABLE technology_geo_coverage
DROP COLUMN id,
DROP CONSTRAINT technology_geo_coverage_country_fkey,
DROP CONSTRAINT technology_geo_coverage_country_group_fkey,
DROP CONSTRAINT technology_geo_coverage_technology_fkey;
--;;
ALTER TABLE technology_geo_coverage
ADD CONSTRAINT technology_geo_coverage_pkey UNIQUE (technology, country, country_group),
ADD CONSTRAINT technology_geo_coverage_country_fkey FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
ADD CONSTRAINT technology_geo_coverage_country_group_fkey FOREIGN KEY (country_group) REFERENCES country_group(id) ON DELETE CASCADE,
ADD CONSTRAINT technology_geo_coverage_technology_fkey FOREIGN KEY (technology) REFERENCES technology(id) ON DELETE CASCADE;
--;;
CREATE UNIQUE INDEX technology_geo_coverage_technology_country_idx ON technology_geo_coverage (technology, country) WHERE country_group IS NULL;
--;;
CREATE UNIQUE INDEX technology_geo_coverage_technology_country_group_idx ON technology_geo_coverage (technology, country_group) WHERE country IS NULL;
--;;
COMMIT;
